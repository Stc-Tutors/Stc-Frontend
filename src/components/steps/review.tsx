"use client";

import { useState, useEffect } from "react";
import { useEnrollment } from "@/contexts/enrollment-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, GraduationCap, Calendar, Clock, Edit } from "lucide-react";
import { SERVICE_TYPE_LABELS } from "@/constants/taxonomy";
import { ArchitecturalPath } from "@/types/service-catalog";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { Input } from "@/components/ui/input";
import { ApplyReferralCodeAction } from "@/server/referral";

interface StepProps {
  onNext: (errors: Record<string, string>) => void;
  errors: Record<string, string>;
  forcedUserType?: "parent" | "student";
}

const STAGE = "student-registration:review" as const;

export default function EnrollmentReview({ onNext, errors }: StepProps) {
  const { enrollmentData, setCurrentStep, calculateCost, updateCustomFieldResponse, setEnrollmentData } = useEnrollment();
  // const { enrollmentData, setCurrentStep } = useEnrollment();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState<string | null>(null);

  const { childInfo, serviceDetails, schedule, selectedService } = enrollmentData;
  const isCourseModule = selectedService?.architecturalPath === ArchitecturalPath.COURSE_MODULE;
  const isExamPrep = selectedService?.architecturalPath === ArchitecturalPath.EXAM_PREP_TAXONOMY;
  const isAcademicTutoring = selectedService?.architecturalPath === ArchitecturalPath.ACADEMIC_TUTORING_TAXONOMY;

  const { fields: customFields } = useCustomFormFields(STAGE, serviceDetails?.serviceType);
  const customFieldResponses = enrollmentData.customFieldResponses ?? {};
  // const totalCost = calculateCost();
  // const totalCost = enrollmentData.totalCost || 0;

  // const totalCost = enrollmentData.totalCost || calculateCost();
  const totalCost = enrollmentData.totalCost ?? 0;
  const billingWeeks = serviceDetails?.billingWeeks || 4;
// console.log("✅ Review Page - Total Cost:", totalCost, "Service Type:", serviceDetails?.serviceType);



  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};
      // console.log("Validation Errors:", stepErrors);


      if (!acceptTerms) {
        stepErrors.terms = "Please accept the terms and conditions";
      }

      if (!acceptPrivacy) {
        stepErrors.privacy = "Please accept the privacy policy";
      }

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id];
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`;
        }
      }

      onNext(stepErrors);
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [acceptTerms, acceptPrivacy, customFields, customFieldResponses, onNext]);

  const formatScheduleText = (scheduleItem: any) => {
    const days = scheduleItem.days.length > 0 ? scheduleItem.days.join(", ") : "Days to be confirmed";
    const duration =
      scheduleItem.duration === 60
        ? "1 hour"
        : scheduleItem.duration === 30
        ? "30 minutes"        : scheduleItem.duration === 90
        ? "1 hr 30 mins"
        : scheduleItem.duration === 120
        ? "2 hours"
        : `${scheduleItem.duration} minutes`;

    return `${days} at ${scheduleItem.time} (${duration})`;
  };

  const getServiceTitle = (serviceType: string) =>
    selectedService?.serviceName || SERVICE_TYPE_LABELS[serviceType] || serviceType;

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) return;
    setIsApplyingReferral(true);
    const [, error] = await ApplyReferralCodeAction(referralCode.trim());
    setIsApplyingReferral(false);
    setReferralMessage(error || "Referral code applied");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Enrollment</h2>
        <p className="text-gray-600">Please review all information before proceeding to payment</p>
      </div>

      {/* Student/Child Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {childInfo?.userType === "parent" ? "Child Information" : "Student Information"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(2)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{childInfo?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{childInfo?.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{childInfo?.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium">{childInfo?.countryOfResidence}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary Language</p>
              <p className="font-medium">{childInfo?.primaryLanguage}</p>
            </div>
            {childInfo?.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{childInfo.phone}</p>
              </div>
            )}
          </div>

          {/* Parent/Guardian Info for Students */}
          {childInfo?.userType === "student" && (
            <>
              <Separator className="my-4" />
              <h4 className="font-semibold mb-3">Parent/Guardian Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{childInfo.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{childInfo.parentPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{childInfo.parentEmail}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Service Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(1)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="font-medium">{getServiceTitle(serviceDetails?.serviceType || "")}</p>
            </div>

            {serviceDetails?.ageLevel && (
              <div>
                <p className="text-sm text-gray-600">Age Level</p>
                <p className="font-medium">{serviceDetails.ageLevel}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">
                {isCourseModule ? "Selected Course" : "Selected Subjects"}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {serviceDetails?.selectedSubjects?.map(subject => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            {serviceDetails?.country && (
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-medium">{serviceDetails.country}</p>
              </div>
            )}

            {isAcademicTutoring && serviceDetails?.curriculum && (
              <div>
                <p className="text-sm text-gray-600">Curriculum</p>
                <p className="font-medium">{serviceDetails.curriculum}</p>
              </div>
            )}

            {(serviceDetails?.gradeLevel || serviceDetails?.classYear) && (
              <div>
                <p className="text-sm text-gray-600">Grade Level / Class</p>
                <p className="font-medium">
                  {[serviceDetails.gradeLevel, serviceDetails.classYear].filter(Boolean).join(" / ")}
                </p>
              </div>
            )}

            {isExamPrep && serviceDetails?.examPreparationDetails?.educationLevel && (
              <div>
                <p className="text-sm text-gray-600">Education Level</p>
                <p className="font-medium">{serviceDetails.examPreparationDetails.educationLevel}</p>
              </div>
            )}

            {/* Path B stores the exam name in serviceDetails.curriculum
                (see subjects-schedule.tsx's handleCurriculumPath), not
                examPreparationDetails.exam directly - shown from that field
                for consistency in case they ever diverge. */}
            {isExamPrep && serviceDetails?.curriculum && (
              <div>
                <p className="text-sm text-gray-600">Exam</p>
                <p className="font-medium">{serviceDetails.curriculum}</p>
              </div>
            )}

            {serviceDetails?.examCategory && (
              <div>
                <p className="text-sm text-gray-600">Exam Category</p>
                <p className="font-medium">{serviceDetails.examCategory}</p>
              </div>
            )}

            {serviceDetails?.language && (
              <div>
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-medium">{serviceDetails.language}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Preferred Tutor Gender</p>
              <p className="font-medium">{serviceDetails?.tutorGender}</p>
            </div>

            {serviceDetails?.classFormat && (
              <div>
                <p className="text-sm text-gray-600">Class Format</p>
                <p className="font-medium">
                  {serviceDetails.classFormat === "one-on-one" ? "One-on-One" : "Group Class"}
                  {serviceDetails.classFormat === "one-on-one" && serviceDetails.startDate && (
                    <> - starting {new Date(serviceDetails.startDate).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</>
                  )}
                </p>
              </div>
            )}

            {serviceDetails?.classGroupId && (
              <div>
                <p className="text-sm text-gray-600">Class Group</p>
                <p className="font-medium">Joining an existing cohort - final placement confirmed after enrollment</p>
              </div>
            )}

            {serviceDetails?.learningGoals && (
              <div>
                <p className="text-sm text-gray-600">Learning Goals</p>
                <p className="font-medium">{serviceDetails.learningGoals}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Pricing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule & Pricing
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(3)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule?.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{item.subject}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatScheduleText(item)}
                </div>
              </div>
            ))}

            <Separator />

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold">Cost Breakdown</h4>
              <div className="space-y-2">
                {!isCourseModule && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Total weekly hours:</span>
                      <span>
                        {schedule?.reduce((total, item) => {
                          const hoursPerDay = item.duration / 60;
                          return total + item.days.length * hoursPerDay;
                        }, 0)}{" "}
                        hours
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Weekly cost:</span>
                      <span>₦{(totalCost / billingWeeks).toLocaleString()}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{isCourseModule ? "Total:" : `Total (${billingWeeks} week${billingWeeks === 1 ? "" : "s"}):`}</span>
                  <span className="text-green-600">₦{totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral code - optional, only matters on this student's first
          payment ever (see stcbe's ReferralService.creditForPayment). A
          no-op if this account already has a referrer on file, e.g. from
          clicking a referral link at signup. */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Code (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            Were you referred by a tutor, parent, or student? Enter their code below.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" onClick={handleApplyReferralCode} disabled={isApplyingReferral || !referralCode.trim()}>
              {isApplyingReferral ? "Applying..." : "Apply"}
            </Button>
          </div>
          {referralMessage && <p className="text-sm text-gray-500">{referralMessage}</p>}
        </CardContent>
      </Card>

      {/* Payment bypass token - a Super Admin-issued single-use code for
          scholarship/discounted students (see stcbe's
          generatePaymentBypassToken). Redeemed server-side at finalize, not
          validated here - an invalid/expired code just surfaces as a save
          error when they click Save & Continue. */}
      <Card>
        <CardHeader>
          <CardTitle>Have a Payment Bypass Code? (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            If an admin gave you a code to skip payment for this enrollment, enter it here.
          </p>
          <Input
            placeholder="Bypass code"
            value={enrollmentData.bypassToken ?? ""}
            onChange={(e) => setEnrollmentData((prev) => ({ ...prev, bypassToken: e.target.value }))}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={checked => setAcceptTerms(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                Terms and Conditions
              </a>{" "}
              and understand that payment is required to confirm enrollment. Refunds are subject to our cancellation
              policy.
            </Label>
          </div>
          {errors.terms && <p className="text-red-600 text-sm">{errors.terms}</p>}

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={acceptPrivacy}
              onCheckedChange={checked => setAcceptPrivacy(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed">
              I agree to the{" "}
              <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                Privacy Policy
              </a>{" "}
              and consent to the collection and use of my child's information for educational purposes.
            </Label>
          </div>
          {errors.privacy && <p className="text-red-600 text-sm">{errors.privacy}</p>}
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

      {/* Payment Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Ready to Proceed</h3>
              <p className="text-sm text-green-600">Click "Save & Continue" to proceed to secure payment</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-800">₦{totalCost.toLocaleString()}</p>
              {!isCourseModule && (
                <p className="text-sm text-green-600">
                  for {billingWeeks} week{billingWeeks === 1 ? "" : "s"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Payment is processed securely through Paystack</li>
          <li>• Your enrollment will be confirmed after successful payment</li>
          <li>• You will receive a confirmation email with tutor assignment details</li>
          <li>• Classes will begin within 48 hours of payment confirmation</li>
        </ul>
      </div>
    </div>
  );
}
