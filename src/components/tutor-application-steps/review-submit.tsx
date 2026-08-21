"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/tutor-applications/field-display";
import { ToastError } from "@/components/ui/custom/toast";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { GetTutorApplicationDraftAction } from "@/server/tutor-application";
import { renderTutorField, TUTOR_FIELD_REGISTRY, TUTOR_FIELD_STEPS } from "@/lib/tutor-field-registry";
import { TutorApplication } from "@/types/tutor-application";

// tutor-registration-schema.json's final step (stepId "review_submit") -
// "Not a flat read-only summary - every section must be individually
// editable directly from this screen." Built from TUTOR_FIELD_REGISTRY, the
// same source FullApplicationDetails (admin) and MyApplicationRecord (tutor
// profile) use, so this can't silently show something different from what
// those two actually resolve.
export default function ReviewSubmitStep() {
  const { draft, goToStep, finalizeSubmission, isSubmitting } = useTutorApplication();
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!draft.applicationId || !draft.draftToken) {
        setIsLoading(false);
        return;
      }
      const [res] = await GetTutorApplicationDraftAction(draft.applicationId, draft.draftToken);
      setApplication(res?.data ?? null);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const result = await finalizeSubmission();
    if (!result.success) {
      ToastError(result.error || "Something went wrong - please try again");
    }
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading your application...</p>;
  if (!application) return <p className="text-sm text-red-600">Could not load your application - please try again.</p>;

  return (
    <div className="space-y-6 w-full">
      <p className="text-sm text-gray-600">
        Review everything below before submitting. Use "Edit" on any section to jump straight back into it - your other
        answers are kept.
      </p>

      {TUTOR_FIELD_STEPS.map(({ stepId, stepTitle }) => {
        const fields = TUTOR_FIELD_REGISTRY.filter((f) => f.stepId === stepId);
        const rendered = fields.map((entry) => ({ entry, value: renderTutorField(entry, application) }));
        return (
          <Card key={stepId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{stepTitle}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => goToStep(stepId)}>
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {rendered.every((r) => r.value === null) ? (
                <p className="text-sm text-gray-400">Nothing entered yet.</p>
              ) : (
                <dl>
                  {rendered.map(({ entry, value }) => (
                    <Field key={entry.id} label={entry.label} value={value} />
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => goToStep(11)} disabled={isSubmitting}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
