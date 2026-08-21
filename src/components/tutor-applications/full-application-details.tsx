"use client";

import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import { Field, Section } from "./field-display";
import { renderTutorField, TUTOR_FIELD_REGISTRY, TUTOR_FIELD_STEPS } from "@/lib/tutor-field-registry";
import { TutorApplication } from "@/types/tutor-application";

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

// Full breakdown of every field captured across the tutor-registration
// wizard, grouped by step and driven by TUTOR_FIELD_REGISTRY -
// crossCuttingRequirements.fullVisibilityPrinciple in
// tutor-registration-schema.json requires this to exist somewhere for
// reviewers; MyApplicationRecord (the tutor's own profile) is the other,
// built from the exact same registry. Read-only - editing flagged fields
// happens via the existing "Request More Info" flow, not inline here.
export default function FullApplicationDetails({ app }: { app: TutorApplication }) {
  // Same three stages TutorApplicationService.assertCustomFieldResponsesValid
  // checks server-side - fetched here purely to resolve customFieldResponses'
  // field ids to human labels for display. Called individually (not via
  // .map over an array) since hooks can't be called inside a callback.
  const personalInfoFields = useCustomFormFields("tutor-onboarding:personal-information").fields;
  const professionalExperienceFields = useCustomFormFields("tutor-onboarding:professional-experience").fields;
  const finalEvaluationFields = useCustomFormFields("tutor-onboarding:final-evaluation").fields;
  const stageFields = [...personalInfoFields, ...professionalExperienceFields, ...finalEvaluationFields];
  const customEntries = Object.entries(app.customFieldResponses ?? {});

  return (
    <div className="space-y-3">
      {TUTOR_FIELD_STEPS.map(({ stepId, stepTitle }) => {
        const fields = TUTOR_FIELD_REGISTRY.filter((f) => f.stepId === stepId);
        const rendered = fields.map((entry) => ({ entry, value: renderTutorField(entry, app) }));
        if (rendered.every((r) => r.value === null)) return null;
        return (
          <Section key={stepId} title={stepTitle}>
            {rendered.map(({ entry, value }) => (
              <Field key={entry.id} label={entry.label} value={value} />
            ))}
          </Section>
        );
      })}

      {customEntries.length > 0 && (
        <Section title="Additional Questions">
          {customEntries.map(([fieldId, value]) => {
            const field = stageFields.find((f) => f.id === fieldId);
            const display = Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? yesNo(value) : String(value);
            return <Field key={fieldId} label={field?.label ?? fieldId} value={display} />;
          })}
        </Section>
      )}
    </div>
  );
}
