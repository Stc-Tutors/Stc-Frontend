"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GetReferenceInfoAction, SubmitReferenceResponseAction } from "@/server/tutor-application";
import { ReferenceInfo } from "@/types/tutor-application";

// Public, unauthenticated - a reference is never a logged-in user of any
// kind. Reached only via the link stcbe's reference-check email sends
// (TutorApplicationService.sendOneReferenceCheckEmail), gated by the token
// query param rather than a session.
export default function ReferenceFormPage() {
  const { applicationId, slot } = useParams<{ applicationId: string; slot: string }>();
  const token = useSearchParams().get("token") || "";

  const [info, setInfo] = useState<ReferenceInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [howTheyKnowApplicant, setHowTheyKnowApplicant] = useState("");
  const [teachingAbility, setTeachingAbility] = useState("");
  const [reliability, setReliability] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const slotNumber = slot === "2" ? 2 : 1;

  useEffect(() => {
    if (!token) {
      setLoadError("This link is missing its access token - please use the link exactly as it appeared in the email.");
      setIsLoading(false);
      return;
    }
    GetReferenceInfoAction(applicationId as string, slotNumber, token).then(([res, error]) => {
      setInfo(res?.data ?? null);
      setLoadError(error);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, slotNumber, token]);

  const handleSubmit = async () => {
    const stepErrors: Record<string, string> = {};
    if (!howTheyKnowApplicant.trim()) stepErrors.howTheyKnowApplicant = "Please answer this question";
    if (!teachingAbility.trim()) stepErrors.teachingAbility = "Please answer this question";
    if (!reliability.trim()) stepErrors.reliability = "Please answer this question";
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const [, error] = await SubmitReferenceResponseAction(applicationId as string, slotNumber, token, {
      howTheyKnowApplicant,
      teachingAbility,
      reliability,
      additionalComments: additionalComments || undefined,
    });
    setIsSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>STC Tutors - Reference Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

          {!isLoading && loadError && <p className="text-sm text-red-600">{loadError}</p>}

          {!isLoading && !loadError && info && (info.alreadySubmitted || submitted) && (
            <p className="text-sm text-gray-700">
              Thank you{info.referenceName ? `, ${info.referenceName}` : ""} - your reference for{" "}
              {info.applicantName} has been recorded. You can close this page.
            </p>
          )}

          {!isLoading && !loadError && info && !info.alreadySubmitted && !submitted && (
            <>
              <p className="text-sm text-gray-600">
                Hi {info.referenceName}, {info.applicantName} listed you as a reference for their tutor application.
                A few quick questions to help with our review:
              </p>

              <div className="space-y-2">
                <Label htmlFor="howTheyKnowApplicant">
                  How do you know {info.applicantName.split(" ")[0]}, and in what capacity? *
                </Label>
                <Textarea
                  id="howTheyKnowApplicant"
                  value={howTheyKnowApplicant}
                  onChange={(e) => setHowTheyKnowApplicant(e.target.value)}
                  rows={3}
                  className={errors.howTheyKnowApplicant ? "border-red-500" : ""}
                />
                {errors.howTheyKnowApplicant && <p className="text-red-600 text-sm">{errors.howTheyKnowApplicant}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teachingAbility">How would you describe their teaching ability? *</Label>
                <Textarea
                  id="teachingAbility"
                  value={teachingAbility}
                  onChange={(e) => setTeachingAbility(e.target.value)}
                  rows={3}
                  className={errors.teachingAbility ? "border-red-500" : ""}
                />
                {errors.teachingAbility && <p className="text-red-600 text-sm">{errors.teachingAbility}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reliability">How would you describe their reliability? *</Label>
                <Textarea
                  id="reliability"
                  value={reliability}
                  onChange={(e) => setReliability(e.target.value)}
                  rows={3}
                  className={errors.reliability ? "border-red-500" : ""}
                />
                {errors.reliability && <p className="text-red-600 text-sm">{errors.reliability}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalComments">Anything else you'd like to add? (optional)</Label>
                <Textarea
                  id="additionalComments"
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  rows={2}
                />
              </div>

              {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit reference"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
