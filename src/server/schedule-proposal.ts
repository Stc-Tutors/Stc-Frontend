"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { ScheduleProposal } from "@/types/schedule-proposal";
import { ISchedule } from "@/types/student";

// Admin proposes a different class schedule for the family to confirm - see
// stcbe's ScheduleProposalService.create.
export async function CreateScheduleProposalAction(
  studentId: string,
  proposedSchedule: ISchedule[]
): Promise<[ApiResponse<ScheduleProposal> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/schedule-proposals",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student: studentId, proposedSchedule }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ScheduleProposal>) : null;
  return [resData, error];
}

export async function GetScheduleProposalAction(id: string): Promise<[ApiResponse<ScheduleProposal> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/schedule-proposals/${id}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ScheduleProposal>) : null;
  return [resData, error];
}

export async function ConfirmScheduleProposalAction(id: string): Promise<[ApiResponse<ScheduleProposal> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/schedule-proposals/${id}/confirm`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ScheduleProposal>) : null;
  return [resData, error];
}

export async function RejectScheduleProposalAction(id: string, reason?: string): Promise<[ApiResponse<ScheduleProposal> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/schedule-proposals/${id}/reject`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ScheduleProposal>) : null;
  return [resData, error];
}
