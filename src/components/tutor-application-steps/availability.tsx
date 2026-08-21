"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { WEEKDAYS, Weekday } from "@/constants/weekdays";
import {
  CLASS_FORMAT_LABELS,
  TutorClassFormat,
  MAX_WEEKLY_HOURS_LABELS,
  MaxWeeklyHoursBand,
  TutorApplicationStep6Payload,
  TutorAvailabilitySlot,
} from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep6Payload) => void;
  errors: Record<string, string>;
}

// Candidate list from tutor-registration-schema.json's sharedOptionSources.timezones.
const TIMEZONES = [
  "Africa/Lagos",
  "Europe/London",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Toronto",
  "Other",
];

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:00";

export default function AvailabilityStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();

  const [timezone, setTimezone] = useState(draft.step6.timezone || "");
  const [weeklyAvailability, setWeeklyAvailability] = useState<TutorAvailabilitySlot[]>(
    draft.step6.availabilitySchedule || []
  );
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<MaxWeeklyHoursBand | "">(draft.step6.maxWeeklyHours || "");
  const [preferredClassFormat, setPreferredClassFormat] = useState<TutorClassFormat | "">(
    draft.step6.preferredClassFormat || ""
  );

  const toggleDay = (day: Weekday) => {
    setWeeklyAvailability((prev) =>
      prev.some((slot) => slot.dayOfWeek === day)
        ? prev.filter((slot) => slot.dayOfWeek !== day)
        : [...prev, { dayOfWeek: day, startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME }]
    );
  };

  const updateDayTime = (day: Weekday, field: "startTime" | "endTime", value: string) => {
    setWeeklyAvailability((prev) => prev.map((slot) => (slot.dayOfWeek === day ? { ...slot, [field]: value } : slot)));
  };

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};
      if (!timezone) stepErrors.timezone = "Please select your timezone";
      if (weeklyAvailability.length === 0) {
        stepErrors.availabilitySchedule = "Please select at least one day you're available";
      } else if (weeklyAvailability.some((slot) => slot.startTime >= slot.endTime)) {
        stepErrors.availabilitySchedule = "Each day's start time must be before its end time";
      }
      if (!maxWeeklyHours) stepErrors.maxWeeklyHours = "Please select your maximum weekly availability";
      if (!preferredClassFormat) stepErrors.preferredClassFormat = "Please select a preferred class format";

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, {
          timezone,
          availabilitySchedule: weeklyAvailability,
          maxWeeklyHours: maxWeeklyHours as MaxWeeklyHoursBand,
          preferredClassFormat: preferredClassFormat as TutorClassFormat,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [timezone, weeklyAvailability, maxWeeklyHours, preferredClassFormat, onNext]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Your Timezone *</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className={errors.timezone ? "border-red-500" : ""}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && <p className="text-red-600 text-sm">{errors.timezone}</p>}
          </div>

          <div className="space-y-2">
            <Label>Your Weekly Availability *</Label>
            <p className="text-sm text-gray-500">
              Set the general hours you're open to teach, for each day you're available. Not tied to any particular
              subject - we'll fit students into these windows and reschedule within them as needed.
            </p>
            <div className="space-y-2">
              {WEEKDAYS.map((day) => {
                const slot = weeklyAvailability.find((s) => s.dayOfWeek === day);
                return (
                  <div key={day} className="flex items-center gap-3 border rounded-md p-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={Boolean(slot)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="w-24 text-sm">
                      {day}
                    </Label>
                    {slot && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateDayTime(day, "startTime", e.target.value)}
                          className="max-w-[140px]"
                        />
                        <span className="text-sm text-gray-500">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateDayTime(day, "endTime", e.target.value)}
                          className="max-w-[140px]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.availabilitySchedule && <p className="text-red-600 text-sm">{errors.availabilitySchedule}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWeeklyHours">Maximum Hours/Week You're Available *</Label>
            <Select value={maxWeeklyHours} onValueChange={(v) => setMaxWeeklyHours(v as MaxWeeklyHoursBand)}>
              <SelectTrigger id="maxWeeklyHours" className={errors.maxWeeklyHours ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a range" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MaxWeeklyHoursBand).map((band) => (
                  <SelectItem key={band} value={band}>
                    {MAX_WEEKLY_HOURS_LABELS[band]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maxWeeklyHours && <p className="text-red-600 text-sm">{errors.maxWeeklyHours}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredClassFormat">Preferred Class Format *</Label>
            <Select value={preferredClassFormat} onValueChange={(v) => setPreferredClassFormat(v as TutorClassFormat)}>
              <SelectTrigger id="preferredClassFormat" className={errors.preferredClassFormat ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a format" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TutorClassFormat).map((format) => (
                  <SelectItem key={format} value={format}>
                    {CLASS_FORMAT_LABELS[format]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredClassFormat && <p className="text-red-600 text-sm">{errors.preferredClassFormat}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
