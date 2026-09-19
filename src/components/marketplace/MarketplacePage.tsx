"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChildSwitcherDropdown } from "@/components/child-switcher-dropdown";
import { useSelectedStudent } from "@/contexts/selected-student-context";
import { useUser } from "@/contexts/user-context";
import { UserRole } from "@/types/user";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { ROUTES } from "@/config/routes";

import { GetServicesAction } from "@/server/service-catalog";
import { IService } from "@/types/service-catalog";
import { GetCoursesAction } from "@/server/course";
import { Course } from "@/types/course";
import { QuotePricingAction } from "@/server/pricing";
import { PricingQuote } from "@/types/pricing";
import { EnrollInCourseAction } from "@/server/course-enrollment";
import { InitiatePaymentAction, VerifyPaymentAction } from "@/server/payment";
import { RedeemPaymentBypassTokenAction } from "@/server/enrollment";
import PaymentConsentModal from "@/components/payment-consent-modal";

// Lets a parent (or a self-registered student, who is effectively their own
// parent - see stcbe's isParentRegisteredChild) add a new course/service to
// an EXISTING enrollment record (as opposed to /enrollment/new, which
// registers a brand-new one). Steps: pick who this is for (shared
// SelectedStudentProvider/ChildSwitcherDropdown), pick a published service +
// course (GetCoursesAction filtered by serviceType, mirroring the Path C
// "Select a Course" cards in components/steps/subjects-schedule.tsx), get a
// live price (QuotePricingAction - the same server-authoritative quote the
// enrollment wizard ultimately trusts over any client-side estimate), then
// EnrollInCourseAction + InitiatePaymentAction. Rendered from both
// /lms-home/parent/marketplace and /lms-home/student/marketplace (the latter
// only reachable by a self-registered student, not a parent-created child
// login - see student/layout.tsx's sidebarLinks gating).
export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useUser();
  const { students, selectedStudent, isLoading: studentsLoading } = useSelectedStudent();

  // A self-registered adult student has no parent and is browsing the
  // Marketplace for themselves, not a "child" - only cosmetic (copy/empty
  // state/redirect target below), the underlying data flow is identical.
  const isSelfRegisteredStudent = user?.role === UserRole.STUDENT && !!user.email && !user.studentId;

  const [services, setServices] = useState<IService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentConsent, setShowPaymentConsent] = useState(false);
  const [bypassCode, setBypassCode] = useState("");

  const selectedService = services.find((s) => s.slug === selectedSlug) ?? null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;

  // Guards against out-of-order responses (e.g. user picks course A then B
  // before A's quote resolves) - only the latest request's response is applied.
  const coursesRequestRef = useRef(0);
  const quoteRequestRef = useRef(0);

  useEffect(() => {
    GetServicesAction().then(([res]) => {
      setServices(res?.data ?? []);
      setServicesLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      setCourses([]);
      setCoursesLoading(false);
      return;
    }
    const requestId = ++coursesRequestRef.current;
    GetCoursesAction({ serviceType: selectedSlug }).then(([res]) => {
      if (coursesRequestRef.current !== requestId) return; // a newer service was selected meanwhile
      setCourses(res?.data ?? []);
      setCoursesLoading(false);
    });
  }, [selectedSlug]);

  // Live quote, re-fetched every time the course selection narrows -
  // PricingService.getQuote is the backend's authoritative price, only used
  // here for display/what-we're-about-to-charge; the course's own
  // price/currency is the fallback if a quote can't be resolved (e.g. no
  // pricing row configured yet for this course).
  useEffect(() => {
    if (!selectedCourse || !selectedService) {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }
    const requestId = ++quoteRequestRef.current;
    QuotePricingAction({ serviceType: selectedService.slug, courseId: selectedCourse.id }).then(([res, error]) => {
      if (quoteRequestRef.current !== requestId) return; // a newer course was selected meanwhile
      if (error || !res?.data) {
        setQuoteError(error || "Couldn't fetch a live quote - showing the course's listed price instead.");
        setQuote(null);
      } else {
        setQuote(res.data);
      }
      setQuoteLoading(false);
    });
  }, [selectedCourse, selectedService]);

  const displayAmount = quote?.amount ?? selectedCourse?.price ?? 0;
  const displayCurrency = quote?.currency ?? selectedCourse?.currency ?? "NGN";

  const paymentsPath = isSelfRegisteredStudent ? "/lms-home/student/payments" : "/lms-home/parent/payments";

  const handleConfirm = async () => {
    if (!selectedStudent || !selectedCourse || !selectedService) return;

    setShowPaymentConsent(false);
    setIsSubmitting(true);
    try {
      const [enrollRes, enrollError] = await EnrollInCourseAction(selectedCourse.id, selectedStudent.id);
      if (enrollError || !enrollRes?.data) {
        ToastError(enrollError || "Failed to add this course");
        return;
      }

      if (displayAmount > 0 && bypassCode.trim()) {
        const [, redeemError] = await RedeemPaymentBypassTokenAction(selectedStudent.id, bypassCode.trim());
        if (redeemError) {
          ToastError(redeemError);
          router.push(paymentsPath);
          return;
        }
        ToastSuccess(`${selectedCourse.title} added - payment waived with your bypass code`);
        setSelectedCourseId("");
        setQuote(null);
        setBypassCode("");
        return;
      }

      if (displayAmount > 0) {
        const [payRes, payError] = await InitiatePaymentAction({
          student: selectedStudent.id,
          amount: displayAmount,
          currency: displayCurrency,
          description: `${selectedService.serviceName}: ${selectedCourse.title}`,
          serviceType: selectedService.slug,
          metadata: { courseId: selectedCourse.id },
        });

        if (payError || !payRes?.data) {
          ToastError(payError || "Course added, but payment couldn't be started. Complete it from Payments.");
          router.push(paymentsPath);
          return;
        }

        // Wallet balance covered the full amount - the backend already
        // completed the payment and applied enrollment side effects, so
        // there's no Paystack transaction to open at all.
        if (payRes.data.fullyCoveredByWallet) {
          ToastSuccess("Paid from your wallet balance - course added");
          router.push(paymentsPath);
          return;
        }

        // Mirrors the resume-transaction pattern already used to complete
        // checkout after enrollment-flow.tsx's saveEnrollment (see
        // handleNext there) rather than a raw redirect, so the parent gets
        // the same in-app Paystack popup everywhere in this app.
        const { default: PaystackPop } = await import("@paystack/inline-js");
        const popup = new PaystackPop();
        popup.resumeTransaction(payRes.data.access_code, {
          onSuccess: async () => {
            // Don't rely solely on Paystack's webhook reaching the backend -
            // see enrollment-flow.tsx's onSuccess for the same reasoning.
            await VerifyPaymentAction(payRes.data!.reference);
            ToastSuccess("Payment successful - course added");
            router.push(paymentsPath);
          },
          onCancel: () => {
            ToastError("Payment was not completed. You can finish it anytime from Payments.");
            router.push(paymentsPath);
          },
          onError: (error) => {
            ToastError(error?.message || "Payment failed. Please try again.");
          },
        });
      } else {
        ToastSuccess(`${selectedCourse.title} added to ${selectedStudent.fullName}'s enrollments`);
        setSelectedCourseId("");
        setQuote(null);
      }
    } catch (error) {
      ToastError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentsLoading && students.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-gray-400" />
          <p className="text-gray-600">
            {isSelfRegisteredStudent
              ? "Complete your first enrollment before browsing more services to add."
              : "Add a child before browsing services to enroll them in."}
          </p>
          <Button
            onClick={() =>
              router.push(isSelfRegisteredStudent ? ROUTES.LMS.STUDENT.ENROLLMENT : ROUTES.LMS.PARENT.ADD_CHILD)
            }
          >
            <UserPlus className="w-4 h-4 mr-2" /> {isSelfRegisteredStudent ? "Start Enrollment" : "Add Child"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Marketplace</h1>
          <p className="text-gray-500 text-sm">
            {isSelfRegisteredStudent
              ? "Browse services and add courses to your enrollments."
              : "Browse services and add courses to your child's enrollments."}
          </p>
        </div>
        {!isSelfRegisteredStudent && (
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
            <span className="text-sm text-gray-500">Shopping for</span>
            <ChildSwitcherDropdown />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Choose a service</CardTitle>
        </CardHeader>
        <CardContent>
          {servicesLoading && <p className="text-sm text-gray-500">Loading services...</p>}
          {!servicesLoading && services.length === 0 && (
            <p className="text-sm text-gray-500">No services available right now.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  // Reset every downstream step synchronously, in the same render as the
                  // selection change, so Steps 2/3 never paint the previous service's
                  // stale courses/quote before the new fetch resolves.
                  setSelectedSlug(service.slug);
                  setCourses([]);
                  setCoursesLoading(true);
                  setSelectedCourseId("");
                  setQuote(null);
                  setQuoteError(null);
                }}
                className={`text-left border-2 rounded-lg p-4 transition-colors ${
                  selectedSlug === service.slug ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">{service.serviceName}</p>
                {service.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSlug && (
        <Card>
          <CardHeader>
            <CardTitle>2. Choose a course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coursesLoading && (
              <div className="grid gap-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}
            {!coursesLoading && courses.length === 0 && (
              <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <p>
                  This service isn&apos;t offered as individual courses - it goes through our full subject &amp;
                  schedule enrollment instead.
                </p>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      isSelfRegisteredStudent
                        ? `/lms-home/student/enrollment/new?service=${selectedSlug}`
                        : `/lms-home/parent/enrollment/new?prefillChildId=${selectedStudent?.id}&service=${selectedSlug}`
                    )
                  }
                  disabled={!isSelfRegisteredStudent && !selectedStudent}
                >
                  Continue enrollment for {isSelfRegisteredStudent ? "yourself" : (selectedStudent?.fullName ?? "this child")}
                </Button>
              </div>
            )}
            <div className="grid gap-3">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className={`flex items-start justify-between border rounded-lg p-3 cursor-pointer ${
                    selectedCourseId === course.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="course"
                      className="mt-1"
                      checked={selectedCourseId === course.id}
                      onChange={() => {
                        // Same reasoning as the service click handler: clear the old
                        // quote and flag loading synchronously so Step 3 shows a
                        // skeleton/spinner instead of the previous course's price.
                        setSelectedCourseId(course.id);
                        setQuote(null);
                        setQuoteError(null);
                        setQuoteLoading(true);
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      {course.subtitle && <p className="text-sm text-gray-600">{course.subtitle}</p>}
                    </div>
                  </div>
                  <p className="font-semibold text-green-700 whitespace-nowrap">
                    {course.currency ?? "NGN"} {course.price?.toLocaleString()}
                  </p>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>3. Confirm &amp; pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50">
              <div>
                <p className="text-sm text-gray-500">Enrolling</p>
                <p className="font-medium text-gray-900">{selectedStudent?.fullName}</p>
                <p className="text-sm text-gray-500 mt-2">{selectedCourse.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Price</p>
                {quoteLoading ? (
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-6 w-24" />
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Fetching live quote...
                    </p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-gray-900">
                    {displayCurrency} {displayAmount.toLocaleString()}
                  </p>
                )}
                {quoteError && <p className="text-xs text-amber-600 mt-1 max-w-xs">{quoteError}</p>}
              </div>
            </div>

            {displayAmount > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Have a payment bypass code? (optional)</p>
                <Input
                  placeholder="Bypass code"
                  value={bypassCode}
                  onChange={(e) => setBypassCode(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            )}

            <Button
              onClick={() => (displayAmount > 0 && !bypassCode.trim() ? setShowPaymentConsent(true) : handleConfirm())}
              disabled={isSubmitting || quoteLoading || !selectedStudent}
              className="w-full md:w-auto"
            >
              {isSubmitting
                ? "Processing..."
                : displayAmount > 0 && !bypassCode.trim()
                ? "Confirm & Pay"
                : "Confirm & Add Course"}
            </Button>
          </CardContent>
        </Card>
      )}

      <PaymentConsentModal
        open={showPaymentConsent}
        onOpenChange={setShowPaymentConsent}
        onAgree={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
