"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GetMyTutorApplicationAction, SubmitVettingQuestionnaireAction } from "@/server/tutor-application";
import { SubmitVettingQuestionnairePayload, TutorApplication, TutorApplicationStatus } from "@/types/tutor-application";

const MIN_RESPONSE_LENGTH = 200;

function CharCount({ value }: { value: string }) {
  const remaining = MIN_RESPONSE_LENGTH - value.trim().length;
  if (remaining <= 0) return null;
  return <p className="text-xs text-gray-400">{remaining} more character{remaining === 1 ? "" : "s"} needed</p>;
}

// STC Tutors' post-approval "Vetting Questionnaire" - the Independent Tutor
// Agreement a tutor confirms AFTER admin approval (TutorApplicationStatus.
// APPROVED_PENDING_VETTING), not part of the signup wizard. Submitting this
// is what confirms the approval and unlocks student allocation eligibility
// - see stcbe's TutorApplicationService.submitVettingQuestionnaire.
export default function TutorVettingPage() {
  const router = useRouter();
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [independentContractorAccepted, setIndependentContractorAccepted] = useState(false);
  const [scenarioDirectPaymentResponse, setScenarioDirectPaymentResponse] = useState("");
  const [scenarioFirstLessonPrepResponse, setScenarioFirstLessonPrepResponse] = useState("");
  const [reportingPolicyAccepted, setReportingPolicyAccepted] = useState(false);
  const [nonCircumventionAccepted, setNonCircumventionAccepted] = useState(false);
  const [punctualityAccepted, setPunctualityAccepted] = useState(false);
  const [attendanceAccepted, setAttendanceAccepted] = useState(false);
  const [confidentialityAccepted, setConfidentialityAccepted] = useState(false);
  const [bindingAgreementAccepted, setBindingAgreementAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    (async () => {
      const [res] = await GetMyTutorApplicationAction();
      setApplication(res?.data ?? null);
      setIsLoading(false);
    })();
  }, []);

  const handleSubmit = async () => {
    if (!application) return;
    setError(null);

    if (!independentContractorAccepted) return setError("You must acknowledge that you are an Independent Contractor");
    if (scenarioDirectPaymentResponse.trim().length < MIN_RESPONSE_LENGTH) {
      return setError(`Please write at least ${MIN_RESPONSE_LENGTH} characters for the direct-payment scenario`);
    }
    if (scenarioFirstLessonPrepResponse.trim().length < MIN_RESPONSE_LENGTH) {
      return setError(`Please write at least ${MIN_RESPONSE_LENGTH} characters for the first-lesson-prep scenario`);
    }
    if (!reportingPolicyAccepted) return setError("You must agree to the Post-Lesson Report policy");
    if (!nonCircumventionAccepted) return setError("You must agree to the Non-Circumvention Policy");
    if (!punctualityAccepted) return setError("You must agree to the punctuality and professionalism policy");
    if (!attendanceAccepted) return setError("You must acknowledge the attendance/lateness policy");
    if (!confidentialityAccepted) return setError("You must agree to the Confidentiality & Child Protection terms");
    if (!bindingAgreementAccepted) return setError("You must agree to be bound by the Independent Tutor Agreement");
    if (signature.trim().length < 2) return setError("Please type your full legal name as your signature");
    if (!signatureDate) return setError("Please enter the date of signature");

    const payload: SubmitVettingQuestionnairePayload = {
      independentContractorAccepted,
      scenarioDirectPaymentResponse,
      scenarioFirstLessonPrepResponse,
      reportingPolicyAccepted,
      nonCircumventionAccepted,
      punctualityAccepted,
      attendanceAccepted,
      confidentialityAccepted,
      bindingAgreementAccepted,
      signature,
      signatureDate,
    };

    setIsSubmitting(true);
    const [, err] = await SubmitVettingQuestionnaireAction(application.id, payload);
    setIsSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/lms-home/tutor/dashboard");
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 p-6">Loading...</p>;
  }

  if (!application || application.status === TutorApplicationStatus.APPROVED) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-6 text-sm text-gray-600">
            {application?.status === TutorApplicationStatus.APPROVED
              ? "You've already completed the Vetting Questionnaire - your approval is confirmed."
              : "There's nothing to complete here right now."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (application.status !== TutorApplicationStatus.APPROVED_PENDING_VETTING) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-6 text-sm text-gray-600">
            The Vetting Questionnaire unlocks once your application is approved.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Vetting Questionnaire</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your application has been approved. Confirm the Independent Tutor Agreement below to complete your
          approval and become eligible to be matched with students.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Nature of Relationship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            The Tutor is engaged as an independent contractor and is not an employee, partner, or agent of STC
            Tutors. The Tutor is solely responsible for reporting and paying their own local, state, and federal
            taxes, and is not entitled to employee benefits, health insurance, or paid leave from the Agency.
          </p>
          <label className="flex items-start space-x-2">
            <Checkbox
              checked={independentContractorAccepted}
              onCheckedChange={(c) => setIndependentContractorAccepted(c as boolean)}
            />
            <span className="text-sm">I acknowledge and agree that I am an Independent Contractor *</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Likely Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="scenarioDirectPaymentResponse">
              Scenario: The Direct Payment - A parent is very impressed with your teaching. At the end of the
              month, they offer to pay you directly to your personal bank account for extra weekend classes,
              bypassing STC Tutors. How do you respond to the parent? *
            </Label>
            <Textarea
              id="scenarioDirectPaymentResponse"
              value={scenarioDirectPaymentResponse}
              onChange={(e) => setScenarioDirectPaymentResponse(e.target.value)}
              rows={5}
            />
            <CharCount value={scenarioDirectPaymentResponse} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenarioFirstLessonPrepResponse">
              Scenario: First Lesson Preparation - You have just been assigned a new student struggling with a
              subject. What specific steps do you take to prepare for your very first session with them? *
            </Label>
            <Textarea
              id="scenarioFirstLessonPrepResponse"
              value={scenarioFirstLessonPrepResponse}
              onChange={(e) => setScenarioFirstLessonPrepResponse(e.target.value)}
              rows={5}
            />
            <CharCount value={scenarioFirstLessonPrepResponse} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reporting & Non-Circumvention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              All tutors must submit a brief Post-Lesson Report immediately after every class. Without this
              report, classes cannot be verified for payment.
            </p>
            <label className="flex items-start space-x-2">
              <Checkbox checked={reportingPolicyAccepted} onCheckedChange={(c) => setReportingPolicyAccepted(c as boolean)} />
              <span className="text-sm">Yes, I understand and agree *</span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              STC Tutors prohibits tutors from taking clients privately. Any attempt to solicit parents or accept
              direct payments will result in immediate termination and forfeiture of any pending payments.
            </p>
            <label className="flex items-start space-x-2">
              <Checkbox checked={nonCircumventionAccepted} onCheckedChange={(c) => setNonCircumventionAccepted(c as boolean)} />
              <span className="text-sm">Yes, I agree to never accept direct payments or poach clients *</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Punctuality & Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Do you agree to join all virtual classes 5 minutes early, maintain a quiet background, and give at
              least 24 hours&apos; notice for any cancellations?
            </p>
            <label className="flex items-start space-x-2">
              <Checkbox checked={punctualityAccepted} onCheckedChange={(c) => setPunctualityAccepted(c as boolean)} />
              <span className="text-sm">Yes, I agree *</span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Unexcused absences or chronic lateness will lead to reassignment of the student to another tutor and
              possible termination of this contract.
            </p>
            <label className="flex items-start space-x-2">
              <Checkbox checked={attendanceAccepted} onCheckedChange={(c) => setAttendanceAccepted(c as boolean)} />
              <span className="text-sm">Yes, I agree *</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidentiality & Child Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm text-gray-600 list-decimal list-inside space-y-1">
            <li>Confidentiality: The Tutor shall not disclose any private information about the student, their academic struggles, or family details to third parties.</li>
            <li>Child Protection: The Tutor must maintain strictly professional boundaries with students at all times. Inappropriate communication, harassment, or non-academic interaction outside of lessons is strictly prohibited.</li>
            <li>Academic Honesty: The Tutor will guide and teach, but will NOT engage in academic dishonesty (e.g., writing essays for the student or taking exams on their behalf).</li>
          </ul>
          <label className="flex items-start space-x-2">
            <Checkbox checked={confidentialityAccepted} onCheckedChange={(c) => setConfidentialityAccepted(c as boolean)} />
            <span className="text-sm">I agree to maintain professional boundaries and protect client confidentiality *</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Final Declaration & Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start space-x-2">
            <Checkbox checked={bindingAgreementAccepted} onCheckedChange={(c) => setBindingAgreementAccepted(c as boolean)} />
            <span className="text-sm">
              By checking this box, I acknowledge that I have read, understood, and agree to be legally bound by
              all the terms and conditions outlined in this Independent Tutor Agreement *
            </span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="signature">Digital Signature (Type your Full Legal Name) *</Label>
            <Input id="signature" value={signature} onChange={(e) => setSignature(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatureDate">Date of Signature *</Label>
            <Input
              id="signatureDate"
              type="date"
              value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Confirm my approval"}
      </Button>
    </div>
  );
}
