"use client"
import { useState, useEffect } from "react"
import { useEnrollment } from "@/contexts/enrollment-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface StepProps {
  onNext: (errors: Record<string, string>) => void
  errors: Record<string, string>
}

const countries = ["United States", "United Kingdom", "Nigeria", "Canada", "Australia"]
const languages = ["English", "French", "Spanish", "Mandarin", "Arabic"]

export default function ChildInfoStep({ onNext, errors }: StepProps) {
  const { enrollmentData, updateChildInfo } = useEnrollment()
  const [formData, setFormData] = useState({
    userType: enrollmentData.childInfo?.userType || "parent",
    fullName: enrollmentData.childInfo?.fullName || "",
    gender: enrollmentData.childInfo?.gender || "",
    dateOfBirth: enrollmentData.childInfo?.dateOfBirth || "",
    phone: enrollmentData.childInfo?.phone || "",
    countryOfResidence: enrollmentData.childInfo?.countryOfResidence || "",
    primaryLanguage: enrollmentData.childInfo?.primaryLanguage || "",
    parentName: enrollmentData.childInfo?.parentName || "",
    parentPhone: enrollmentData.childInfo?.parentPhone || "",
    parentEmail: enrollmentData.childInfo?.parentEmail || "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {}

      if (!formData.userType) {
        stepErrors.userType = "Please select who is signing up"
      }

      if (!formData.fullName.trim()) {
        stepErrors.fullName =
          formData.userType === "parent" ? "Child's full name is required" : "Your full name is required"
      }

      if (!formData.gender) {
        stepErrors.gender = "Please select gender"
      }

      if (!formData.dateOfBirth) {
        stepErrors.dateOfBirth = "Date of birth is required"
      }

      // if (!formData.phone.trim()) {
      //   stepErrors.phone = "Phone number is required"
      // }

      if (!formData.countryOfResidence) {
        stepErrors.countryOfResidence = "Please select country of residence"
      }

      if (!formData.primaryLanguage) {
        stepErrors.primaryLanguage = "Please select primary teaching language"
      }

      // Additional validation for students (16+)
      if (formData.userType === "student") {
        if (!formData.parentName.trim()) {
          stepErrors.parentName = "Parent/Guardian name is required"
        }
        if (!formData.parentPhone.trim()) {
          stepErrors.parentPhone = "Parent/Guardian phone is required"
        }
        if (!formData.parentEmail.trim()) {
          stepErrors.parentEmail = "Parent/Guardian email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
          stepErrors.parentEmail = "Please enter a valid email address"
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        updateChildInfo(formData as any)
      }

      onNext(stepErrors)
    }

    window.addEventListener("validateStep", handleValidation)
    return () => window.removeEventListener("validateStep", handleValidation)
  }, [formData, onNext, updateChildInfo])

  return (
    <div className="space-y-6 w-full">
      {/* User Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Who is signing up?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.userType}
            onValueChange={(value) => handleChange("userType", value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-4">
              <RadioGroupItem value="parent" id="parent" />
              <Label htmlFor="parent" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Parent/Guardian</p>
                  <p className="text-sm text-gray-600">I'm enrolling my child</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4">
              <RadioGroupItem value="student" id="student" />
              <Label htmlFor="student" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Student (16+)</p>
                  <p className="text-sm text-gray-600">I'm enrolling myself</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
          {errors.userType && <p className="text-red-600 text-sm mt-2">{errors.userType}</p>}
        </CardContent>
      </Card>

      {/* Student/Child Information */}
      <Card>
        <CardHeader>
          <CardTitle>{formData.userType === "parent" ? "Child Information" : "Your Information"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {formData.userType === "parent" ? "Child's Full Name" : "Your Full Name"} *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder={formData.userType === "parent" ? "Enter child's full name" : "Enter your full name"}
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-600 text-sm">{errors.gender}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && <p className="text-red-600 text-sm">{errors.dateOfBirth}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{formData.userType === "parent" ? "Your Phone Number" : "Phone Number"}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">Country of Residence *</Label>
              <Select
                value={formData.countryOfResidence}
                onValueChange={(value) => handleChange("countryOfResidence", value)}
              >
                <SelectTrigger className={errors.countryOfResidence ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryOfResidence && <p className="text-red-600 text-sm">{errors.countryOfResidence}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryLanguage">Primary Teaching Language *</Label>
              <Select
                value={formData.primaryLanguage}
                onValueChange={(value) => handleChange("primaryLanguage", value)}
              >
                <SelectTrigger className={errors.primaryLanguage ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryLanguage && <p className="text-red-600 text-sm">{errors.primaryLanguage}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent/Guardian Information (for students 16+) */}
      {formData.userType === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
            <p className="text-sm text-gray-600">We need parent/guardian details for students under 18</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleChange("parentName", e.target.value)}
                  placeholder="Enter parent/guardian name"
                  className={errors.parentName ? "border-red-500" : ""}
                />
                {errors.parentName && <p className="text-red-600 text-sm">{errors.parentName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleChange("parentPhone", e.target.value)}
                  placeholder="Enter parent/guardian phone"
                  className={errors.parentPhone ? "border-red-500" : ""}
                />
                {errors.parentPhone && <p className="text-red-600 text-sm">{errors.parentPhone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleChange("parentEmail", e.target.value)}
                  placeholder="Enter parent/guardian email"
                  className={errors.parentEmail ? "border-red-500" : ""}
                />
                {errors.parentEmail && <p className="text-red-600 text-sm">{errors.parentEmail}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
