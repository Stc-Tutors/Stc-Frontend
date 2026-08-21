"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { TutorApplicationStatus } from "@/types/tutor-application";
import { FLAGGABLE_FIELDS_BY_ID } from "@/lib/tutor-application-fields";
import ServicesStep from "@/components/tutor-application-steps/services";
import PersonalInformationStep from "@/components/tutor-application-steps/personal-information";
import ProfessionalExperienceStep from "@/components/tutor-application-steps/professional-experience";
import TeachingDetailsStep from "@/components/tutor-application-steps/teaching-details";
import DocumentsStep from "@/components/tutor-application-steps/documents";
import TechnicalReadinessStep from "@/components/tutor-application-steps/technical-readiness";
import AvailabilityStep from "@/components/tutor-application-steps/availability";
import EvaluationStep from "@/components/tutor-application-steps/evaluation";
import FinalEvaluationStep from "@/components/tutor-application-steps/final-evaluation";
import PaymentReferralStep from "@/components/tutor-application-steps/payment-referral";
import AgreementsStep from "@/components/tutor-application-steps/agreements";
import ReviewSubmitStep from "@/components/tutor-application-steps/review-submit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StepComponent = React.ComponentType<{ onNext: (errors: Record<string, string>, data?: any) => void; errors: Record<string, string> }>;

const STEPS: { id: number; title: string; component: StepComponent }[] = [
  { id: 1, title: "What You Can Teach", component: ServicesStep },
  { id: 2, title: "Personal Information", component: PersonalInformationStep },
  { id: 3, title: "Professional Experience", component: ProfessionalExperienceStep },
  { id: 4, title: "What You Can Teach - Details", component: TeachingDetailsStep },
  { id: 5, title: "Supporting Documents", component: DocumentsStep },
  { id: 6, title: "Technical Readiness", component: TechnicalReadinessStep },
  { id: 7, title: "Availability", component: AvailabilityStep },
  { id: 8, title: "Psychometric Evaluation", component: EvaluationStep },
  { id: 9, title: "Final Evaluation", component: FinalEvaluationStep },
  { id: 10, title: "Payment & Referral", component: PaymentReferralStep },
  { id: 11, title: "Agreements & Consent", component: AgreementsStep },
  // Not a normal DTO-submitting step (no onNext/errors) - rendered as a
  // special case below, not via CurrentStepComponent. Kept in STEPS so
  // "Step X of 12" / the progress bar account for it.
  { id: 12, title: "Review & Submit", component: ReviewSubmitStep as unknown as StepComponent },
];

