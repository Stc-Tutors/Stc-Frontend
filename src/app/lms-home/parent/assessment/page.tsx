"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/datetime";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { GetMyAssignmentsAction } from "@/server/assignment";
import { MyAssignmentRow } from "@/types/assignment";

export default function ParentAssessmentPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MyAssignmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyAssignmentsAction();
      setRows(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-4">
      <button
        onClick={() => router.push("/lms-home/parent/dashboard")}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-1xl font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-800">Assessment</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        View-only - assignments are submitted by your child from their own account.
      </p>

      <div className="hidden md:grid grid-cols-6 font-semibold text-sm text-gray-600 py-2 border-b">
        <div>Child</div>
        <div>Course</div>
        <div>Assignment</div>
        <div className="text-center">Due Date</div>
        <div className="text-center">Status</div>
        <div className="text-right">Action</div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-6">Loading assignments...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-6">No approved assignments yet for your children&apos;s enrolled courses.</p>
      ) : (
        <div className="space-y-3 md:space-y-0 md:divide-y">
          {rows.map((row) => {
            const { assignment, submission } = row;
            return (
              <div
                key={`${assignment.id}-${row.student.id}`}
                className="rounded-lg border p-3 text-sm md:grid md:grid-cols-6 md:items-center md:rounded-none md:border-0 md:py-3 md:px-0 space-y-1 md:space-y-0"
              >
                <div className="font-medium">{row.student.fullName || "Your child"}</div>
                <div className="text-gray-500 md:text-gray-900">{row.course.title}</div>
                <div>{assignment.title}</div>
                <div className="md:text-center text-gray-600">
                  <span className="md:hidden">Due </span>
                  {formatDate(assignment.dueDate)}
                </div>
                <div className="md:text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission?.status === "GRADED"
                        ? "bg-green-100 text-green-600"
                        : submission
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {submission?.status ?? "Not submitted"}
                    {submission?.status === "GRADED" && submission.score !== undefined ? ` (${submission.score}/${assignment.maxScore})` : ""}
                  </span>
                </div>
                <div className="md:text-right pt-1 md:pt-0">
                  <button className="text-blue-600 hover:underline font-medium" onClick={() => router.push(`/lms-home/parent/assessment/${assignment.id}`)}>
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
