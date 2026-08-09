"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/custom/password-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { StartTutorApplicationPayload } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: StartTutorApplicationPayload) => void;
  errors: Record<string, string>;
}

const STAGE = "tutor-onboarding:personal-information" as const;

export default function PersonalInformationStep({ onNext, errors }: StepProps) {
  const { draft, updateCustomFieldResponse } = useTutorApplication();

  const [formData, setFormData] = useState({
    firstName: draft.step1.firstName || "",
    lastName: draft.step1.lastName || "",
    email: draft.step1.email || "",
    password: "",
    confirmPassword: "",
    phone: draft.step1.phone || "",
    countryOfResidence: draft.step1.countryOfResidence || "",
    preferredLanguages: draft.step1.preferredLanguages || ([] as string[]),
  });

  // Task 1 - Country of residence / preferred languages come from the
  // admin-managed taxonomy-options catalog (GET /public/taxonomy-options),
  // validated server-side against the same lists (see
  // TutorApplicationService.assertTaxonomyOptionsValid).
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    Promise.all([
      GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE),
    ]).then(([[countryRes], [languageRes]]) => {
      setCountries(countryRes?.data ?? []);
      setLanguages(languageRes?.data ?? []);
      setIsLoadingOptions(false);
    });
  }, []);

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }));

  const { fields: customFields } = useCustomFormFields(STAGE);
  const customFieldResponses = draft.customFieldResponses;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(value)
        ? prev.preferredLanguages.filter((l) => l !== value)
        : [...prev.preferredLanguages, value],
    }));
  };

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!formData.firstName.trim()) stepErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) stepErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.email = "Please enter a valid email address";
      }
      if (!formData.phone.trim()) stepErrors.phone = "Phone number is required";
      if (formData.password.length < 6) stepErrors.password = "Password must be at least 6 characters";
      if (formData.confirmPassword !== formData.password) stepErrors.confirmPassword = "Passwords do not match";
      if (!formData.countryOfResidence) stepErrors.countryOfResidence = "Please select your country of residence";
      if (formData.preferredLanguages.length === 0) {
        stepErrors.preferredLanguages = "Please select at least one preferred language";
      }

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id];
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`;
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        const { confirmPassword, ...payload } = formData;
        onNext(stepErrors, payload);
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [formData, customFields, customFieldResponses, onNext]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>About You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => handleChange("phone", value)}
              country={"ng"}
              inputProps={{ id: "phone" }}
            />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <PasswordInput
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfResidence">Country of Residence *</Label>
            <SearchableCombobox
              options={countryOptions}
              value={formData.countryOfResidence}
              onChange={(value) => handleChange("countryOfResidence", value)}
              placeholder={isLoadingOptions ? "Loading countries..." : "Select country"}
            />
            {errors.countryOfResidence && <p className="text-red-600 text-sm">{errors.countryOfResidence}</p>}
          </div>

          <div className="space-y-2">
            <Label>Preferred Language(s) *</Label>
            {isLoadingOptions && <p className="text-xs text-gray-500">Loading languages...</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <label key={lang.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={formData.preferredLanguages.includes(lang.value)}
                    onCheckedChange={() => toggleLanguage(lang.value)}
                  />
                  <span>{lang.label}</span>
                </label>
              ))}
            </div>
            {errors.preferredLanguages && <p className="text-red-600 text-sm">{errors.preferredLanguages}</p>}
          </div>
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
    </div>
  );
}
