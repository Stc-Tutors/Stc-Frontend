"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { WalletBalance, WalletTopUpResponse, WalletTransaction } from "@/types/wallet";

export async function GetMyWalletBalancesAction(): Promise<[ApiResponse<WalletBalance[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/wallet/balances",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<WalletBalance[]>) : null;
  return [resData, error];
}

export async function GetMyWalletTransactionsAction(
  currency?: string
): Promise<[ApiResponse<WalletTransaction[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/wallet/transactions${currency ? `?currency=${currency}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<WalletTransaction[]>) : null;
  return [resData, error];
}

export async function TopUpWalletAction(
  amount: number,
  currency = "NGN"
): Promise<[ApiResponse<WalletTopUpResponse> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/wallet/topup",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<WalletTopUpResponse>) : null;
  return [resData, error];
}

// Admin/support visibility (ADMIN_ROLES/HOD/SUPER_ADMIN/ALMIGHTY_ADMIN)
export async function GetWalletBalancesByUserAction(
  userId: string
): Promise<[ApiResponse<WalletBalance[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/wallet/admin/by-user/${userId}/balances`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<WalletBalance[]>) : null;
  return [resData, error];
}
