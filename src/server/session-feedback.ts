"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CourseRatingSummary, SessionFeedback, TutorRatingSummary } from "@/types/session-feedback";
import type { ClassReport, FeedbackOverview } from "@/types/live-class";

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

// The tutor's post-class progress report as the family sees it, with the
// prompt to rate. Scoped by the server to the caller's own children.
export async function GetMyClassReportsAction(
  studentId?: string
): Promise<[ApiResponse<ClassReport[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/session-feedback/reports/mine${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<ClassReport[]>) : null;
  return [resData, error];
}

export async function SubmitSessionFeedbackAction(data: {
  lessonId: string;
  studentId: string;
  rating: number;
  comment?: string;
  tags?: string[];
}): Promise<[ApiResponse<SessionFeedback> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/session-feedback",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SessionFeedback>) : null;
  return [resData, error];
}

// Staff overview across every tutor in the caller's scope (admin scope and/or
// HOD scope - the server works out which courses).
export async function GetFeedbackOverviewAction(filters: {
  tutor?: string;
  lowOnly?: boolean;
  includeHidden?: boolean;
  from?: string;
  to?: string;
}): Promise<[ApiResponse<FeedbackOverview> | null, string | null]> {
  const params = new URLSearchParams();
  if (filters.tutor) params.set("tutor", filters.tutor);
  if (filters.lowOnly) params.set("lowOnly", "true");
  if (filters.includeHidden) params.set("includeHidden", "true");
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  const [res, error] = await fetchAPI({
    url: `/session-feedback/overview${qs ? `?${qs}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<FeedbackOverview>) : null;
  return [resData, error];
}

export async function SetFeedbackHiddenAction(
  feedbackId: string,
  hidden: boolean
): Promise<[ApiResponse<SessionFeedback> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/session-feedback/${feedbackId}/hidden`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hidden }) },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SessionFeedback>) : null;
  return [resData, error];
}

export async function AddFeedbackNoteAction(
  feedbackId: string,
  note: string
): Promise<[ApiResponse<SessionFeedback> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/session-feedback/${feedbackId}/notes`,
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SessionFeedback>) : null;
  return [resData, error];
}
