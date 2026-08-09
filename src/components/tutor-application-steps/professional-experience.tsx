"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeachingCombinationPicker from "@/components/teaching-combination-picker";
import { TeachingCombination } from "@/types/curriculum";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { TutorApplicationStep2Payload, TutorAvailabilitySlot } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep2Payload) => void;
  errors: Record<string, string>;
}

const STAGE = "tutor-onboarding:professional-experience" as const;

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeOptions = [
  "8:00am", "9:00am", "10:00am", "11:00am", "12:00pm",
  "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm",
];
const durationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hr 30 mins" },
  { value: 120, label: "2 hours" },
];

export default function ProfessionalExperienceStep({ onNext, errors }: StepProps) {
  const { draft, updateCustomFieldResponse } = useTutorApplication();

  const [qualifications, setQualifications] = useState(draft.step2.qualifications || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(draft.step2.yearsOfExperience ?? 0);
  const [teachingCombinations, setTeachingCombinations] = useState<TeachingCombination[]>(
    draft.step2.teachingCombinations || []
  );
  const [previousPlatforms, setPreviousPlatforms] = useState(draft.step2.previousPlatforms || "");
  const [documentUrls, setDocumentUrls] = useState(
    (draft.step2.documentUrls || []).join(", ")
  );
  const [availabilitySchedule, setAvailabilitySchedule] = useState<TutorAvailabilitySlot[]>(
    draft.step2.availabilitySchedule || []
  );

  // Keep one availability row per unique subject taught, mirroring how the
  // student enrollment flow's Subjects & Schedule step auto-creates a
  // schedule row per selected subject (see subjects-schedule.tsx).
  useEffect(() => {
    const subjects = Array.from(new Set(teachingCombinations.flatMap((c) => c.subjectsTaught)));
    setAvailabilitySchedule((prev) =>
      subjects.map((subject) => prev.find((s) => s.subject === subject) || { subject, days: [], time: "8:00am", duration: 60 })
    );
  }, [teachingCombinations]);

  const handleScheduleChange = (index: number, field: keyof TutorAvailabilitySlot, value: any) => {
    setAvailabilitySchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const { fields: customFields } = useCustomFormFields(STAGE);
  const customFieldResponses = draft.customFieldResponses;

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!qualifications.trim()) stepErrors.qualifications = "Please describe your qualifications";
      if (yearsOfExperience < 0) stepErrors.yearsOfExperience = "Enter a valid number of years";
      if (teachingCombinations.length === 0) {
        stepErrors.teachingCombinations = "Please add at least one subject you teach";
      }
      if (availabilitySchedule.length === 0 || !availabilitySchedule.some((s) => s.days.length > 0)) {
        stepErrors.availabilitySchedule = "Please select at least one day you're available";
      }

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
          teachingCombinations,
          previousPlatforms: previousPlatforms || undefined,
          availabilitySchedule,
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
    teachingCombinations,
    previousPlatforms,
    documentUrls,
    availabilitySchedule,
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

          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
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
          <CardTitle>What You Teach *</CardTitle>
        </CardHeader>
        <CardContent>
          <TeachingCombinationPicker value={teachingCombinations} onChange={setTeachingCombinations} />
          {errors.teachingCombinations && <p className="text-red-600 text-sm mt-2">{errors.teachingCombinations}</p>}
        </CardContent>
      </Card>

      {availabilitySchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Availability *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availabilitySchedule.map((item, index) => (
              <Card key={item.subject} className="p-4">
                <h4 className="font-semibold mb-3">{item.subject}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Days *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${index}-${day}`}
                            checked={item.days.includes(day)}
                            onCheckedChange={() => {
                              const newDays = item.days.includes(day)
                                ? item.days.filter((d) => d !== day)
                                : [...item.days, day];
                              handleScheduleChange(index, "days", newDays);
                            }}
                          />
                          <Label htmlFor={`${index}-${day}`} className="text-xs">
                            {day.slice(0, 3)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Time</Label>
                    <Select value={item.time} onValueChange={(value) => handleScheduleChange(index, "time", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Duration</Label>
                    <Select
                      value={item.duration.toString()}
                      onValueChange={(value) => handleScheduleChange(index, "duration", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((d) => (
                          <SelectItem key={d.value} value={d.value.toString()}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
            {errors.availabilitySchedule && <p className="text-red-600 text-sm">{errors.availabilitySchedule}</p>}
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
  );
}
