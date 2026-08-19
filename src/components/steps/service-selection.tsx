"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { Card, CardContent } from "@/components/ui/card"
import {
  GraduationCap,
  Target,
  Laptop,
  Monitor,
  Music,
  BookOpen,
  Languages,
  Users,
  Briefcase,
  Sparkles,
  LucideIcon,
} from "lucide-react"
import { GetServicesAction } from "@/server/service-catalog"
import { ArchitecturalPath, IService } from "@/types/service-catalog"
import { useCustomFormFields } from "@/hooks/use-custom-form-fields"
import DynamicQuestionField from "@/components/forms/dynamic-question-field"

interface StepProps {
  onNext: (errors: Record<string, string>) => void
  errors: Record<string, string>
  forcedUserType?: "parent" | "student"
}

// Purely cosmetic - a known slug gets a matching icon/color, anything the
// Super Admin adds later (unknown slug) still renders fine via the fallback
// below rather than breaking.
const SERVICE_PRESENTATION: Record<string, { icon: LucideIcon; color: string }> = {
  "academic-tutoring": { icon: GraduationCap, color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  "exam-preparation": { icon: Target, color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
  "tech-bootcamp": { icon: Laptop, color: "bg-green-50 border-green-200 hover:bg-green-100" },
  "digital-skills": { icon: Monitor, color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100" },
  "music-training": { icon: Music, color: "bg-pink-50 border-pink-200 hover:bg-pink-100" },
  "adult-education": { icon: BookOpen, color: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
  "language-culture": { icon: Languages, color: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
  "soft-skill": { icon: Users, color: "bg-teal-50 border-teal-200 hover:bg-teal-100" },
  "career-coaching": { icon: Briefcase, color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100" },
  "self-development": { icon: Sparkles, color: "bg-rose-50 border-rose-200 hover:bg-rose-100" },
};
const DEFAULT_PRESENTATION = { icon: Sparkles, color: "bg-gray-50 border-gray-200 hover:bg-gray-100" };

const STAGE = "student-registration:service-selection" as const;

export default function ServiceSelection({ onNext, errors }: StepProps) {
  const { enrollmentData, updateServiceDetails, updateSelectedService, updateCustomFieldResponse } = useEnrollment()
  const searchParams = useSearchParams()
  const [services, setServices] = useState<IService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState(enrollmentData.serviceDetails?.serviceType || "")

  const selectedService = services.find((s) => s.slug === selectedSlug)
  const { fields: customFields } = useCustomFormFields(STAGE, selectedSlug || undefined)
  const customFieldResponses = enrollmentData.customFieldResponses ?? {}

  useEffect(() => {
    GetServicesAction().then(([res, err]) => {
      setServices(res?.data ?? [])
      setLoadError(err)
      setIsLoading(false)
    })
  }, [])

  // Pre-select the service a visitor arrived with (e.g. clicking "Start
  // Academic Tutoring Now" on that service's marketing page carries
  // ?service=academic-tutoring all the way here via /dashboard/enroll) - only
  // once services have loaded and only if nothing's already selected, and
  // only if that slug is actually a live, selectable option here (a
  // "Planned"-status service's query param silently no-ops, same as if the
  // visitor had picked nothing).
  useEffect(() => {
    if (selectedSlug || services.length === 0) return
    const requested = searchParams.get("service")
    if (!requested) return
    const match = services.find((s) => s.slug === requested)
    if (match) setSelectedSlug(match.slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services])

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {}

      if (!selectedSlug) {
        stepErrors.service = "Please select a service"
      }

      const service = services.find((s) => s.slug === selectedSlug)
      if (service?.architecturalPath === ArchitecturalPath.TENANT_DEPLOYMENT) {
        stepErrors.service = "This service isn't available for self-enrollment yet - please contact us directly."
      }

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id]
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`
        }
      }

      if (Object.keys(stepErrors).length === 0 && service) {
        updateServiceDetails({
          serviceType: service.slug,
          learningFocus: service.serviceName,
        })
        updateSelectedService(service)
      }

      onNext(stepErrors)
    }

    window.addEventListener("validateStep", handleValidation)
    return () => window.removeEventListener("validateStep", handleValidation)
  }, [selectedSlug, services, customFields, customFieldResponses, onNext, updateServiceDetails, updateSelectedService])

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Choose the type of tutoring service you'd like to enroll your child in:</p>

      {isLoading && <p className="text-sm text-gray-500">Loading services...</p>}
      {loadError && !isLoading && <p className="text-sm text-red-600">Failed to load services: {loadError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => {
          const { icon: Icon, color } = SERVICE_PRESENTATION[service.slug] ?? DEFAULT_PRESENTATION
          return (
            <Card
              key={service.id}
              className={`cursor-pointer border-2 transition-all ${
                selectedSlug === service.slug ? "border-blue-500 bg-blue-50" : color
              }`}
              onClick={() => setSelectedSlug(service.slug)}
            >
              <CardContent className="p-6 text-center">
                <Icon className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                <h3 className="font-semibold text-lg mb-2">{service.serviceName}</h3>
                <p className="text-sm text-gray-600">{service.description || service.targetAudience}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {errors.service && <p className="text-red-600 text-sm">{errors.service}</p>}

      {customFields.length > 0 && (
        <div className="space-y-4 pt-2">
          {customFields.map((field) => (
            <DynamicQuestionField
              key={field.id}
              field={field}
              value={customFieldResponses[field.id]}
              onChange={(value) => updateCustomFieldResponse(field.id, value)}
              error={errors[`custom_${field.id}`]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
