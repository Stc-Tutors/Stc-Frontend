"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { LearningStyle, TutorApplicationStep4Payload } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep4Payload) => void;
  errors: Record<string, string>;
}

const RATING_OPTIONS = [1, 2, 3, 4, 5];

function RatingInput({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {RATING_OPTIONS.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
              value === rating ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function EvaluationStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();

  const [psychConfidenceRating, setPsychConfidenceRating] = useState(draft.step4.psychConfidenceRating || 0);
  const [psychDisengagedResponse, setPsychDisengagedResponse] = useState(draft.step4.psychDisengagedResponse || "");
  const [psychMotivation, setPsychMotivation] = useState(draft.step4.psychMotivation || "");
  const [psychParentDisagreementResponse, setPsychParentDisagreementResponse] = useState(
    draft.step4.psychParentDisagreementResponse || ""
  );
  const [personalityType, setPersonalityType] = useState<LearningStyle | "">(draft.step4.personalityType || "");
  const [personalityAdaptabilityRating, setPersonalityAdaptabilityRating] = useState(
    draft.step4.personalityAdaptabilityRating || 0
  );
  const [personalityClassPrep, setPersonalityClassPrep] = useState(draft.step4.personalityClassPrep || "");
  const [personalityAboveAndBeyond, setPersonalityAboveAndBeyond] = useState(draft.step4.personalityAboveAndBeyond || "");

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!psychConfidenceRating) stepErrors.psychConfidenceRating = "Please rate your confidence";
      if (!psychDisengagedResponse.trim()) stepErrors.psychDisengagedResponse = "This response is required";
      if (!psychMotivation.trim()) stepErrors.psychMotivation = "This response is required";
      if (!psychParentDisagreementResponse.trim()) stepErrors.psychParentDisagreementResponse = "This response is required";
      if (!personalityType) stepErrors.personalityType = "Please select an option";
      if (!personalityAdaptabilityRating) stepErrors.personalityAdaptabilityRating = "Please rate your adaptability";
      if (!personalityClassPrep.trim()) stepErrors.personalityClassPrep = "This response is required";
      if (!personalityAboveAndBeyond.trim()) stepErrors.personalityAboveAndBeyond = "This response is required";

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, {
          psychConfidenceRating,
          psychDisengagedResponse,
          psychMotivation,
          psychParentDisagreementResponse,
          personalityType: personalityType as LearningStyle,
          personalityAdaptabilityRating,
          personalityClassPrep,
          personalityAboveAndBeyond,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [
    psychConfidenceRating,
    psychDisengagedResponse,
    psychMotivation,
    psychParentDisagreementResponse,
    personalityType,
    personalityAdaptabilityRating,
    personalityClassPrep,
    personalityAboveAndBeyond,
    onNext,
  ]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Psych Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>How confident are you teaching a subject outside your core expertise? *</Label>
            <RatingInput value={psychConfidenceRating} onChange={setPsychConfidenceRating} lowLabel="Not confident" highLabel="Very confident" />
            {errors.psychConfidenceRating && <p className="text-red-600 text-sm">{errors.psychConfidenceRating}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychDisengagedResponse">
              How would you respond if a student seems disengaged during a lesson? *
            </Label>
            <Textarea
              id="psychDisengagedResponse"
              value={psychDisengagedResponse}
              onChange={(e) => setPsychDisengagedResponse(e.target.value)}
              rows={3}
              className={errors.psychDisengagedResponse ? "border-red-500" : ""}
            />
            {errors.psychDisengagedResponse && <p className="text-red-600 text-sm">{errors.psychDisengagedResponse}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychMotivation">What motivates you to tutor? *</Label>
            <Textarea
              id="psychMotivation"
              value={psychMotivation}
              onChange={(e) => setPsychMotivation(e.target.value)}
              rows={3}
              className={errors.psychMotivation ? "border-red-500" : ""}
            />
            {errors.psychMotivation && <p className="text-red-600 text-sm">{errors.psychMotivation}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychParentDisagreementResponse">
              How would you handle a parent who disagrees with your teaching approach? *
            </Label>
            <Textarea
              id="psychParentDisagreementResponse"
              value={psychParentDisagreementResponse}
              onChange={(e) => setPsychParentDisagreementResponse(e.target.value)}
              rows={3}
              className={errors.psychParentDisagreementResponse ? "border-red-500" : ""}
            />
            {errors.psychParentDisagreementResponse && (
              <p className="text-red-600 text-sm">{errors.psychParentDisagreementResponse}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personality Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Which best describes your teaching style? *</Label>
            <RadioGroup value={personalityType} onValueChange={(v) => setPersonalityType(v as LearningStyle)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LearningStyle.ANALYTICAL} id="analytical" />
                <Label htmlFor="analytical" className="font-normal cursor-pointer">
                  Analytical - structured, logical, step-by-step
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={LearningStyle.CREATIVE} id="creative" />
                <Label htmlFor="creative" className="font-normal cursor-pointer">
                  Creative - exploratory, example-driven, flexible
                </Label>
              </div>
            </RadioGroup>
            {errors.personalityType && <p className="text-red-600 text-sm">{errors.personalityType}</p>}
          </div>

          <div className="space-y-2">
            <Label>How adaptable are you to different learning styles? *</Label>
            <RatingInput
              value={personalityAdaptabilityRating}
              onChange={setPersonalityAdaptabilityRating}
              lowLabel="Not adaptable"
              highLabel="Very adaptable"
            />
            {errors.personalityAdaptabilityRating && (
              <p className="text-red-600 text-sm">{errors.personalityAdaptabilityRating}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalityClassPrep">How do you typically prepare for a class? *</Label>
            <Textarea
              id="personalityClassPrep"
              value={personalityClassPrep}
              onChange={(e) => setPersonalityClassPrep(e.target.value)}
              rows={3}
              className={errors.personalityClassPrep ? "border-red-500" : ""}
            />
            {errors.personalityClassPrep && <p className="text-red-600 text-sm">{errors.personalityClassPrep}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalityAboveAndBeyond">
              Describe a time you went above and beyond for a student *
            </Label>
            <Textarea
              id="personalityAboveAndBeyond"
              value={personalityAboveAndBeyond}
              onChange={(e) => setPersonalityAboveAndBeyond(e.target.value)}
              rows={3}
              className={errors.personalityAboveAndBeyond ? "border-red-500" : ""}
            />
            {errors.personalityAboveAndBeyond && <p className="text-red-600 text-sm">{errors.personalityAboveAndBeyond}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
