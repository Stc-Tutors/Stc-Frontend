"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  Lesson,
  RescheduleRequest,
  RescheduleSurchargeSettings,
  RescheduleSurchargeType,
  ScheduleChangeResult,
  TutorHoursReport,
  TutorPerformanceWeek,
  TutorSessionStats,
} from "@/types/lesson";

export async function GetCourseLessonsAction(courseId: string): Promise<[ApiResponse<Lesson[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/course/${courseId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson[]>) : null;
  return [resData, error];
}

export async function GetLessonAction(id: string): Promise<[ApiResponse<Lesson> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson>) : null;
  return [resData, error];
}

export async function CreateLessonAction(data: {
  course: string;
  title: string;
  description?: string;
  order: number;
  scheduledDate: string;
  durationMinutes: number;
  resourceUrls?: string[];
  recordingUrl?: string;
  meetingUrl?: string;
}): Promise<[ApiResponse<Lesson> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/lessons",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson>) : null;
  return [resData, error];
}

export async function UpdateLessonAction(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    order: number;
    scheduledDate: string;
    durationMinutes: number;
    resourceUrls: string[];
    recordingUrl: string;
    meetingUrl: string;
  }>
): Promise<[ApiResponse<Lesson> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}`,
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson>) : null;
  return [resData, error];
}

export async function RescheduleLessonAction(
  id: string,
  scheduledDate: string,
  reason: string,
  student?: string
): Promise<[ApiResponse<ScheduleChangeResult> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/reschedule`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledDate, reason, student }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ScheduleChangeResult>) : null;
  return [resData, error];
}

export async function ClockInLessonAction(id: string): Promise<[ApiResponse<Lesson> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/clock-in`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson>) : null;
  return [resData, error];
}

export async function ClockOutLessonAction(id: string): Promise<[ApiResponse<Lesson> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/clock-out`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson>) : null;
  return [resData, error];
}

export async function AddLessonCommentAction(
  id: string,
  tutorComments: string
): Promise<[ApiResponse<Lesson> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/comment`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorComments }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson>) : null;
  return [resData, error];
}

export async function GetLessonsAdminAction(
  filters?: { tutor?: string; student?: string; course?: string; status?: string; from?: string; to?: string }
): Promise<[ApiResponse<Lesson[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(filters ?? {}).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/lessons${query ? `?${query}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Lesson[]>) : null;
  return [resData, error];
}

export async function ListRescheduleRequestsAction(
  status?: string
): Promise<[ApiResponse<RescheduleRequest[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests${status ? `?status=${status}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest[]>) : null;
  return [resData, error];
}

export async function ApproveRescheduleAction(
  id: string,
  meetingUrl?: string
): Promise<[ApiResponse<RescheduleRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests/${id}/approve`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingUrl ? { meetingUrl } : {}),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest>) : null;
  return [resData, error];
}

export async function RejectRescheduleAction(
  id: string,
  reason?: string
): Promise<[ApiResponse<RescheduleRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest>) : null;
  return [resData, error];
}

export async function GetMyPendingRescheduleConfirmationsAction(): Promise<
  [ApiResponse<RescheduleRequest[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests/mine`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest[]>) : null;
  return [resData, error];
}

export async function ForwardRescheduleToParentAction(
  id: string
): Promise<[ApiResponse<RescheduleRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests/${id}/forward-to-parent`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest>) : null;
  return [resData, error];
}

export async function ConfirmTutorRescheduleAction(
  id: string,
  accept: boolean,
  reason?: string
): Promise<[ApiResponse<RescheduleRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests/${id}/confirm`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept, reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest>) : null;
  return [resData, error];
}

export async function CancelLessonAction(
  id: string,
  reason: string,
  student?: string
): Promise<[ApiResponse<ScheduleChangeResult> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/cancel`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, student }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ScheduleChangeResult>) : null;
  return [resData, error];
}

export async function GetMyTutorHoursAction(): Promise<[ApiResponse<TutorHoursReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/lessons/mine/hours",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorHoursReport>) : null;
  return [resData, error];
}

export async function GetMySessionStatsAction(): Promise<[ApiResponse<TutorSessionStats> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/lessons/mine/session-stats",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorSessionStats>) : null;
  return [resData, error];
}

export async function GetMyPerformanceAction(
  weeks?: number
): Promise<[ApiResponse<TutorPerformanceWeek[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/mine/performance${weeks ? `?weeks=${weeks}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorPerformanceWeek[]>) : null;
  return [resData, error];
}

// Read broadly (tutor/parent/student/admin) so the exact late-reschedule fee
// shows before someone submits one.
export async function GetRescheduleSurchargeSettingsAction(): Promise<
  [ApiResponse<RescheduleSurchargeSettings> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/lessons/reschedule-surcharge-settings",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleSurchargeSettings>) : null;
  return [resData, error];
}

// SUPER_ADMIN/ALMIGHTY_ADMIN always allowed; a lesser admin needs MANAGE_PRICING.
export async function UpdateRescheduleSurchargeSettingsAction(data: {
  type: RescheduleSurchargeType;
  flatAmount: number;
  percentage: number;
  currency: string;
}): Promise<[ApiResponse<RescheduleSurchargeSettings> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/lessons/admin/reschedule-surcharge-settings",
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleSurchargeSettings>) : null;
  return [resData, error];
}

// Admin (reviewing before forward-to-parent) or SUPER_ADMIN/ALMIGHTY_ADMIN
// (any time while still PENDING) adjusts the auto-computed surcharge on one
// late tutor reschedule request.
export async function OverrideRescheduleSurchargeAction(
  id: string,
  amount: number,
  type?: RescheduleSurchargeType
): Promise<[ApiResponse<RescheduleRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/reschedule-requests/${id}/surcharge`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, type }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRequest>) : null;
  return [resData, error];
}
