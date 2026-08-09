"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Attendance } from "@/types/attendance";

export async function GetStudentAttendanceAction(
  studentId: string
): Promise<[ApiResponse<Attendance[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/attendance/student/${studentId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Attendance[]>) : null;
  return [resData, error];
}

export async function ConfirmPresenceAction(data: {
  lessonId: string;
  studentId: string;
  password: string;
}): Promise<[ApiResponse<Attendance> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/attendance/confirm-presence",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Attendance>) : null;
  return [resData, error];
}

export async function MarkAttendanceAction(data: {
  course: string;
  lesson?: string;
  student: string;
  date: string;
  status: string;
  notes?: string;
}): Promise<[ApiResponse<Attendance> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/attendance",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Attendance>) : null;
  return [resData, error];
}
