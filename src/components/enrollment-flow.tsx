"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useEnrollment, type ServiceType } from "@/contexts/enrollment-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceSelection from "./steps/service-selection";
import ChildInfo from "./steps/child-info";
import SubjectsSchedule from "./steps/subjects-schedule";
import { ROUTES } from "@/config/routes";
import { ToastError, ToastSuccess } from "./ui/custom/toast";
import EnrollmentReview from "./steps/review";
import { GetServicesAction } from "@/server/service-catalog";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { EnrollmentStatus } from "@/types/student";
import { VerifyPaymentAction } from "@/server/payment";
import PaymentConsentModal from "./payment-consent-modal";

const steps = [
  { id: 1, title: "Service Selection", component: ServiceSelection },
  { id: 2, title: "Child Information", component: ChildInfo },
  { id: 3, title: "Subjects & Schedule", component: SubjectsSchedule },
  { id: 4, title: "Review & Submit", component: EnrollmentReview },
];

interface EnrollmentFlowProps {
  // Set when embedded under a role-specific LMS route - see ChildInfo step
  // for how this hides the "who is signing up" toggle.
  forcedUserType?: "parent" | "student";
  // Where "Cancel" and the post-payment redirect should land. Both default
  // to the legacy /dashboard targets so the /dashboard/enroll redirect shim
  // (which still renders this component while redirecting) keeps working.
  dashboardPath?: string;
  paymentHistoryPath?: string;
}

