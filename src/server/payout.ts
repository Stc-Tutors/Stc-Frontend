"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Bank, PayoutRequest, PayoutSettings, TutorBalance, TutorPayoutProfile } from "@/types/payout";
import { TutorRate } from "@/types/tutor-rate";

export async function GetMyPayoutProfileAction(): Promise<[ApiResponse<TutorPayoutProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/profile",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorPayoutProfile>) : null;
  return [resData, error];
}

export async function ListMyRatesAction(): Promise<[ApiResponse<TutorRate[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/rates/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorRate[]>) : null;
  return [resData, error];
}

export async function ConfirmTutorRateAction(rateId: string): Promise<[ApiResponse<TutorRate> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payouts/rates/${rateId}/confirm`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorRate>) : null;
  return [resData, error];
}

export async function RejectTutorRateAction(
  rateId: string
): Promise<[ApiResponse<TutorRate | null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payouts/rates/${rateId}/reject`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorRate | null>) : null;
  return [resData, error];
}

export async function CounterTutorRateAction(
  rateId: string,
  data: { ratePerHour?: number; flatRate?: number }
): Promise<[ApiResponse<TutorRate> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payouts/rates/${rateId}/counter`,
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorRate>) : null;
  return [resData, error];
}

export async function SetPayoutBankDetailsAction(data: {
  bankName: string;
  bankCode: string;
  accountNumber: string;
}): Promise<[ApiResponse<TutorPayoutProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/profile/bank",
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorPayoutProfile>) : null;
  return [resData, error];
}

export async function RequestPayoutAction(): Promise<[ApiResponse<PayoutRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/request",
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutRequest>) : null;
  return [resData, error];
}

export async function GetMyPayoutRequestsAction(): Promise<[ApiResponse<PayoutRequest[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutRequest[]>) : null;
  return [resData, error];
}

export async function GetMyBalanceAction(): Promise<[ApiResponse<TutorBalance> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/balance",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorBalance>) : null;
  return [resData, error];
}

export async function ListPayoutBanksAction(): Promise<[ApiResponse<Bank[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/banks",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Bank[]>) : null;
  return [resData, error];
}

export async function GetPayoutCycleAction(): Promise<[ApiResponse<PayoutSettings> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payouts/settings",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutSettings>) : null;
  return [resData, error];
}

export async function ListAllPayoutRequestsAction(
  status?: string
): Promise<[ApiResponse<PayoutRequest[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payouts/admin${status ? `?status=${status}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutRequest[]>) : null;
  return [resData, error];
}

export async function ApprovePayoutAction(id: string): Promise<[ApiResponse<PayoutRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payouts/admin/${id}/approve`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutRequest>) : null;
  return [resData, error];
}

export async function RejectPayoutAction(
  id: string,
  reason: string
): Promise<[ApiResponse<PayoutRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payouts/admin/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutRequest>) : null;
  return [resData, error];
}
