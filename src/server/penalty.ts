"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { TutorNoShowReport } from "@/types/penalty";

export async function ReportTutorNoShowAction(data: {
  lessonId: string;
  studentId?: string;
  reason?: string;
}): Promise<[ApiResponse<TutorNoShowReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/penalty/reports",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorNoShowReport>) : null;
  return [resData, error];
}

export async function GetMyTutorNoShowReportsAction(): Promise<
  [ApiResponse<TutorNoShowReport[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/penalty/mine/reports",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorNoShowReport[]>) : null;
  return [resData, error];
}
