"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import type { HoursAccountSummary, TutorSessionsReport } from "@/types/live-class";

type Result<T> = Promise<[ApiResponse<T> | null, string | null]>;

async function call<T>(url: string, method: "GET" | "POST" = "GET", body?: unknown): Result<T> {
  const [res, error] = await fetchAPI({
    url,
    request: {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<T>) : null;
  return [resData, error];
}

// A family's hours: bought, used, pending review, remaining - per child, per course.
export async function GetMyHoursAction(): Result<HoursAccountSummary[]> {
  return call("/hours/mine");
}

export async function GetStudentHoursAction(studentId: string): Result<HoursAccountSummary[]> {
  return call(`/hours/student/${studentId}`);
}

export async function GetMyTutorSessionsAction(): Result<TutorSessionsReport> {
  return call("/hours/tutor/mine");
}

export async function AdjustHoursAction(accountId: string, minutes: number, note: string): Result<null> {
  return call(`/hours/accounts/${accountId}/adjust`, "POST", { minutes, note });
}
