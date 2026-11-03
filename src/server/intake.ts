"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export type IntakeTarget = "PARENT_SIGNUP" | "STUDENT_SIGNUP" | "TUTOR_APPLICATION" | "ENROLLMENT" | "CAREER_APPLICATION";

export interface ClosedIntake {
  target: IntakeTarget;
  message: string;
}

// Which sign-ups / applications / enrolments a Super Admin has closed to this visitor - asked before a form is shown.
export async function GetIntakeStatusAction(): Promise<[ApiResponse<ClosedIntake[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/intake-status",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ClosedIntake[]>) : null;
  return [resData, error];
}