export default function EnrollmentFlow({ forcedUserType, dashboardPath, paymentHistoryPath }: EnrollmentFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const continueId = searchParams.get("continue");

  const { currentStep, setCurrentStep, isLoading, saveEnrollment, loadEnrollment, enrollmentData, updateChildInfo, updateServiceDetails, updateSelectedService } =
    useEnrollment();

  const stepMap: Record<string, number> = {
    service: 0,
    role: 1,
    child: 2,
    subjects: 3,
    review: 4,
    // payment: 5,
  };

  // Waits for a `continue=<id>` draft to actually finish loading before the
  // `?step=` deep link is allowed to jump the wizard to that step. Without
  // this, "Continue Registration" (which sets both `continue` and
  // `step=subjects` at once - see enrollment-list.tsx) jumped straight to
  // Subjects & Schedule on the very first render, before loadEnrollment
  // below had resolved - that step's local state (serviceData, schedule,
  // Country/Curriculum/Category selections) is seeded from enrollmentData
  // only once, at mount, via useState, so it silently mounted with
  // everything blank and never picked up the draft once it did load a
  // moment later. That's what looked like "Education Level not loading"
  // (really: the whole draft's country/curriculum path never restored).
  const [continueLoadDone, setContinueLoadDone] = useState(false);

  useEffect(() => {
    if (!continueLoadDone) return;
    const step = searchParams.get("step");
    if (step && stepMap[step] !==undefined) {
      setCurrentStep(stepMap[step]);
    }
  },[searchParams,setCurrentStep,continueLoadDone]);

  // Pre-select a service from a `?service=<slug>` deep link (e.g. the public
  // marketing pages' Register card) and skip straight to Child Info, since
  // the service is already decided. Looks the slug up against the live
  // service catalog (GET /api/public/services) rather than the old
  // hardcoded SERVICE_TYPE_LABELS map, so newly added services work too.
  // Skips the step-jump when prefillChildId is also present (Marketplace's
  // "no courses, continue to full enrollment" link sets both) - that flow
  // owns which step to land on, since it also has Child Info to pre-fill.
  useEffect(() => {
    const presetService = searchParams.get("service") as ServiceType | null;
    if (!presetService || enrollmentData.serviceDetails?.serviceType) return;
    GetServicesAction().then(([res]) => {
      const service = res?.data?.find((s) => s.slug === presetService);
      if (service) {
        updateServiceDetails({ serviceType: service.slug, learningFocus: service.serviceName });
        updateSelectedService(service);
        if (!searchParams.get("prefillChildId")) setCurrentStep(2);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPaymentConsent, setShowPaymentConsent] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load existing enrollment if continuing
  useEffect(() => {
    if (!continueId) {
      setContinueLoadDone(true);
      return;
    }
    if (!isClient) return;
    loadEnrollment(continueId).finally(() => setContinueLoadDone(true));
  }, [continueId, loadEnrollment, isClient]);

  // Deep link from Marketplace: a parent picked an already-enrolled child
  // and a service that turned out to have no published courses, so instead
  // of dead-ending there they land here to go through the full
  // service/schedule flow for that child. Deliberately NOT `continue=` -
  // that path (loadEnrollment above) sets enrollmentData.id, which makes
  // saveEnrollment *finalize* the existing (already-enrolled) Student record
  // instead of creating a new one, silently overwriting their current
  // service with this new one. This only pre-fills Child Info from the
  // existing record and always creates a fresh enrollment on submit, so the
  // child ends up with two separate service enrollments, same as picking a
  // course in Marketplace would have produced.
  const prefillChildId = searchParams.get("prefillChildId");
  const prefillServiceSlug = searchParams.get("service");
  useEffect(() => {
    if (!prefillChildId || !isClient || enrollmentData.childInfo?.fullName) return;
    GetLinkedStudentsAction().then(([res]) => {
      const list = res?.data ?? [];
      const match = list.find((s) => s.id === prefillChildId);
      if (!match) return;

      // A previous attempt at enrolling this same child in this same
      // service may already have been autosaved as a draft (e.g. the parent
      // backed out or hit an error partway through and came back to this
      // same Marketplace link) - resume that record instead of prefilling a
      // brand-new one. Without this, every retry spawns another separate
      // Student row that shows up as a whole new "child" in the dashboard/
      // child switcher, since saveEnrollment's autosave always creates a
      // fresh Student the first time enrollmentData.id is empty.
      const existingDraft = prefillServiceSlug
        ? list.find(
            (s) =>
              s.id !== match.id &&
              s.fullName.trim().toLowerCase() === match.fullName.trim().toLowerCase() &&
              s.serviceDetails?.serviceType === prefillServiceSlug &&
              (s.enrollmentStatus === EnrollmentStatus.DRAFT || s.enrollmentStatus === EnrollmentStatus.PENDING)
          )
        : undefined;

      if (existingDraft) {
        loadEnrollment(existingDraft.id);
        setCurrentStep(3);
        return;
      }

      updateChildInfo({
        userType: "parent",
        fullName: match.fullName,
        gender: match.gender || "",
        dateOfBirth: match.dateOfBirth ? new Date(match.dateOfBirth).toISOString().slice(0, 10) : "",
        phone: match.phone || "",
        countryOfResidence: match.countryOfResidence || "",
        primaryLanguage: match.primaryLanguage || "",
        parentName: match.parentName,
        parentPhone: match.parentPhone,
        parentEmail: match.parentEmail,
      });
      setCurrentStep(3);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillChildId, isClient]);

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const handleNext = async () => {
    if (currentStep === steps.length) {
      // Show the brief cancellation/privacy/tutor-contact consent pop-up
      // before actually saving and opening Paystack - submitAndPay runs the
      // logic that used to live directly here once the parent agrees.
      setShowPaymentConsent(true);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const submitAndPay = async () => {
    setShowPaymentConsent(false);
    setIsSaving(true);
    try {
      const result = await saveEnrollment();
      if (result.success && result.data) {
        setErrors({});
        // Task 3/5 - a cohort/group placement can land the student on a
        // waitlist instead of a confirmed seat; payment is still initiated
        // either way, but call that out distinctly rather than implying a
        // guaranteed spot.
        if (result.data.student?.enrollmentStatus === EnrollmentStatus.WAITLISTED) {
          ToastSuccess("You've been placed on a waitlist until a seat opens up. You can still complete payment now to hold your spot.");
        }
        const { default: PaystackPop } = await import("@paystack/inline-js");
        const popup = new PaystackPop();
        popup.resumeTransaction(result.data.payment.access_code, {
          onSuccess: async () => {
            // Paystack's own popup reporting success doesn't mean our
            // backend has heard about it yet - that only happens via
            // Paystack's webhook, which may be slow, misconfigured, or
            // (in local dev) unreachable entirely. Verify directly so the
            // enrollment doesn't sit at "Pending" despite being paid.
            await VerifyPaymentAction(result.data!.payment.reference);
            ToastSuccess("Enrollment successful");
            router.push(paymentHistoryPath || ROUTES.DASHBOARD.PAYMENT_HISTORY);
          },
          onCancel: () => {
            ToastError("Payment was not completed. You can finish it anytime from Payment History.");
            router.push(paymentHistoryPath || ROUTES.DASHBOARD.PAYMENT_HISTORY);
          },
          onError: (error) => {
            ToastError(error?.message || "Payment failed. Please try again.");
          },
        });
      } else {
        ToastError(result.error || "Failed to save enrollment");
      }
    } catch (error) {
      ToastError("An unexpected error occurred while saving enrollment");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleStepValidation = (stepErrors: Record<string, string>) => {
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (isClient && typeof window !== "undefined") {
      const event = new CustomEvent("validateStep");
      window.dispatchEvent(event);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="w-full flex-1 bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {continueId ? "Continue Enrollment" : "Enroll Your Child"}
            </h1>
            <Button
              variant="ghost"
              onClick={() => router.push(dashboardPath || ROUTES.DASHBOARD.HOME)}
              className="text-gray-600"
            >
              Cancel
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{currentStepData?.title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentStepData?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {!continueLoadDone ? (
              <p className="text-sm text-gray-500 py-8 text-center">Loading your enrollment...</p>
            ) : (
              CurrentStepComponent && (
                <CurrentStepComponent onNext={handleStepValidation} errors={errors} forcedUserType={forcedUserType} />
              )
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading || isSaving}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button onClick={handleSubmit} disabled={isLoading || isSaving} className="flex items-center space-x-2">
            <span>{currentStep === steps.length ? (isSaving ? "Saving..." : "Save & Continue") : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {errors.save && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.save}</p>
          </div>
        )}
      </div>

      <PaymentConsentModal
        open={showPaymentConsent}
        onOpenChange={setShowPaymentConsent}
        onAgree={submitAndPay}
        isSubmitting={isSaving}
      />
    </div>
  );
}
