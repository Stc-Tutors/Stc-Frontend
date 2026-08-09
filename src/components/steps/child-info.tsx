"use client"
import { useState, useEffect } from "react"
import { useEnrollment } from "@/contexts/enrollment-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SearchableCombobox } from "../ui/searchable-combobox"
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option"
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog"
import { useCustomFormFields } from "@/hooks/use-custom-form-fields"
import DynamicQuestionField from "@/components/forms/dynamic-question-field"


interface StepProps {
  onNext: (errors: Record<string, string>) => void
  errors: Record<string, string>
  // Set when this flow is embedded under a role-specific LMS route
  // (/lms-home/student/enrollment/new or /lms-home/parent/enrollment/new) -
  // the route already answers "who is signing up", so the toggle is hidden
  // and userType is seeded from this instead of defaulting to "parent".
  forcedUserType?: "parent" | "student"
}

const STAGE = "student-registration:child-info" as const;

// Below this age, a self-registering "student" still needs a parent/guardian
// on file (contact + consent). 16, not 18 - see child-info step ticket.
const PARENT_INFO_REQUIRED_UNDER_AGE = 16;

function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function ChildInfoStep({ onNext, errors, forcedUserType }: StepProps) {
  const { enrollmentData, updateChildInfo, updateCustomFieldResponse } = useEnrollment()
  const [formData, setFormData] = useState({
    userType: forcedUserType || enrollmentData.childInfo?.userType || "parent",
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

  // Task 2 - Country of residence / Primary language now come from the
  // admin-managed taxonomy-options catalog (GET /public/taxonomy-options)
  // instead of world-countries free text / a hardcoded single-language list.
  const [countries, setCountries] = useState<ITaxonomyOption[]>([])
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  useEffect(() => {
    Promise.all([
      GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE),
    ]).then(([[countryRes], [languageRes]]) => {
      setCountries(countryRes?.data ?? [])
      setLanguages(languageRes?.data ?? [])
      setIsLoadingOptions(false)
    })
  }, [])

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }))
  const languageOptions = languages.map((l) => ({ value: l.value, label: l.label }))

  const { fields: customFields } = useCustomFormFields(STAGE, enrollmentData.serviceDetails?.serviceType)
  const customFieldResponses = enrollmentData.customFieldResponses ?? {}

  const age = calculateAge(formData.dateOfBirth)
  // A self-registering student only needs a parent/guardian on file while
  // under PARENT_INFO_REQUIRED_UNDER_AGE. Until a DOB is entered we don't
  // know their age yet, so default to requiring it (dateOfBirth's own
  // "required" error blocks progression either way).
  const isMinorStudent = formData.userType === "student" && (age === null || age < PARENT_INFO_REQUIRED_UNDER_AGE)

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

      // Additional validation for students under PARENT_INFO_REQUIRED_UNDER_AGE
      if (isMinorStudent) {
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

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id]
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        updateChildInfo(formData)
      }

      // updateChildInfo(formData); // ✅ Always save the data before continuing
      onNext(stepErrors);
    };

    window.addEventListener("validateStep", handleValidation)
    return () => window.removeEventListener("validateStep", handleValidation)
  }, [formData, customFields, customFieldResponses, isMinorStudent, onNext, updateChildInfo])

  return (
    <div className="space-y-6 w-full">
      {/* User Type Selection - hidden when the route already determines this */}
      {!forcedUserType && (
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
      )}

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
              <SearchableCombobox
                options={countryOptions}
                value={formData.countryOfResidence}
                onChange={(value) => handleChange("countryOfResidence", value)}
                placeholder={isLoadingOptions ? "Loading countries..." : "Select country"}
              />
              {errors.countryOfResidence && (
                <p className="text-red-600 text-sm">{errors.countryOfResidence}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryLanguage">Primary Teaching Language *</Label>
              <SearchableCombobox
                options={languageOptions}
                value={formData.primaryLanguage}
                onChange={(value) => handleChange("primaryLanguage", value)}
                placeholder={isLoadingOptions ? "Loading languages..." : "Select language"}
              />
              {errors.primaryLanguage && <p className="text-red-600 text-sm">{errors.primaryLanguage}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent/Guardian Information (for students under PARENT_INFO_REQUIRED_UNDER_AGE) */}
      {isMinorStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
            <p className="text-sm text-gray-600">
              We need parent/guardian details for students under {PARENT_INFO_REQUIRED_UNDER_AGE}
            </p>
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
    </div>
  )
}
