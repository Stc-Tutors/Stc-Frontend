"use client";

import JoinClassLink from "@/components/classroom/JoinClassLink";
import { formatScheduleDateTime } from "@/lib/datetime";
import { getJoinWindow } from "@/lib/class-join-window";
import { Lesson, LessonStatus } from "@/types/lesson";

interface Row {
  lesson: Lesson;
  label: string;
}

// Shared "what's happening in my classroom right now" summary - used on the
// tutor/student/parent Classroom tabs so landing there with no class in
// progress shows the next scheduled class (or "no upcoming class") instead
// of the tab just bouncing to another page.
export default function NextClassBanner({ rows }: { rows: Row[] }) {
  const now = Date.now();
  const scheduled = rows
    .filter((r) => r.lesson.status === LessonStatus.SCHEDULED)
    .sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());

  const live = scheduled.find((r) => getJoinWindow(r.lesson.scheduledDate, r.lesson.durationMinutes, now).isJoinable);
  const next = live ?? scheduled.find((r) => new Date(r.lesson.scheduledDate).getTime() > now) ?? scheduled[0];

  if (!next) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-sm text-gray-500">No upcoming class scheduled.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{live ? "Class starting now" : "Next class"}</p>
        <p className="font-semibold text-gray-800">{next.label}</p>
        <p className="text-sm text-gray-500">{formatScheduleDateTime(next.lesson.scheduledDate)}</p>
      </div>
      {next.lesson.status === LessonStatus.SCHEDULED && (
        <JoinClassLink
          lessonId={next.lesson.id}
          scheduledDate={next.lesson.scheduledDate}
          durationMinutes={next.lesson.durationMinutes}
          className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors text-sm font-medium"
        />
      )}
    </div>
  );
}
