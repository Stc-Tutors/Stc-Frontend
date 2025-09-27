"use client"

import { useState } from "react"
import BasicInformationForm from "@/components/tutorDashboard/createCourses/BasicInformationForm"
// import AdvanceInformationForm from "./AdvanceInformationForm"
// import CurriculumForm from "./CurriculumForm"
// import PublishForm from "./PublishForm"
import { Button } from "@/components/ui/button"

export default function CreateCourses() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<any>({})

  const steps = [
    { title: "Basic Information", component: BasicInformationForm },
    // { title: "Advance Information", component: AdvanceInformationForm },
    // { title: "Curriculum", component: CurriculumForm },
    // { title: "Publish Course", component: PublishForm },
  ]

  const CurrentStep = steps[step].component

  const handleNext = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    console.log("Final data:", formData)
    // 🚀 send formData to backend API
  }

  return (
    <div className="p-6 bg-white shadow rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">{steps[step].title}</h2>
      <CurrentStep onNext={handleNext} data={formData} />
      
      <div className="flex justify-between mt-6">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={() => handleNext({})}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Publish</Button>
        )}
      </div>
    </div>
  )
}