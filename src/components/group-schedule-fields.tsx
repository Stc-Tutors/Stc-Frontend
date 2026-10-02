"use client";

import { WEEKDAYS_ABBREVIATED } from "@/constants/weekdays";
import { scheduleTimeFrom24Hour, scheduleTimeTo24Hour } from "@/lib/datetime";

export interface GroupScheduleForm {
  days: string[];
  time: string;
  duration: string;
}

export const emptyGroupScheduleForm = (): GroupScheduleForm => ({ days: [], time: "", duration: "60" });

// What the API wants: a schedule when days and a time are set, otherwise nothing (null clears an existing one).
export function groupScheduleFromForm(form: GroupScheduleForm) {
  if (form.days.length === 0 || !form.time) return null;
  return { days: form.days, time: form.time, durationMinutes: Number(form.duration) || 60 };
}

// Day(s), time and length a cohort meets - shown to families when they pick this group at registration.
export function GroupScheduleFields({ value, onChange }: { value: GroupScheduleForm; onChange: (next: GroupScheduleForm) => void }) {
  const toggleDay = (d: string) =>
    onChange({ ...value, days: value.days.includes(d) ? value.days.filter((x) => x !== d) : [...value.days, d] });
  return (
    <div className="space-y-2 rounded-md border border-gray-200 p-3">
      <p className="text-xs font-medium text-gray-600">Class day and time (optional - shown to families when they pick this group)</p>
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS_ABBREVIATED.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggleDay(d)}
            className={`px-2 py-1 rounded-md text-xs border ${value.days.includes(d) ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"}`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="time"
          value={scheduleTimeTo24Hour(value.time)}
          onChange={(e) => onChange({ ...value, time: scheduleTimeFrom24Hour(e.target.value) })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          max={600}
          placeholder="Minutes"
          value={value.duration}
          onChange={(e) => onChange({ ...value, duration: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
