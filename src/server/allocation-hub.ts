"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  AdminOversightAllocation,
  AllocationHubSummary,
  BulkActionResult,
  SubjectEnrollment,
  SubjectEnrollmentStatus,
  SuggestedTutor,
  TutorTeachingSummary,
} from "@/types/allocation-hub";

export async function GetAllocationSummaryAction(): Promise<
  [ApiResponse<AllocationHubSummary> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/allocation-hub/summary",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<AllocationHubSummary>) : null;
  return [resData, error];
}

export async function ListAllocationEnrollmentsAction(
  params?: { status?: SubjectEnrollmentStatus; statuses?: SubjectEnrollmentStatus[]; subject?: string; search?: string }
): Promise<[ApiResponse<SubjectEnrollment[]> | null, string | null]> {
  const { statuses, ...rest } = params ?? {};
  const query = new URLSearchParams(
    Object.entries(rest).filter(([, v]) => !!v) as [string, string][]
  );
  if (statuses && statuses.length > 0) query.set("statuses", statuses.join(","));
  const queryString = query.toString();
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/enrollments${queryString ? `?${queryString}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SubjectEnrollment[]>) : null;
  return [resData, error];
}

export async function ListUnmanagedOversightAction(
  params?: { subject?: string; search?: string }
): Promise<[ApiResponse<SubjectEnrollment[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]
  ).toString();
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/oversight/unmanaged${query ? `?${query}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SubjectEnrollment[]>) : null;
  return [resData, error];
}

export async function GetOversightRosterForAdminAction(
  adminId: string
): Promise<[ApiResponse<AdminOversightAllocation[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/oversight/admin/${adminId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<AdminOversightAllocation[]>) : null;
  return [resData, error];
}

// Who a tutor is eligible to teach is TutorAllocation, not Course - see
// GetTutorAllocationAction. This just lists who's already been assigned to
// them for a given subject (empty if nobody has yet).
export async function ListAssignedForTutorSubjectAction(
  tutorId: string,
  subject: string
): Promise<[ApiResponse<SubjectEnrollment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/tutors/${tutorId}/assigned-enrollments?subject=${encodeURIComponent(subject)}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SubjectEnrollment[]>) : null;
  return [resData, error];
}

export async function GetTutorTeachingSummaryAction(
  tutorId: string
): Promise<[ApiResponse<TutorTeachingSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/tutors/${tutorId}/teaching-summary`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<TutorTeachingSummary>) : null;
  return [resData, error];
}

// Candidate tutors for one SubjectEnrollment, ranked conflict-free-first -
// see stcbe's AllocationHubService.suggestTutors.
export async function GetSuggestedTutorsAction(
  subjectEnrollmentId: string
): Promise<[ApiResponse<SuggestedTutor[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/subject-enrollments/${subjectEnrollmentId}/suggested-tutors`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SuggestedTutor[]>) : null;
  return [resData, error];
}

// Saving this flips the SubjectEnrollment from PENDING_CONFIRMATION to
// ACTIVE and fires the parent/student notification.
export async function SetMeetingLinkAction(
  subjectEnrollmentId: string,
  meetingUrl: string
): Promise<[ApiResponse<SubjectEnrollment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/subject-enrollments/${subjectEnrollmentId}/meeting-link`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingUrl }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<SubjectEnrollment>) : null;
  return [resData, error];
}

export async function AssignTutorToEnrollmentsAction(
  subjectEnrollmentIds: string[],
  tutorId: string
): Promise<[ApiResponse<BulkActionResult[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/allocation-hub/assign-tutor",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectEnrollmentIds, tutorId }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<BulkActionResult[]>) : null;
  return [resData, error];
}

// Single-student counterpart to AssignTutorToEnrollmentsAction - moves an
// ALREADY-assigned SubjectEnrollment onto a different tutor. No Course is
// ever picked here - see stcbe's AllocationHubService.reassignTutor.
export interface ReassignTutorResult {
  subjectEnrollment: SubjectEnrollment;
  migratedLessons: number;
  skipped: { scheduledDate: string; reason: string }[];
}

export async function ReassignSubjectTutorAction(
  subjectEnrollmentId: string,
  tutorId: string
): Promise<[ApiResponse<ReassignTutorResult> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/subject-enrollments/${subjectEnrollmentId}/reassign-tutor`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorId }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<ReassignTutorResult>) : null;
  return [resData, error];
}

export async function AssignOversightToEnrollmentsAction(
  subjectEnrollmentIds: string[],
  adminId: string
): Promise<[ApiResponse<BulkActionResult[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/allocation-hub/assign-oversight",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectEnrollmentIds, adminId }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<BulkActionResult[]>) : null;
  return [resData, error];
}

export async function OffboardTutorAction(
  tutorId: string,
  newTutorId: string
): Promise<[ApiResponse<BulkActionResult[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/allocation-hub/tutors/${tutorId}/offboard`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newTutorId }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<BulkActionResult[]>) : null;
  return [resData, error];
}
