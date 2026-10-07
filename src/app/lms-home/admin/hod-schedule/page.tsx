"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GetHodScheduleAction } from "@/server/lesson";
import { Lesson, LessonCourseRef, LessonStatus } from "@/types/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import { StudentsCell } from "@/components/group-students-cell";
import { hasJoinableClass } from "@/lib/class-join-window";
import { ToastError } from "@/components/ui/custom/toast";

const tutorOf = (l: Lesson): { id: string; name: string } => {
  const tutor = (l.course as LessonCourseRef).tutor;
  if (!tutor || typeof tutor === "string") return { id: String(tutor ?? ""), name: "Tutor" };
  return { id: tutor.id, name: `${tutor.firstName} ${tutor.lastName}` };
};
const courseTitle = (l: Lesson) => (typeof l.course === "string" ? "Class" : l.course.title);

// Read-only: an HOD sees every class of the tutors under them and gets a way to observe it (the in-app classroom in watch-only mode, or the
// tutor's meeting link). Nothing here edits, reschedules or cancels a class.
export default function HodSchedulePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tutorFilter, setTutorFilter] = useState("ALL");
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    (async () => {
      const [res, error] = await GetHodScheduleAction();
      if (error) ToastError(error);
      setLessons(res?.data ?? []);
      setIsLoading(false);
    })();
  }, []);

  const tutors = useMemo(() => {
    const map = new Map<string, string>();
    lessons.forEach((l) => {
      const t = tutorOf(l);
      if (t.id) map.set(t.id, t.name);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [lessons]);

  const now = Date.now();
  const visible = lessons
    .filter(
      (l) =>
        (tutorFilter === "ALL" || tutorOf(l).id === tutorFilter) &&
        (showPast || new Date(l.scheduledDate).getTime() + l.durationMinutes * 60000 >= now)
    )
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const observe = (l: Lesson) => {
    if (l.status !== LessonStatus.SCHEDULED) return null;
    const ended = new Date(l.scheduledDate).getTime() + l.durationMinutes * 60000 < now;
    if (ended) return null;
    const cls = "inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700";
    if (l.deliveryMode === "LIVEKIT") {
      return (
        <Link href={`/lms-home/classroom/live/${l.id}`} className={cls}>
          <Eye className="size-4" aria-hidden="true" /> Observe class
        </Link>
      );
    }
    if (l.meetingUrl && hasJoinableClass(l)) {
      return (
        <a href={l.meetingUrl} target="_blank" rel="noopener noreferrer" className={cls}>
          <ExternalLink className="size-4" aria-hidden="true" /> Open class link
        </a>
      );
    }
    return <span className="text-xs text-gray-400">No class link yet</span>;
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Schedule of my tutors</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every class of the tutors under your scope. This view is read-only - you can watch a class, not change it.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs text-gray-600">
          <span>Tutor</span>
          <select
            className="block rounded-md border border-gray-300 px-2 py-2 text-sm"
            value={tutorFilter}
            onChange={(e) => setTutorFilter(e.target.value)}
          >
            <option value="ALL">All my tutors</option>
            {tutors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
          <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
          Include past classes
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">
            {lessons.length === 0
              ? "No classes to show. You see a tutor's classes once they are inside one of your HOD scopes."
              : "No classes match this filter."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-gray-900">{formatScheduleDateTime(l.scheduledDate)}</p>
                  <p className="text-sm text-gray-700">
                    {courseTitle(l)} · {tutorOf(l).name} · {l.durationMinutes} min
                  </p>
                  <p className="text-sm text-gray-500">
                    <StudentsCell courseEnrollment={l.courseEnrollment as never} groupStudents={l.groupStudents} />
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {l.status !== LessonStatus.SCHEDULED && <Badge variant="outline">{l.status.replace(/_/g, " ").toLowerCase()}</Badge>}
                  {observe(l)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
