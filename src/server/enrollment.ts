"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Student } from "@/types/student";
import { PaymentRequest } from "@/types/payment";

export interface EnrollmentResponse {
  student: Student;
  payment: PaymentRequest;
}

export async function EnrollAction(data: any): Promise<[ApiResponse<EnrollmentResponse> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<EnrollmentResponse>) : null;
  return [resData, error];
}

export async function GetEnrollmentsAction(): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[] | []>) : null;

  return [resData, error];
}

export async function GetLinkedStudentsAction(): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments/mine/linked-students",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[]>) : null;

  return [resData, error];
}

export async function ConfirmEnrollmentAction(
  id: string,
  updates: Partial<Student>
): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/confirm`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function RejectEnrollmentAction(id: string, reason?: string): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function GetEnrollmentAction(id: string): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}`,
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;

  return [resData, error];
}

// Autosaves the enrollment wizard as the parent moves through it - see
// stcbe's EnrollmentStatus.DRAFT. `data` is deliberately loose (a draft can
// be missing whatever step hasn't been reached yet); completeness is only
// enforced at FinalizeEnrollmentAction.
export async function SaveDraftEnrollmentAction(data: any): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments/draft",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function UpdateDraftEnrollmentAction(
  id: string,
  data: any
): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/draft/${id}`,
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

// Turns a draft (or a previously-finalized-but-unpaid enrollment) into a
// real, payable submission - same contract/response shape as EnrollAction.
export async function FinalizeEnrollmentAction(
  id: string,
  data: any
): Promise<[ApiResponse<EnrollmentResponse> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/draft/${id}/finalize`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<EnrollmentResponse>) : null;
  return [resData, error];
}

// Admin queue - one-on-one enrollments whose submitted schedule still needs
// a decision (approve as-is, or propose a different one via schedule-proposals).
export async function GetPendingScheduleReviewsAction(): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments/schedule-review/pending",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[]>) : null;
  return [resData, error];
}

// Admin: approve a family's submitted one-on-one schedule exactly as-is.
export async function ApproveScheduleAction(id: string): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/approve-schedule`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}
