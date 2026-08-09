"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CourseRatingSummary, SessionFeedback, TutorRatingSummary } from "@/types/session-feedback";

export async function GetTutorRatingSummaryAction(
  tutorId: string
): Promise<[ApiResponse<TutorRatingSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/session-feedback/tutor/${tutorId}/summary`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorRatingSummary>) : null;
  return [resData, error];
}

export async function GetCourseRatingSummaryAction(
  courseId: string
): Promise<[ApiResponse<CourseRatingSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/session-feedback/course/${courseId}/summary`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseRatingSummary>) : null;
  return [resData, error];
}

export async function GetTutorReviewsAction(
  tutorId: string
): Promise<[ApiResponse<SessionFeedback[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/session-feedback/tutor/${tutorId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SessionFeedback[]>) : null;
  return [resData, error];
}