export default function TutorApplicationFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    draft,
    isLoading,
    isSubmitting,
    setServicesOffered,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep4,
    submitStep5,
    submitStep6,
    submitStep7,
    submitStep8,
    submitStep9,
    submitStep10,
    submitResubmit,
    goToStep,
  } = useTutorApplication();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditingFlagged = draft.applicationStatus === TutorApplicationStatus.NEEDS_MORE_INFO;

  // Jump straight to the flagged step the tutor clicked "Edit this section"
  // for on the status page, instead of wherever the normal resume logic
  // would land (see tutor-application-context.tsx's resume effect). Only
  // once, right after the draft finishes loading.
  const hasAppliedEditStep = useRef(false);
  useEffect(() => {
    if (isLoading || hasAppliedEditStep.current) return;
    hasAppliedEditStep.current = true;
    const editStep = Number(searchParams.get("editStep"));
    if (editStep >= 1 && editStep <= STEPS.length) {
      goToStep(editStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Step 12 (Review & Submit) flips draft.submitted via finalizeSubmission -
  // navigate away once that happens, same as the old single-step-11 submit
  // used to do inline.
  useEffect(() => {
    if (draft.submitted) {
      router.push("/auth/tutor-application-status");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.submitted]);

  const currentStepData = STEPS.find((s) => s.id === draft.currentStep);
  const CurrentStepComponent = currentStepData?.component;
  const progress = (draft.currentStep / STEPS.length) * 100;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepValidation = async (stepErrors: Record<string, string>, data?: any) => {
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    // Step 1 (Services) doesn't hit the API - it just stashes data locally,
    // then step 2 (Personal Information) sends both together as one
    // StartTutorApplicationAction call. See setServicesOffered.
    const submitters: Record<number, (d: any) => Promise<{ success: boolean; error?: string }> | void> = {
      1: (d) => setServicesOffered(d.servicesOffered),
      2: submitStep1,
      3: submitStep2,
      4: submitStep3,
      5: submitStep4,
      6: submitStep5,
      7: submitStep6,
      8: submitStep7,
      9: submitStep8,
      10: submitStep9,
      11: submitStep10,
    };

    const result = await submitters[draft.currentStep]?.(data);
    if (result && !result.success) {
      ToastError(result.error || "Something went wrong - please try again");
      return;
    }
    // Step 12 (Review & Submit) redirects itself once finalizeSubmission
    // succeeds - see review-submit.tsx. Nothing to do here for it.
  };

  const handleNext = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("validateStep"));
    }
  };

  const handlePrevious = () => {
    if (draft.currentStep > 1) {
      goToStep(draft.currentStep - 1);
      setErrors({});
    }
  };

  const handleResubmit = async () => {
    const result = await submitResubmit();
    if (!result.success) {
      ToastError(result.error || "Something went wrong - please try again");
      return;
    }
    ToastSuccess("Application resubmitted - our team will take another look.");
    router.push("/auth/tutor-application-status");
  };

  if (isLoading) {
    return <p className="text-center py-12 text-gray-500">Loading...</p>;
  }

  if (draft.submitted) {
    return null;
  }

  return (
    <div className="w-full flex-1 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditingFlagged ? "Update Your Application" : "Tutor Registration"}
            </h1>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {draft.currentStep} of {STEPS.length}
              </span>
              <span>{currentStepData?.title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {isEditingFlagged && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center gap-2 text-orange-800 font-medium text-sm">
                <AlertCircle className="h-4 w-4" />
                Our team asked for a few updates
              </div>
              {draft.needsMoreInfoNote && <p className="text-sm text-orange-800">{draft.needsMoreInfoNote}</p>}
              {draft.flaggedFields && draft.flaggedFields.length > 0 && (
                <ul className="text-sm text-orange-800 list-disc list-inside">
                  {draft.flaggedFields.map((fieldId) => {
                    const field = FLAGGABLE_FIELDS_BY_ID[fieldId];
                    return (
                      <li key={fieldId}>
                        {field ? `${field.label} (${field.stepTitle})` : fieldId}
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="text-xs text-orange-700">
                Update whatever needs fixing, then use &quot;Resubmit for Review&quot; below - you don&apos;t need to redo the whole form.
              </p>
            </CardContent>
          </Card>
        )}

        {draft.currentStep === 12 ? (
          <ReviewSubmitStep />
        ) : (
          CurrentStepComponent && <CurrentStepComponent onNext={handleStepValidation} errors={errors} />
        )}

        {draft.currentStep !== 12 && (
        <div className="flex justify-between mt-6 gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={draft.currentStep === 1 || isSubmitting}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-3">
            {isEditingFlagged && (
              <Button
                variant="secondary"
                onClick={handleResubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <span>{isSubmitting ? "Resubmitting..." : "Resubmit for Review"}</span>
              </Button>
            )}
            {!isEditingFlagged && (
              <Button onClick={handleNext} disabled={isSubmitting} className="flex items-center space-x-2">
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {isEditingFlagged && draft.currentStep < STEPS.length - 1 && draft.currentStep !== 2 && (
              <Button variant="outline" onClick={handleNext} disabled={isSubmitting} className="flex items-center space-x-2">
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
