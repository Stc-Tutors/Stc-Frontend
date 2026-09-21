"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { WalletBalance, WalletTopUpResponse, WalletTransaction } from "@/types/wallet";

export interface WalletOverview {
  balances: WalletBalance[];
  transactions: WalletTransaction[];
}

// Balances + history in ONE Server Action (fetched in parallel here) - the page
// used to await two actions back to back, and the client only dispatches one
// at a time anyway. If either half fails the whole thing errors, so a transient
// failure never replaces good cached data with an empty wallet.
export async function GetMyWalletOverviewAction(): Promise<[ApiResponse<WalletOverview> | null, string | null]> {
  const [[balancesRes, balancesError], [transactionsRes, transactionsError]] = await Promise.all([
    GetMyWalletBalancesAction(),
    GetMyWalletTransactionsAction(),
  ]);
  const error = balancesError ?? transactionsError;
  if (error) return [null, error];
  return [
    {
      success: true,
      message: "Wallet fetched successfully",
      data: { balances: balancesRes?.data ?? [], transactions: transactionsRes?.data ?? [] },
    },
    null,
  ];
}

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
