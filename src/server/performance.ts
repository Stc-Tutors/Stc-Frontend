"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { StudentPerformance } from "@/types/performance";

// Graded assignments + STC Exams test results for one learner (the Student record id). The backend decides who may see whom.
export async function GetStudentPerformanceAction(
  studentId: string
): Promise<[ApiResponse<StudentPerformance> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/performance/student/${studentId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<StudentPerformance>) : null;
  return [resData, error];
}
