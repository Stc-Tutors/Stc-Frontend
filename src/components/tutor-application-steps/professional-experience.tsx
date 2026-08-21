"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import {
  TEACHING_CERTIFICATION_OTHER,
  TeachingExperienceEntry,
  TutorApplicationStep2Payload,
} from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep2Payload) => void;
  errors: Record<string, string>;
}

const STAGE = "tutor-onboarding:professional-experience" as const;

const EMPTY_EXPERIENCE_ENTRY: TeachingExperienceEntry = {
  institution: "",
  role: "",
  startDate: "",
  endDate: "",
  currentlyWorkHere: false,
  description: "",
};

export default function ProfessionalExperienceStep({ onNext, errors }: StepProps) {
  const { draft, updateCustomFieldResponse } = useTutorApplication();

  const [qualifications, setQualifications] = useState(draft.step2.qualifications || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(draft.step2.yearsOfExperience ?? 0);
  const [yearsOnlineTutoringExperience, setYearsOnlineTutoringExperience] = useState(
    draft.step2.yearsOnlineTutoringExperience ?? 0
  );
  const [highestQualification, setHighestQualification] = useState(draft.step2.highestQualification || "");
  const [otherQualificationsHeld, setOtherQualificationsHeld] = useState<string[]>(
    draft.step2.otherQualificationsHeld || []
  );
  const [otherCertifications, setOtherCertifications] = useState<string[]>(draft.step2.otherCertifications || []);
  const [qualificationOptions, setQualificationOptions] = useState<ITaxonomyOption[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<ITaxonomyOption[]>([]);
  const [otherCertificationDetail, setOtherCertificationDetail] = useState(
    draft.step2.otherCertificationDetail || ""
  );
  const [teachingExperienceHistory, setTeachingExperienceHistory] = useState<TeachingExperienceEntry[]>(
    draft.step2.teachingExperienceHistory || []
  );
  const [previousPlatforms, setPreviousPlatforms] = useState(draft.step2.previousPlatforms || "");
  const [documentUrls, setDocumentUrls] = useState(
    (draft.step2.documentUrls || []).join(", ")
  );

  const { fields: customFields } = useCustomFormFields(STAGE);
  const customFieldResponses = draft.customFieldResponses;

  useEffect(() => {
    Promise.all([
      GetTaxonomyOptionsAction(TaxonomyOptionKind.EDUCATION_QUALIFICATION),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.TEACHING_CERTIFICATION),
    ]).then(([qualifications, certifications]) => {
      setQualificationOptions(qualifications[0]?.data ?? []);
      setCertificationOptions(certifications[0]?.data ?? []);
    });
  }, []);

  const addExperienceEntry = () => setTeachingExperienceHistory((prev) => [...prev, { ...EMPTY_EXPERIENCE_ENTRY }]);
  const removeExperienceEntry = (index: number) =>
    setTeachingExperienceHistory((prev) => prev.filter((_, i) => i !== index));
  const updateExperienceEntry = (index: number, patch: Partial<TeachingExperienceEntry>) =>
    setTeachingExperienceHistory((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!qualifications.trim()) stepErrors.qualifications = "Please describe your qualifications";
      if (yearsOfExperience < 0) stepErrors.yearsOfExperience = "Enter a valid number of years";
      if (yearsOnlineTutoringExperience < 0) stepErrors.yearsOnlineTutoringExperience = "Enter a valid number of years";
      if (!highestQualification) stepErrors.highestQualification = "Please select your highest qualification";
      if (otherCertifications.length === 0) stepErrors.otherCertifications = "Please select at least one option (or None)";
      if (otherCertifications.includes(TEACHING_CERTIFICATION_OTHER) && !otherCertificationDetail.trim()) {
        stepErrors.otherCertificationDetail = "Please specify your other certification";
      }

      teachingExperienceHistory.forEach((entry, index) => {
        if (!entry.institution.trim() || !entry.role.trim() || !entry.startDate) {
          stepErrors[`teachingExperienceHistory_${index}`] = "Please fill in institution, role, and start date";
        } else if (!entry.currentlyWorkHere && !entry.endDate) {
          stepErrors[`teachingExperienceHistory_${index}`] = "Enter an end date, or check \"I currently work here\"";
        } else if (entry.endDate && entry.endDate < entry.startDate) {
          stepErrors[`teachingExperienceHistory_${index}`] = "End date cannot be before start date";
        }
      });

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id];
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`;
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        const payload: TutorApplicationStep2Payload = {
          qualifications,
          yearsOfExperience,
          yearsOnlineTutoringExperience,
          highestQualification,
          otherQualificationsHeld: otherQualificationsHeld.length > 0 ? otherQualificationsHeld : undefined,
          otherCertifications,
          otherCertificationDetail: otherCertificationDetail.trim() || undefined,
          teachingExperienceHistory: teachingExperienceHistory.length > 0 ? teachingExperienceHistory : undefined,
          previousPlatforms: previousPlatforms || undefined,
          documentUrls: documentUrls
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean),
        };
        onNext(stepErrors, payload);
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [
    qualifications,
    yearsOfExperience,
    yearsOnlineTutoringExperience,
    highestQualification,
    otherQualificationsHeld,
    otherCertifications,
    otherCertificationDetail,
    teachingExperienceHistory,
    previousPlatforms,
    documentUrls,
    customFields,
    customFieldResponses,
    onNext,
  ]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Your Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications *</Label>
            <Textarea
              id="qualifications"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="e.g. BSc Mathematics, 5 years classroom teaching..."
              className={errors.qualifications ? "border-red-500" : ""}
            />
            {errors.qualifications && <p className="text-red-600 text-sm">{errors.qualifications}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Teaching Experience *</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min={0}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className={errors.yearsOfExperience ? "border-red-500" : ""}
              />
              {errors.yearsOfExperience && <p className="text-red-600 text-sm">{errors.yearsOfExperience}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOnlineTutoringExperience">Years of Online Tutoring Experience *</Label>
              <Input
                id="yearsOnlineTutoringExperience"
                type="number"
                min={0}
                value={yearsOnlineTutoringExperience}
                onChange={(e) => setYearsOnlineTutoringExperience(Number(e.target.value))}
                className={errors.yearsOnlineTutoringExperience ? "border-red-500" : ""}
              />
              {errors.yearsOnlineTutoringExperience && (
                <p className="text-red-600 text-sm">{errors.yearsOnlineTutoringExperience}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="highestQualification">Highest Qualification *</Label>
            <Select value={highestQualification} onValueChange={setHighestQualification}>
              <SelectTrigger id="highestQualification" className={errors.highestQualification ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your highest qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.highestQualification && <p className="text-red-600 text-sm">{errors.highestQualification}</p>}
          </div>

          <div className="space-y-2">
            <Label>Other Qualifications Held (optional)</Label>
            <p className="text-xs text-gray-500">
              Check any additional qualifications you hold besides your highest one above.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {qualificationOptions
                .filter((opt) => opt.value !== highestQualification)
                .map((opt) => (
                  <label key={opt.id} className="flex items-center space-x-2 text-sm">
                    <Checkbox
                      checked={otherQualificationsHeld.includes(opt.value)}
                      onCheckedChange={() =>
                        setOtherQualificationsHeld((prev) =>
                          prev.includes(opt.value) ? prev.filter((q) => q !== opt.value) : [...prev, opt.value]
                        )
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Other Certifications *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {certificationOptions.map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={otherCertifications.includes(opt.value)}
                    onCheckedChange={() =>
                      setOtherCertifications((prev) =>
                        prev.includes(opt.value) ? prev.filter((c) => c !== opt.value) : [...prev, opt.value]
                      )
                    }
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.otherCertifications && <p className="text-red-600 text-sm">{errors.otherCertifications}</p>}
            {otherCertifications.includes(TEACHING_CERTIFICATION_OTHER) && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="otherCertificationDetail">Please specify *</Label>
                <Input
                  id="otherCertificationDetail"
                  value={otherCertificationDetail}
                  onChange={(e) => setOtherCertificationDetail(e.target.value)}
                  placeholder="Name of the certification"
                  className={errors.otherCertificationDetail ? "border-red-500" : ""}
                />
                {errors.otherCertificationDetail && (
                  <p className="text-red-600 text-sm">{errors.otherCertificationDetail}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousPlatforms">Previous Tutoring Platforms (optional)</Label>
            <Input
              id="previousPlatforms"
              value={previousPlatforms}
              onChange={(e) => setPreviousPlatforms(e.target.value)}
              placeholder="e.g. Preply, VIPKid, private tutoring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUrls">Supporting Document Links (optional)</Label>
            <Input
              id="documentUrls"
              value={documentUrls}
              onChange={(e) => setDocumentUrls(e.target.value)}
              placeholder="Links to certificates/CV, comma-separated"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Experience History (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teachingExperienceHistory.map((entry, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Entry {index + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeExperienceEntry(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Institution/Organization *</Label>
                  <Input
                    value={entry.institution}
                    onChange={(e) => updateExperienceEntry(index, { institution: e.target.value })}
                    placeholder="e.g. Greenwood High School"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Role *</Label>
                  <Input
                    value={entry.role}
                    onChange={(e) => updateExperienceEntry(index, { role: e.target.value })}
                    placeholder="e.g. Mathematics Teacher"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Start Date *</Label>
                  <Input
                    type="date"
                    value={entry.startDate}
                    onChange={(e) => updateExperienceEntry(index, { startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">End Date {!entry.currentlyWorkHere && "*"}</Label>
                  <Input
                    type="date"
                    value={entry.endDate}
                    disabled={entry.currentlyWorkHere}
                    onChange={(e) => updateExperienceEntry(index, { endDate: e.target.value })}
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={entry.currentlyWorkHere}
                  onCheckedChange={() =>
                    updateExperienceEntry(index, {
                      currentlyWorkHere: !entry.currentlyWorkHere,
                      endDate: !entry.currentlyWorkHere ? "" : entry.endDate,
                    })
                  }
                />
                <span>I currently work here</span>
              </label>

              <div className="space-y-2">
                <Label className="text-sm">Description (optional)</Label>
                <Textarea
                  value={entry.description}
                  onChange={(e) => updateExperienceEntry(index, { description: e.target.value })}
                  placeholder="Brief summary of your responsibilities/achievements in this role..."
                />
              </div>

              {errors[`teachingExperienceHistory_${index}`] && (
                <p className="text-red-600 text-sm">{errors[`teachingExperienceHistory_${index}`]}</p>
              )}
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addExperienceEntry}>
            Add another
          </Button>
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
