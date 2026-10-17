"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { GetAllAssignmentsForAdminAction, GetAssignmentProgressForAdminAction } from "@/server/assignment";
import type { AssignmentProgressDetail, AssignmentWithProgress } from "@/types/assignment";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_LABEL: Record<string, string> = { PENDING_APPROVAL: "Awaiting approval", APPROVED: "Approved", REJECTED: "Rejected" };
const STATE_LABEL: Record<string, string> = { NOT_SUBMITTED: "Not submitted", SUBMITTED: "Submitted", LATE: "Submitted late", GRADED: "Graded" };

const courseTitle = (a: AssignmentWithProgress) => (typeof a.course === "string" ? a.course : a.course.title);
// The teaching tutor if the course has one, otherwise whoever created the assignment.
const tutorName = (a: AssignmentWithProgress) => {
  const course = typeof a.course === "object" ? a.course : null;
  const t = course?.tutor && typeof course.tutor === "object" ? course.tutor : null;
  if (t) return `${t.firstName} ${t.lastName}`;
  return typeof a.createdBy === "object" ? `${a.createdBy.firstName} ${a.createdBy.lastName}` : "-";
};

// Every assignment at any stage - pending, approved, rejected - with its deadline and how many of the students it was set for have
// handed it in. Click one for the student-by-student list (who has submitted, who hasn't).
export function AssignmentTracker() {
  const [rows, setRows] = useState<AssignmentWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qApplied, setQApplied] = useState("");
  const [status, setStatus] = useState("");
  const [state, setState] = useState("");
  const [open, setOpen] = useState<AssignmentWithProgress | null>(null);
  const [detail, setDetail] = useState<AssignmentProgressDetail | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetAllAssignmentsForAdminAction({ q: qApplied, status, state });
    if (error) toast.error(error);
    setRows(res?.data ?? []);
    setIsLoading(false);
  }, [qApplied, status, state]);

  useEffect(() => {
    load();
  }, [load]);

  const openAssignment = async (a: AssignmentWithProgress) => {
    setOpen(a);
    setDetail(null);
    setIsOpening(true);
    const [res, error] = await GetAssignmentProgressForAdminAction(a.id);
    if (error) toast.error(error);
    setDetail(res?.data ?? null);
    setIsOpening(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQApplied(q.trim());
          }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, course or tutor..." className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
            Search
          </button>
        </form>
        <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">All deadlines</option>
          <option value="open">Still open (before deadline)</option>
          <option value="overdue">Past deadline, not all handed in</option>
          <option value="closed">Past deadline</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">Any approval status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING_APPROVAL">Awaiting approval</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Assignment</th>
              <th className="p-3">Course</th>
              <th className="p-3">Tutor</th>
              <th className="p-3">Deadline</th>
              <th className="p-3">Approval</th>
              <th className="p-3">Handed in</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No assignments match.
                </td>
              </tr>
            ) : (
              rows.map((a) => {
                const overdue = a.pastDue && a.progress.notSubmitted > 0 && a.status === "APPROVED";
                return (
                  <tr key={a.id} onClick={() => openAssignment(a)} className="cursor-pointer hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{a.title}</td>
                    <td className="p-3">{courseTitle(a)}</td>
                    <td className="p-3">{tutorName(a)}</td>
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(a.dueDate)}
                      {overdue && (
                        <Badge variant="destructive" className="ml-2">
                          Overdue
                        </Badge>
                      )}
                      {a.pastDue && !overdue && a.status === "APPROVED" && (
                        <Badge variant="secondary" className="ml-2">
                          Closed
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "destructive" : "secondary"}>{STATUS_LABEL[a.status] ?? a.status}</Badge>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {a.status !== "APPROVED" ? (
                        <span className="text-gray-400">-</span>
                      ) : a.progress.expected === 0 ? (
                        <span className="text-gray-400">No students yet</span>
                      ) : (
                        <>
                          <span className="font-medium">
                            {a.progress.submitted} / {a.progress.expected}
                          </span>
                          {a.progress.late > 0 && <span className="ml-2 text-xs text-amber-600">{a.progress.late} late</span>}
                          {a.progress.graded > 0 && <span className="ml-2 text-xs text-emerald-600">{a.progress.graded} graded</span>}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{open.title}</DialogTitle>
                <DialogDescription>
                  {courseTitle(open)} · Tutor: {tutorName(open)} · Deadline {formatDateTime(open.dueDate)} · {open.maxScore} marks
                </DialogDescription>
              </DialogHeader>
              {open.description && <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">{open.description}</p>}
              {open.status !== "APPROVED" && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{STATUS_LABEL[open.status]} - students can&apos;t see this assignment yet.</p>}
              {isOpening ? (
                <p className="text-sm text-gray-500">Loading students...</p>
              ) : !detail || detail.students.length === 0 ? (
                <p className="text-sm text-gray-500">No students are enrolled for this assignment.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="py-2">Student</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Handed in</th>
                      <th className="py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detail.students.map((s) => (
                      <tr key={s.studentId}>
                        <td className="py-2">{s.fullName}</td>
                        <td className="py-2">
                          <Badge variant={s.state === "NOT_SUBMITTED" ? "destructive" : s.state === "LATE" ? "secondary" : "success"}>{STATE_LABEL[s.state] ?? s.state}</Badge>
                        </td>
                        <td className="py-2 text-gray-600">{s.submittedAt ? formatDateTime(s.submittedAt) : "-"}</td>
                        <td className="py-2 text-gray-600">{s.score !== null ? `${s.score} / ${detail.maxScore}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
