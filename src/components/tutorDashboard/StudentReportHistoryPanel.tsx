"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import { GetStudentReportHistoryAction, type StudentReportHistory } from "@/server/lesson";

// For the tutor teaching a child in this course: every progress report already written about that child in THIS subject, including by
// tutors before them, so they can see where the child is and what to do next. Reports for the child's other subjects are never shown.
export default function StudentReportHistoryPanel({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<StudentReportHistory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    GetStudentReportHistoryAction(courseId).then(([res, err]) => {
      setError(err);
      setStudents(res?.data ?? []);
    });
  }, [courseId]);

  if (students === null) return null;
  if (error) return null;
  const withReports = students.filter((s) => s.reports.length > 0);
  if (withReports.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="font-semibold mb-1">Progress reports</h2>
      <p className="text-sm text-gray-500 mb-4">What has been written about each student in this subject so far - including by their earlier tutors.</p>
      <div className="space-y-3">
        {withReports.map((s) => (
          <div key={s.studentId} className="rounded-lg border">
            <button
              type="button"
              onClick={() => setOpenId(openId === s.studentId ? null : s.studentId)}
              className="flex w-full items-center justify-between p-3 text-left"
            >
              <span className="font-medium">
                {s.studentName} <span className="text-xs font-normal text-gray-500">· {s.reports.length} report{s.reports.length === 1 ? "" : "s"}</span>
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openId === s.studentId ? "rotate-180" : ""}`} />
            </button>
            {openId === s.studentId && (
              <div className="space-y-3 border-t p-3">
                {s.reports.map((r) => (
                  <div key={r.lessonId} className="rounded-md bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      {formatDate(r.scheduledDate)} · {r.tutorName}
                      {!r.fromThisCourse && " (earlier tutor)"}
                    </p>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                      {r.report.map((f) => (
                        <div key={f.key}>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{f.label}</dt>
                          <dd className="whitespace-pre-wrap text-sm text-gray-800">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
