"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
// import PaystackPop from '@paystack/inline-js'

import { useEnrollment } from "@/contexts/enrollment-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ServiceSelection from "./steps/service-selection"
import ChildInfo from "./steps/child-info"
import SubjectsSchedule from "./steps/subjects-schedule"
import { ROUTES } from "@/config/routes"
import { ToastError, ToastSuccess } from "./ui/custom/toast"

const PaystackPop = typeof window !== "undefined" ? require("@paystack/inline-js") : null

const steps = [
  { id: 1, title: "Service Selection", component: ServiceSelection },
  { id: 2, title: "Child Information", component: ChildInfo },
  { id: 3, title: "Subjects & Schedule", component: SubjectsSchedule },
]

export default function EnrollmentFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const continueId = searchParams.get("continue")

  const { currentStep, setCurrentStep, isLoading, saveEnrollment, loadEnrollment, enrollmentData } = useEnrollment()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isClient, setIsClient] = useState(false)

   useEffect(() => {
    setIsClient(true)
  }, [])

  // Load existing enrollment if continuing
  useEffect(() => {
    if (continueId && isClient) {
      loadEnrollment(continueId)
    }
  }, [continueId, loadEnrollment, isClient])

  const currentStepData = steps.find((step) => step.id === currentStep)
  const CurrentStepComponent = currentStepData?.component

  const handleNext = async () => {
    
    if (currentStep === steps.length) {
      setIsSaving(true)
      try {
        const result = await saveEnrollment()
        if (result.success && result.data) {
          setErrors({})
          const popup = new PaystackPop();
          popup.resumeTransaction(result.data.payment.access_code)
          router.push(ROUTES.DASHBOARD.HOME)
          ToastSuccess("Enrollment successful")
        } else {
          ToastError(result.error || "Failed to save enrollment")
        }
      } catch (error) {
        ToastError("An unexpected error occurred while saving enrollment")
      } finally {
        setIsSaving(false)
      }
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleStepValidation = (stepErrors: Record<string, string>) => {
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length === 0) {
      handleNext()
    }
  }

  const handleSubmit = async () => {
     if (isClient && typeof window !== "undefined") {
      const event = new CustomEvent("validateStep")
      window.dispatchEvent(event)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="w-full flex-1 bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {continueId ? "Continue Enrollment" : "Enroll Your Child"}
            </h1>
            <Button variant="ghost" onClick={() => router.push(ROUTES.DASHBOARD.HOME)} className="text-gray-600">
              Cancel
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{currentStepData?.title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentStepData?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {CurrentStepComponent && <CurrentStepComponent onNext={handleStepValidation} errors={errors} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading || isSaving}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSaving}
            className="flex items-center space-x-2"
          >
            <span>{currentStep === steps.length ? (isSaving ? "Saving..." : "Save & Continue") : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {errors.save && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.save}</p>
          </div>
        )}
      </div>
    </div>
  )
}
