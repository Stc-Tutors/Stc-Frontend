"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface TutorChangeRequest {
  id: string;
  subjectEnrollment: string;
  student: string;
  currentTutor?: string;
  requestedBy: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  newTutor?: string;
  createdAt: string;
  updatedAt: string;
}

// A parent/student asking to switch away from a subject's currently
// assigned tutor, stating a genuine reason - reviewed by an admin (see
// stcbe's TutorChangeRequestService).
export async function SubmitTutorChangeRequestAction(
  subjectEnrollmentId: string,
  reason: string
): Promise<[ApiResponse<TutorChangeRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-change-requests",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectEnrollmentId, reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorChangeRequest>) : null;
  return [resData, error];
}

// The family's own submitted requests (any status), so they can see where
// things stand rather than only finding out via notification.
export async function GetMyTutorChangeRequestsAction(): Promise<
  [ApiResponse<TutorChangeRequest[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/tutor-change-requests/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorChangeRequest[]>) : null;
  return [resData, error];
}
