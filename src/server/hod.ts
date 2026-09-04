"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { HodAssignment, HodDetailedReportRow } from "@/types/hod";
import { SubjectEnrollment } from "@/types/allocation-hub";
import { Announcement } from "@/types/announcement";
import { User, UserStatus } from "@/types/user";

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

// Tutors related to the caller's own HOD scope only, never the whole
// platform roster - see stcbe's HodService.getScopedTutors. Contact info
// (email/phone) is always redacted server-side regardless of status filter.
export async function GetScopedTutorsAction(
  status?: UserStatus
): Promise<[ApiResponse<Partial<User>[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: status ? `/hod/tutors?status=${status}` : "/hod/tutors",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Partial<User>[]>) : null;
  return [resData, error];
}

// Granular per-(student, course) drill-down behind GetHodOverviewAction's
// cards - see stcbe's HodService.getDetailedReport.
export async function GetHodDetailedReportAction(): Promise<[ApiResponse<HodDetailedReportRow[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/hod/detailed-report",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<HodDetailedReportRow[]>) : null;
  return [resData, error];
}

// One message pushed to every Tutor/Admin within the caller's own HOD scope
// - see stcbe's HodService.broadcast. Recipients are resolved server-side
// (the same tutors GetScopedTutorsAction shows, plus whichever admins
// actually manage them) - nothing to pick here beyond what to say.
export async function BroadcastHodMessageAction(data: {
  title: string;
  body: string;
  link?: string;
}): Promise<[ApiResponse<Announcement> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/hod/broadcast",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Announcement>) : null;
  return [resData, error];
}
