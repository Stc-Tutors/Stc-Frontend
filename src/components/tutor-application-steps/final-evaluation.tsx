"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { TutorApplicationStep8Payload } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep8Payload) => void;
  errors: Record<string, string>;
}

const STAGE = "tutor-onboarding:final-evaluation" as const;
const MIN_RESPONSE_LENGTH = 200;

function CharCount({ value }: { value: string }) {
  const remaining = MIN_RESPONSE_LENGTH - value.trim().length;
  if (remaining <= 0) return null;
  return <p className="text-xs text-gray-400">{remaining} more character{remaining === 1 ? "" : "s"} needed</p>;
}

export default function FinalEvaluationStep({ onNext, errors }: StepProps) {
  const { draft, updateCustomFieldResponse } = useTutorApplication();

  const [finalStrengths, setFinalStrengths] = useState(draft.step8.finalStrengths || "");
  const [finalFeedbackApproach, setFinalFeedbackApproach] = useState(draft.step8.finalFeedbackApproach || "");
  const [internalExpectedPayMin, setInternalExpectedPayMin] = useState(draft.step8.internalExpectedPayMin ?? 0);
  const [internalExpectedPayMax, setInternalExpectedPayMax] = useState(draft.step8.internalExpectedPayMax ?? 0);

  const { fields: customFields } = useCustomFormFields(STAGE);
  const customFieldResponses = draft.customFieldResponses;

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (finalStrengths.trim().length < MIN_RESPONSE_LENGTH) {
        stepErrors.finalStrengths = `Please write at least ${MIN_RESPONSE_LENGTH} characters`;
      }
      if (finalFeedbackApproach.trim().length < MIN_RESPONSE_LENGTH) {
        stepErrors.finalFeedbackApproach = `Please write at least ${MIN_RESPONSE_LENGTH} characters`;
      }
      if (internalExpectedPayMin < 0) stepErrors.internalExpectedPayMin = "Enter a valid amount";
      if (internalExpectedPayMax < internalExpectedPayMin) {
        stepErrors.internalExpectedPayMax = "Must be greater than or equal to the lowest amount";
      }

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id];
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`;
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, {
          finalStrengths,
          finalFeedbackApproach,
          internalExpectedPayMin,
          internalExpectedPayMax,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [
    finalStrengths,
    finalFeedbackApproach,
    internalExpectedPayMin,
    internalExpectedPayMax,
    customFields,
    customFieldResponses,
    onNext,
  ]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Final Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finalStrengths">What are your strengths as an online tutor? *</Label>
            <Textarea
              id="finalStrengths"
              value={finalStrengths}
              onChange={(e) => setFinalStrengths(e.target.value)}
              rows={5}
              className={errors.finalStrengths ? "border-red-500" : ""}
            />
            <CharCount value={finalStrengths} />
            {errors.finalStrengths && <p className="text-red-600 text-sm">{errors.finalStrengths}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalFeedbackApproach">How do you approach constructive feedback? *</Label>
            <Textarea
              id="finalFeedbackApproach"
              value={finalFeedbackApproach}
              onChange={(e) => setFinalFeedbackApproach(e.target.value)}
              rows={5}
              className={errors.finalFeedbackApproach ? "border-red-500" : ""}
            />
            <CharCount value={finalFeedbackApproach} />
            {errors.finalFeedbackApproach && <p className="text-red-600 text-sm">{errors.finalFeedbackApproach}</p>}
          </div>

          <div className="space-y-2">
            <Label>Expected Hourly Pay (Naira)</Label>
            <p className="text-xs text-gray-500">
              This is for our internal planning only - STC pays tutors a share of what the student pays rather than a
              named rate, so this won&apos;t be used to set your actual pay.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internalExpectedPayMin">Lowest expected pay per hour *</Label>
                <Input
                  id="internalExpectedPayMin"
                  type="number"
                  min={0}
                  value={internalExpectedPayMin}
                  onChange={(e) => setInternalExpectedPayMin(Number(e.target.value))}
                  className={errors.internalExpectedPayMin ? "border-red-500" : ""}
                />
                {errors.internalExpectedPayMin && <p className="text-red-600 text-sm">{errors.internalExpectedPayMin}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalExpectedPayMax">Highest expected pay per hour *</Label>
                <Input
                  id="internalExpectedPayMax"
                  type="number"
                  min={0}
                  value={internalExpectedPayMax}
                  onChange={(e) => setInternalExpectedPayMax(Number(e.target.value))}
                  className={errors.internalExpectedPayMax ? "border-red-500" : ""}
                />
                {errors.internalExpectedPayMax && <p className="text-red-600 text-sm">{errors.internalExpectedPayMax}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customFields.map((field) => (
              <DynamicQuestionField
                key={field.id}
                field={field}
                value={customFieldResponses[field.id]}
                onChange={(value) => updateCustomFieldResponse(field.id, value)}
                error={errors[`custom_${field.id}`]}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
