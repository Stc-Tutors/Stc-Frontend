"use client";

// Task 5 (one-on-one path) - lets the student pick a start date for a
// one-on-one class, hard-disabling anything less than 24 hours from now to
// mirror the backend's StudentService.assertStartDateLeadTime.

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OneOnOneDatePickerProps {
  // ISO datetime string, mirrors ServiceDetails.startDate.
  value?: string;
  onChange: (isoDate: string) => void;
  error?: boolean;
}

export function OneOnOneDatePicker({ value, onChange, error }: OneOnOneDatePickerProps) {
  const [open, setOpen] = useState(false);
  // Recomputed on every render rather than memoized - a few ms of drift here
  // is irrelevant to a 24h lead-time rule, and this keeps the disabled
  // boundary accurate if the picker stays open a long time.
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", error && "border-red-500")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected
            ? selected.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" })
            : "Select a start date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (!day) return;
            // Combine the picked calendar day with minDate's time-of-day so
            // the stored timestamp is always >= minDate regardless of what
            // time "today" it is when the student is browsing - the
            // disabled matcher below only guarantees the *day* isn't
            // earlier than minDate's day, not the exact instant.
            const combined = new Date(day);
            combined.setHours(minDate.getHours(), minDate.getMinutes(), minDate.getSeconds(), 0);
            onChange(combined.toISOString());
            setOpen(false);
          }}
          disabled={{ before: minDate }}
          defaultMonth={minDate}
        />
        <p className="px-3 pb-3 text-xs text-gray-500">Classes must be scheduled at least 24 hours from now.</p>
      </PopoverContent>
    </Popover>
  );
}
