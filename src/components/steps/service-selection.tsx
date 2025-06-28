"use client"
import { useState, useEffect } from "react"
import { useEnrollment } from "@/contexts/enrollment-context"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Target, Laptop } from "lucide-react"

interface StepProps {
  onNext: (errors: Record<string, string>) => void
  errors: Record<string, string>
}

const services = [
  {
    id: "academic-tutoring",
    title: "Academic Tutoring",
    description: "Core subject support by curriculum & grade",
    icon: GraduationCap,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "exam-preparation",
    title: "Exam Preparation",
    description: "Focused prep for NCEE, BECE, WAEC, IGCSE, etc.",
    icon: Target,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  },
  {
    id: "tech-bootcamp",
    title: "Tech for Kids",
    description: "Bootcamps in coding, robotics, design & more",
    icon: Laptop,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
]

export default function ServiceSelection({ onNext, errors }: StepProps) {
  const { enrollmentData, updateServiceDetails } = useEnrollment()
  const [selectedService, setSelectedService] = useState(enrollmentData.serviceDetails?.serviceType || "")

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {}

      if (!selectedService) {
        stepErrors.service = "Please select a service"
      }

      if (Object.keys(stepErrors).length === 0) {
        updateServiceDetails({
          serviceType: selectedService as any,
          learningFocus: services.find((s) => s.id === selectedService)?.title || "",
        })
      }

      onNext(stepErrors)
    }

    window.addEventListener("validateStep", handleValidation)
    return () => window.removeEventListener("validateStep", handleValidation)
  }, [selectedService, onNext, updateServiceDetails])

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Choose the type of tutoring service you'd like to enroll your child in:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Card
              key={service.id}
              className={`cursor-pointer border-2 transition-all ${
                selectedService === service.id ? "border-blue-500 bg-blue-50" : service.color
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <CardContent className="p-6 text-center">
                <Icon className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {errors.service && <p className="text-red-600 text-sm">{errors.service}</p>}
    </div>
  )
}
