"use client";

import { useMemo, useState } from "react";
import { Lesson, LessonStatus } from "@/types/lesson";

export type ScheduleView = "upcoming" | "past" | "all";

// A class still ahead of (or happening right now for) the viewer: not finished, not cancelled, and not already over.
export function isUpcomingLesson(lesson: Pick<Lesson, "status" | "scheduledDate" | "durationMinutes">): boolean {
  if (lesson.status === LessonStatus.COMPLETED || lesson.status === LessonStatus.CANCELLED) return false;
  return new Date(lesson.scheduledDate).getTime() + (lesson.durationMinutes ?? 0) * 60 * 1000 >= Date.now();
}

// Upcoming first (soonest at the top) is what anyone opening a schedule wants; past classes - most recent first - sit behind
// their own tab instead of burying the next class at the bottom of a long list.
export function useScheduleView<T>(rows: T[], getLesson: (row: T) => Lesson) {
  const [view, setView] = useState<ScheduleView>("upcoming");
  const { visible, counts } = useMemo(() => {
    const time = (r: T) => new Date(getLesson(r).scheduledDate).getTime();
    const upcoming = rows.filter((r) => isUpcomingLesson(getLesson(r))).sort((a, b) => time(a) - time(b));
    const past = rows.filter((r) => !isUpcomingLesson(getLesson(r))).sort((a, b) => time(b) - time(a));
    return {
      visible: view === "upcoming" ? upcoming : view === "past" ? past : [...upcoming, ...past],
      counts: { upcoming: upcoming.length, past: past.length, all: rows.length },
    };
    // getLesson is a stable accessor from the caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, view]);
  return { view, setView, visible, counts };
}

export function ScheduleViewControls({
  view,
  onChange,
  counts,
}: {
  view: ScheduleView;
  onChange: (view: ScheduleView) => void;
  counts: { upcoming: number; past: number; all: number };
}) {
  const tabs: { key: ScheduleView; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Which classes to show">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={view === t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            view === t.key ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {t.label} ({counts[t.key]})
        </button>
      ))}
      <span className="text-xs text-gray-400">
        {view === "upcoming" ? "Soonest first" : view === "past" ? "Most recent first" : "Upcoming first, then past"}
      </span>
    </div>
  );
}
