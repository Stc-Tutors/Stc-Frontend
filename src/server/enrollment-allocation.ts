"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface AllocationCheck {
  label: string;
  ok: boolean;
  detail: string;
}

export interface AllocationStatus {
  checks: AllocationCheck[];
  nextStep: string;
  canCreateRecords: boolean;
}

// Why a student can or cannot be allocated yet - see stcbe's AllocationStatusService.
export async function GetAllocationStatusAction(studentId: string): Promise<[ApiResponse<AllocationStatus> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${studentId}/allocation-status`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<AllocationStatus>) : null;
  return [resData, error];
}

// Creates the allocation records an active registration is missing.
export async function CreateAllocationRecordsAction(studentId: string): Promise<[ApiResponse<AllocationStatus> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${studentId}/allocation-records`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<AllocationStatus>) : null;
  return [resData, error];
}
