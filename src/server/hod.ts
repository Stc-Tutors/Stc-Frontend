"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { HodAssignment } from "@/types/hod";
import { SubjectEnrollment } from "@/types/allocation-hub";

export interface HodScopeOverview {
  service: string;
  taxonomyNodeIds?: string[];
  courseIds?: string[];
  totalCourses: number;
  coursesByStatus: Record<string, number>;
  tutorCount: number;
  totalEnrollments: number;
}

// The caller's own HOD assignment - HOD status is additive, so this is
// worth checking regardless of the caller's base role. 404s (no assignment)
// come back as a normal error tuple, not a thrown exception.
export async function GetMyHodAssignmentAction(): Promise<[ApiResponse<HodAssignment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/hod/assignments/me",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<HodAssignment>) : null;
  return [resData, error];
}

// One row per VIEW_REPORTS scope the caller holds - see stcbe's
// HodService.getScopeOverview.
export async function GetHodOverviewAction(): Promise<[ApiResponse<HodScopeOverview[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/hod/overview",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<HodScopeOverview[]>) : null;
  return [resData, error];
}

// Every unassigned SubjectEnrollment within the caller's
// MANAGE_UNASSIGNED_QUEUE scope(s) - see stcbe's HodService.getUnassignedQueue.
export async function GetHodUnassignedQueueAction(): Promise<[ApiResponse<SubjectEnrollment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/hod/unassigned-queue",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SubjectEnrollment[]>) : null;
  return [resData, error];
}
