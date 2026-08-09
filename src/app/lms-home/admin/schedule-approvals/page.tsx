"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ScheduleReviewPanel from "@/components/schedule-review-panel";
import { GetPendingScheduleReviewsAction } from "@/server/enrollment";
import { Student } from "@/types/student";

export default function AdminScheduleApprovalsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const [res] = await GetPendingScheduleReviewsAction();
    setStudents(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">
          One-on-one enrollments whose requested schedule is awaiting review. Approve it as submitted once you&apos;ve
          found a tutor that fits, or propose a different time for the family to confirm.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing pending — every requested schedule has been reviewed.</p>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="space-y-1">
              <button
                onClick={() => router.push(`/lms-home/admin/students/${student.id}`)}
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                {student.fullName}
              </button>
              <ScheduleReviewPanel student={student} onChanged={load} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
