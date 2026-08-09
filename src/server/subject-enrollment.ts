"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { SubjectEnrollment } from "@/types/subject-enrollment";

// Requirement 3's status read - every SubjectEnrollment belonging to a
// student linked to the logged-in account (self or, for a parent, every
// linked child). See stcbe's SubjectEnrollmentService.getMine.
export async function GetMySubjectEnrollmentsAction(): Promise<
  [ApiResponse<SubjectEnrollment[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/subject-enrollments/mine",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SubjectEnrollment[]>) : null;
  return [resData, error];
}
