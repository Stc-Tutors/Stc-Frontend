"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface UnmarkedClass {
  lessonId: string;
  title: string;
  courseTitle: string;
  tutorName: string;
  scheduledDate: string;
  hasReport: boolean;
  students: { id: string; fullName: string }[];
}

export type AttendanceMark = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

// Finished classes that still have no attendance for some of their students.
export async function ListUnmarkedAttendanceAction(): Promise<[ApiResponse<UnmarkedClass[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/attendance/unmarked",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<UnmarkedClass[]>) : null;
  return [resData, error];
}

// Adds attendance rows in bulk. Existing marks are never changed and no penalty is applied.
export async function BulkMarkAttendanceAction(
  marks: { lessonId: string; studentId: string; status: AttendanceMark }[]
): Promise<[ApiResponse<{ created: number; skipped: number }> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/attendance/bulk",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marks }) },
  });
  const resData = res ? ((await res.json()) as ApiResponse<{ created: number; skipped: number }>) : null;
  return [resData, error];
}
