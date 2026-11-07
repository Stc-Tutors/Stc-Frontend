"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  PartnerContract,
  PartnerEarningsStatement,
  PartnerKpiReport,
  PartnerProposal,
  PartnerProposalType,
  PartnerRevenueReport,
} from "@/types/partner";

async function get<T>(url: string): Promise<[ApiResponse<T> | null, string | null]> {
  const [res, error] = await fetchAPI({ url, request: { method: "GET", headers: { "Content-Type": "application/json" } } });
  return [res ? ((await res.json()) as ApiResponse<T>) : null, error];
}

const monthQuery = (month?: string) => (month ? `?month=${encodeURIComponent(month)}` : "");

// The signed-in partner's own contract (null when they have none).
export async function GetMyPartnerContractAction(): Promise<[ApiResponse<PartnerContract | null> | null, string | null]> {
  return get<PartnerContract | null>("/partner/me");
}

export async function GetPartnerKpisAction(month?: string): Promise<[ApiResponse<PartnerKpiReport> | null, string | null]> {
  return get<PartnerKpiReport>(`/partner/kpis${monthQuery(month)}`);
}

export async function GetPartnerRevenueAction(month?: string): Promise<[ApiResponse<PartnerRevenueReport> | null, string | null]> {
  return get<PartnerRevenueReport>(`/partner/revenue${monthQuery(month)}`);
}

export async function GetPartnerEarningsAction(month?: string): Promise<[ApiResponse<PartnerEarningsStatement> | null, string | null]> {
  return get<PartnerEarningsStatement>(`/partner/earnings${monthQuery(month)}`);
}

export async function GetMyPartnerProposalsAction(): Promise<[ApiResponse<PartnerProposal[]> | null, string | null]> {
  return get<PartnerProposal[]>("/partner/proposals");
}

export async function CreatePartnerProposalAction(data: {
  type: PartnerProposalType;
  title: string;
  details: string;
  service?: string;
  country?: string;
  payload?: Record<string, unknown>;
}): Promise<[ApiResponse<PartnerProposal> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/partner/proposals",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });
  return [res ? ((await res.json()) as ApiResponse<PartnerProposal>) : null, error];
}

export async function WithdrawPartnerProposalAction(id: string): Promise<[ApiResponse<PartnerProposal> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/partner/proposals/${id}/withdraw`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });
  return [res ? ((await res.json()) as ApiResponse<PartnerProposal>) : null, error];
}
