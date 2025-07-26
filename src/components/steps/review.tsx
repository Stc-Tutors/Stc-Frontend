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

interface StepProps {
  onNext: (errors: Record<string, string>) => void;
  errors: Record<string, string>;
}

export default function EnrollmentReview({ onNext, errors }: StepProps) {
  const { enrollmentData, setCurrentStep, calculateCost } = useEnrollment();
  // const { enrollmentData, setCurrentStep } = useEnrollment();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const { childInfo, serviceDetails, schedule } = enrollmentData;
  // const totalCost = calculateCost();
  // const totalCost = enrollmentData.totalCost || 0;

  // const totalCost = enrollmentData.totalCost || calculateCost();
  const totalCost = enrollmentData.totalCost ?? 0;
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

      onNext(stepErrors);
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [acceptTerms, acceptPrivacy, onNext]);

  const formatScheduleText = (scheduleItem: any) => {
    if (serviceDetails?.serviceType === "tech-bootcamp") {
      return "Monday - Friday, 4:00pm - 5:00pm (1 hour)";
    }

    const days = scheduleItem.days.join(", ");
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

  const getServiceTitle = (serviceType: string) => {
    switch (serviceType) {
      case "academic-tutoring":
        return "Academic Tutoring";
      case "exam-preparation":
        return "Exam Preparation";
      case "tech-bootcamp":
        return "Tech for Kids";
      default:
        return serviceType;
    }
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
                Selected {serviceDetails?.serviceType === "tech-bootcamp" ? "Tech Tracks" : "Subjects"}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {serviceDetails?.selectedSubjects?.map(subject => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Preferred Tutor Gender</p>
              <p className="font-medium">{serviceDetails?.tutorGender}</p>
            </div>

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
                <div className="flex justify-between text-sm">
                  <span>Rate per hour:</span>
                  <span>₦1,000</span>
                </div>
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
                  <span>₦{(totalCost / 4).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Monthly Total:</span>
                  <span className="text-green-600">₦{totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
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
              <p className="text-sm text-green-600">per month</p>
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
