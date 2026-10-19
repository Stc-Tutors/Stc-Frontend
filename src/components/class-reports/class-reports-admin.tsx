"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatScheduleDateTime } from "@/lib/datetime";
import { GetLessonsAdminAction } from "@/server/lesson";
import { SESSION_REPORT_FIELD_LABELS } from "@/types/lesson";
import { StudentsCell } from "@/components/group-students-cell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReportLesson {
  id: string;
  title: string;
  status: string;
  scheduledDate: string;
  durationMinutes: number;
  sessionReport?: Partial<Record<string, string>>;
  course: string | { id: string; title: string; tutor?: string | { firstName: string; lastName: string } };
  courseEnrollment?: unknown;
  groupStudents?: { id: string; fullName: string }[];
}

const hasReport = (l: ReportLesson) => Object.values(l.sessionReport ?? {}).some((v) => typeof v === "string" && v.trim());
const endedAt = (l: ReportLesson) => new Date(l.scheduledDate).getTime() + (l.durationMinutes || 60) * 60000;
// Over (closed, or past its scheduled end) and not cancelled - the classes a report is owed for.
const isOver = (l: ReportLesson) => l.status === "COMPLETED" || (l.status === "SCHEDULED" && endedAt(l) < Date.now());
const courseTitle = (l: ReportLesson) => (typeof l.course === "string" ? "Class" : l.course.title);
const tutorName = (l: ReportLesson) => {
  const t = typeof l.course === "object" ? l.course.tutor : undefined;
  return t && typeof t === "object" ? `${t.firstName} ${t.lastName}`.trim() : "-";
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// Every tutor's after-class report in one place: who filed, who hasn't, and what they wrote. Filter by date, tutor, student or class.
export function ClassReportsAdmin() {
  const [from, setFrom] = useState(() => isoDay(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(() => isoDay(new Date()));
  const [q, setQ] = useState("");
  const [state, setState] = useState<"" | "filed" | "missing">("");
  const [rows, setRows] = useState<ReportLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<ReportLesson | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetLessonsAdminAction({ from, to: `${to}T23:59:59` });
    if (error) toast.error(error);
    setRows(((res?.data ?? []) as unknown as ReportLesson[]).filter(isOver));
    setIsLoading(false);
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter((l) => (state === "filed" ? hasReport(l) : state === "missing" ? !hasReport(l) : true))
      .filter((l) => {
        if (!term) return true;
        const students = (l.groupStudents ?? []).map((s) => s.fullName).join(" ");
        const enrolled = (l.courseEnrollment as { student?: { fullName?: string } } | undefined)?.student?.fullName ?? "";
        return `${tutorName(l)} ${courseTitle(l)} ${l.title} ${students} ${enrolled}`.toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [rows, q, state]);

  const filed = rows.filter(hasReport).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 max-w-xl">
        {[
          ["Classes held", rows.length, "text-gray-900"],
          ["Reports filed", filed, "text-emerald-600"],
          ["Reports missing", rows.length - filed, rows.length - filed > 0 ? "text-red-600" : "text-gray-900"],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{label as string}</p>
            <p className={`text-2xl font-semibold ${color}`}>{value as number}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tutor, student or class..." className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <select aria-label="Filter by report status" value={state} onChange={(e) => setState(e.target.value as "" | "filed" | "missing")} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">All classes</option>
          <option value="filed">Report filed</option>
          <option value="missing">Report missing</option>
        </select>
        <label className="flex items-center gap-1 text-sm text-gray-600">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </label>
        <label className="flex items-center gap-1 text-sm text-gray-600">
          to
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Tutor</th>
              <th className="p-3">Student</th>
              <th className="p-3">Class</th>
              <th className="p-3">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No classes match.
                </td>
              </tr>
            ) : (
              shown.map((l) => (
                <tr key={l.id}>
                  <td className="p-3 whitespace-nowrap">{formatScheduleDateTime(l.scheduledDate)}</td>
                  <td className="p-3">{tutorName(l)}</td>
                  <td className="p-3 text-gray-600">
                    <StudentsCell courseEnrollment={l.courseEnrollment as never} groupStudents={l.groupStudents} />
                  </td>
                  <td className="p-3">{courseTitle(l)}</td>
                  <td className="p-3">
                    {hasReport(l) ? (
                      <button onClick={() => setOpen(l)} className="text-blue-600 hover:underline">
                        View report
                      </button>
                    ) : (
                      <span className="font-medium text-red-600">Missing</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{courseTitle(open)}</DialogTitle>
                <DialogDescription>
                  {tutorName(open)} · {formatScheduleDateTime(open.scheduledDate)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {Object.entries(open.sessionReport ?? {}).map(
                  ([key, value]) =>
                    value && (
                      <div key={key}>
                        <p className="mb-0.5 text-xs font-medium text-gray-500">{SESSION_REPORT_FIELD_LABELS[key] ?? key}</p>
                        <p className="whitespace-pre-wrap text-gray-900">{value}</p>
                      </div>
                    )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
