"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  ReferralBalance,
  ReferralBank,
  ReferralEarning,
  ReferralPayoutProfile,
  ReferralPayoutRequest,
  ReferralSettings,
} from "@/types/referral";

export async function GetMyReferralLinkAction(): Promise<
  [ApiResponse<{ link: string; code: string }> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/referrals/link",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<{ link: string; code: string }>) : null;
  return [resData, error];
}

// For someone who already has an account (or is enrolling a course rather
// than signing up fresh) and wants to credit a referrer manually instead of
// via the silent ?ref= link - see stcbe's ReferralService.applyReferralCode.
// Settable only once per account.
export async function ApplyReferralCodeAction(code: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/apply-code",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

export async function GetMyReferralBalanceAction(): Promise<[ApiResponse<ReferralBalance> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/balance",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralBalance>) : null;
  return [resData, error];
}

export async function GetMyReferralEarningsAction(): Promise<[ApiResponse<ReferralEarning[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralEarning[]>) : null;
  return [resData, error];
}

export async function ListReferralBanksAction(): Promise<[ApiResponse<ReferralBank[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/banks",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralBank[]>) : null;
  return [resData, error];
}

export async function GetMyReferralProfileAction(): Promise<[ApiResponse<ReferralPayoutProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/profile",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutProfile>) : null;
  return [resData, error];
}

export async function SetReferralBankDetailsAction(data: {
  bankName: string;
  bankCode: string;
  accountNumber: string;
}): Promise<[ApiResponse<ReferralPayoutProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/profile/bank",
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutProfile>) : null;
  return [resData, error];
}

export async function RequestReferralWithdrawalAction(): Promise<[ApiResponse<ReferralPayoutRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/withdrawals",
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutRequest>) : null;
  return [resData, error];
}

export async function GetMyReferralWithdrawalsAction(): Promise<[ApiResponse<ReferralPayoutRequest[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/withdrawals/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutRequest[]>) : null;
  return [resData, error];
}

export async function GetReferralSettingsAction(): Promise<[ApiResponse<ReferralSettings> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/settings",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralSettings>) : null;
  return [resData, error];
}

// Admin (SUPER_ADMIN/ALMIGHTY_ADMIN, or an admin granted MANAGE_REFERRAL_SETTINGS)

export async function ListAllReferralWithdrawalsAction(
  status?: string
): Promise<[ApiResponse<ReferralPayoutRequest[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/referrals/admin/withdrawals${status ? `?status=${status}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutRequest[]>) : null;
  return [resData, error];
}

export async function ApproveReferralWithdrawalAction(
  id: string
): Promise<[ApiResponse<ReferralPayoutRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/referrals/admin/withdrawals/${id}/approve`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutRequest>) : null;
  return [resData, error];
}

export async function RejectReferralWithdrawalAction(
  id: string,
  reason: string
): Promise<[ApiResponse<ReferralPayoutRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/referrals/admin/withdrawals/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralPayoutRequest>) : null;
  return [resData, error];
}

export async function UpdateReferralSettingsAction(
  percentage: number
): Promise<[ApiResponse<ReferralSettings> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/referrals/admin/settings",
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percentage }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ReferralSettings>) : null;
  return [resData, error];
}
