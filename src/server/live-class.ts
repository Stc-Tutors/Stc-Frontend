"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import type { Lesson } from "@/types/lesson";
import type { ChildConsent, JoinInfo, LessonDeliveryMode, RecordingReadiness } from "@/types/live-class";

type Result<T> = Promise<[ApiResponse<T> | null, string | null]>;

async function call<T>(url: string, method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET", body?: unknown): Result<T> {
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

// Asks the server for a short-lived token to enter one class's room. The
// server decides whether this person may join, and as what (tutor, learner,
// or a silent admin/HOD observer).
export async function JoinLiveClassAction(lessonId: string): Result<JoinInfo> {
  return call(`/live-classes/${lessonId}/join`, "POST");
}

export async function EndLiveClassAction(lessonId: string): Result<null> {
  return call(`/live-classes/${lessonId}/end`, "POST");
}

export async function SetLessonDeliveryModeAction(lessonId: string, mode: LessonDeliveryMode): Result<Lesson> {
  return call(`/live-classes/${lessonId}/delivery-mode`, "PATCH", { mode });
}

export async function SetCourseDeliveryModeAction(courseId: string, mode: LessonDeliveryMode): Result<{ updated: number }> {
  return call(`/live-classes/course/${courseId}/delivery-mode`, "PATCH", { mode });
}

export async function GetRecordingReadinessAction(lessonId: string): Result<RecordingReadiness> {
  return call(`/live-classes/${lessonId}/recording/readiness`);
}

export async function SetLessonRecordingAction(lessonId: string, enabled: boolean, reason?: string): Result<Lesson> {
  return call(`/live-classes/${lessonId}/recording`, "PATCH", { enabled, reason });
}

export async function SetCourseRecordingAction(courseId: string, enabled: boolean, reason?: string): Result<{ updated: number }> {
  return call(`/live-classes/course/${courseId}/recording`, "PATCH", { enabled, reason });
}

export async function GetRecordingPlaybackAction(lessonId: string): Result<{ url: string; expiresInSeconds: number }> {
  return call(`/live-classes/${lessonId}/recording/playback`);
}

export async function DeleteRecordingAction(lessonId: string): Result<Lesson> {
  return call(`/live-classes/${lessonId}/recording`, "DELETE");
}

export async function GetMyRecordingConsentsAction(): Result<ChildConsent[]> {
  return call("/live-classes/consent/mine");
}

export async function SetRecordingConsentAction(studentId: string, granted: boolean): Result<{ studentId: string; granted: boolean }> {
  return call(`/live-classes/consent/${studentId}`, "PUT", { granted });
}
