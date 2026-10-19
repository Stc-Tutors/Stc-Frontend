"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import type { SessionForReview } from "@/types/session-review";
import type { TutorApplication } from "@/types/tutor-application";
import type { TutorChangeRequest } from "@/types/tutor-change-request";
import type { StudentPenaltyAppealStatus, StudentPenaltyCharge, TutorNoShowReport, TutorNoShowReportStatus } from "@/types/penalty-admin";
import type { User } from "@/types/user";

// Actions behind Admin > Approvals. Same endpoints the Super Admin app uses; the backend enforces which permission each needs.

export async function GetTutorNoShowReportsAction(
  status?: TutorNoShowReportStatus
): Promise<[ApiResponse<TutorNoShowReport[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/penalty/admin/reports${status ? `?status=${status}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorNoShowReport[]>) : null;
  return [resData, error];
}

export async function ResolveTutorNoShowReportAction(
  id: string,
  outcome: TutorNoShowReportStatus,
  notes?: string
): Promise<[ApiResponse<TutorNoShowReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/penalty/admin/reports/${id}/resolve`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, notes }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorNoShowReport>) : null;
  return [resData, error];
}

// Staff review queue - a family disputing a no-show/late-cancel/
// late-reschedule charge on their account.
export async function GetPenaltyAppealsAction(): Promise<[ApiResponse<StudentPenaltyCharge[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/penalty/admin/appeals",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<StudentPenaltyCharge[]>) : null;
  return [resData, error];
}

export async function ResolvePenaltyAppealAction(
  id: string,
  decision: StudentPenaltyAppealStatus,
  note?: string
): Promise<[ApiResponse<StudentPenaltyCharge> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/penalty/admin/appeals/${id}/resolve`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<StudentPenaltyCharge>) : null;
  return [resData, error];
}

export async function GetPendingTutorChangeRequestsAction(): Promise<
  [ApiResponse<TutorChangeRequest[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/tutor-change-requests/pending",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<TutorChangeRequest[]>) : null;
  return [resData, error];
}

// Approving delegates the actual reassignment to the same mechanism the
// Allocation Hub's own "Reassign tutor" action uses (stcbe's
// AllocationHubService.reassignTutor) - see TutorChangeRequestService.approve.
export async function ApproveTutorChangeRequestAction(
  id: string,
  newTutorId: string
): Promise<[ApiResponse<TutorChangeRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-change-requests/${id}/approve`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newTutorId }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<TutorChangeRequest>) : null;
  return [resData, error];
}

export async function RejectTutorChangeRequestAction(
  id: string,
  rejectionReason: string
): Promise<[ApiResponse<TutorChangeRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-change-requests/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<TutorChangeRequest>) : null;
  return [resData, error];
}

export async function GetSessionsForReviewAction(
  bucket: "upcoming" | "ongoing" | "completed"
): Promise<[ApiResponse<SessionForReview[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/admin/sessions?bucket=${bucket}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SessionForReview[]>) : null;
  return [resData, error];
}

export async function ApproveSessionAction(id: string): Promise<[ApiResponse<SessionForReview> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/approve-session`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SessionForReview>) : null;
  return [resData, error];
}

export async function FlagSessionAction(
  id: string,
  reason: string
): Promise<[ApiResponse<SessionForReview> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/lessons/${id}/flag-session`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SessionForReview>) : null;
  return [resData, error];
}

// A reviewer confirming a submitted Vetting Questionnaire - moves VETTING_SUBMITTED to APPROVED. This is the step
// that used to happen automatically the moment the tutor submitted it, with nobody actually reading the answers.
export async function ConfirmVettingAction(id: string): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/confirm-vetting`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

// Send a submitted Vetting Questionnaire back to the tutor with a note on what to change.
export async function RequestVettingChangesAction(id: string, note: string): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/request-vetting-changes`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) },
  });
  return [res ? ((await res.json()) as ApiResponse<TutorApplication>) : null, error];
}

export async function GetTutorsForChangeAction(): Promise<[ApiResponse<User[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/users?role=TUTOR&limit=1000",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<User[]>) : null;
  return [resData, error];
}
