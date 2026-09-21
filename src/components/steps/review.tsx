"use client";

import { useState, useEffect, useRef } from "react";
import { formatMoney } from "@/lib/money";
import { useSearchParams } from "next/navigation";
import { useEnrollment } from "@/contexts/enrollment-context";
import { useUser } from "@/contexts/user-context";
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
import { ValidateCouponAction } from "@/server/coupon";

interface StepProps {
  onNext: (errors: Record<string, string>) => void;
  errors: Record<string, string>;
  forcedUserType?: "parent" | "student";
}

const STAGE = "student-registration:review" as const;

export default function EnrollmentReview({ onNext, errors }: StepProps) {
  const { enrollmentData, setCurrentStep, calculateCost, updateCustomFieldResponse, setEnrollmentData, getHourlyPricedSubjects } =
    useEnrollment();
  // const { enrollmentData, setCurrentStep } = useEnrollment();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  // Whether this account already has a referrer on file - either from a
  // `?ref=` link at sign-up (AuthService.register resolves it immediately)
  // or an earlier apply-code call. Re-submitting a code once this is true
  // just 400s ("already referred") - see ReferralService.applyReferralCode.
  const hasExistingReferrer = !!user?.referredBy;
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const { childInfo, serviceDetails, schedule, selectedService } = enrollmentData;
  const isCourseService = selectedService?.architecturalPath === ArchitecturalPath.COURSE_MODULE;
  // Backed by a Course (priced per course, no weekly-hours/billing-weeks). A
  // Course Module enrolled by plain Flow Tree picks has no Course behind it and
  // is scheduled/priced like a subject, so it shows the same breakdown.
  const isCourseModule = isCourseService && !!(serviceDetails?.courseId || serviceDetails?.courseIds?.length);
  // Weekly hours / weekly cost / "N weeks" only mean something when at least one
  // subject is priced per hour. A flat price is one fixed charge for the whole
  // enrollment, so it's shown as just a total (as a Course always is).
  const showWeeklyBreakdown =
    !isCourseModule && getHourlyPricedSubjects(serviceDetails?.selectedSubjects ?? [], serviceDetails ?? {}).length > 0;
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

  const applyReferralCode = async (code: string) => {
    if (!code.trim()) return;
    setIsApplyingReferral(true);
    const [, error] = await ApplyReferralCodeAction(code.trim());
    setIsApplyingReferral(false);
    setReferralMessage(error || "Referral code applied");
  };

  const handleApplyReferralCode = () => applyReferralCode(referralCode);

  // A `?ref=` code captured at sign-up (register-form.tsx reads the same
  // param) should reappear here automatically instead of making the family
  // retype it - auto-populate AND auto-validate it, once, but only when this
  // account doesn't already have a referrer on file (re-submitting one that
  // does just 400s - see ReferralService.applyReferralCode).
  const autoAppliedRef = useRef(false);
  useEffect(() => {
    if (autoAppliedRef.current || hasExistingReferrer) return;
    const ref = searchParams.get("ref");
    if (!ref) return;
    autoAppliedRef.current = true;
    setReferralCode(ref);
    applyReferralCode(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasExistingReferrer]);

  // Read-only preview (CouponService.validate) - the actual redemption only
  // happens server-side at submit time (StudentService.computeEnrollmentQuote),
  // this just lets the family see the discount before committing to pay.
  const handleCheckCoupon = async () => {
    const code = enrollmentData.couponCode?.trim();
    if (!code) return;
    setIsCheckingCoupon(true);
    const [res, error] = await ValidateCouponAction(code, totalCost);
    setIsCheckingCoupon(false);
    setCouponMessage(
      error || `Coupon valid - ${formatMoney(res?.data?.discountAmount)} off, new total ${formatMoney(res?.data?.discountedAmount)}`
    );
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
                {isCourseService
                  ? (selectedService?.taxonomyStages?.length ?? 0) > 0
                    ? "Your Selection"
                    : "Selected Course"
                  : "Selected Subjects"}
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
                {showWeeklyBreakdown && (
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
                      <span>{formatMoney(totalCost / billingWeeks)}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{!showWeeklyBreakdown ? "Total:" : `Total (${billingWeeks} week${billingWeeks === 1 ? "" : "s"}):`}</span>
                  <span className="text-green-600">{formatMoney(totalCost)}</span>
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
          {hasExistingReferrer ? (
            <p className="text-sm text-green-600">
              A referral code is already on file for your account - nothing more to do here.
            </p>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Coupon code - a reusable marketing discount code (see stcbe's
          CouponService), distinct from the referral code above (which
          credits the referrer, not the payer) and the bypass code below
          (waives payment entirely rather than discounting it). Checking here
          only previews the discount - it's actually redeemed server-side
          when this enrollment is finalized. */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Code (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">Have a marketing discount code? Enter it below.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={enrollmentData.couponCode ?? ""}
              onChange={(e) => {
                setEnrollmentData((prev) => ({ ...prev, couponCode: e.target.value }));
                setCouponMessage(null);
              }}
              className="max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleCheckCoupon}
              disabled={isCheckingCoupon || !enrollmentData.couponCode?.trim()}
            >
              {isCheckingCoupon ? "Checking..." : "Check"}
            </Button>
          </div>
          {couponMessage && <p className="text-sm text-gray-500">{couponMessage}</p>}
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
              and consent to the collection and use of {childInfo?.userType === "student" ? "my" : "my child's"} information for educational purposes.
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
              <p className="text-2xl font-bold text-green-800">{formatMoney(totalCost)}</p>
              {showWeeklyBreakdown && (
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
