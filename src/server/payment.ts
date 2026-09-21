"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CreatePaymentPayload, Payment, PaymentRequest, SpendingSummary } from "@/types/payment";

export async function InitiatePaymentAction(
  data: CreatePaymentPayload
): Promise<[ApiResponse<PaymentRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payments/initialize",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PaymentRequest>) : null;

  return [resData, error];
}


export interface PaymentsOverview {
  payments: Payment[];
  summary: SpendingSummary | null;
}

// Payment list + spending summary in one Server Action (fetched in parallel
// here) - the page used to fire the two separately and the client dispatches
// Server Actions one at a time. Either half failing hard-fails the read, so a
// hiccup never replaces good cached data with an empty list.
export async function GetPaymentsOverviewAction(): Promise<[ApiResponse<PaymentsOverview> | null, string | null]> {
  const [[paymentsRes, paymentsError], [summaryRes]] = await Promise.all([GetPaymentsAction(), GetMySpendingSummaryAction()]);
  if (paymentsError) return [null, paymentsError];
  return [
    { success: true, message: "Payments fetched successfully", data: { payments: paymentsRes?.data ?? [], summary: summaryRes?.data ?? null } },
    null,
  ];
}

export async function GetPaymentsAction(): Promise<[ApiResponse<Payment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payments",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

const resData = res ? ((await res.json()) as ApiResponse<Payment[]>) : null;
return [resData, error];
}

export async function GetMySpendingSummaryAction(): Promise<[ApiResponse<SpendingSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payments/mine/summary",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SpendingSummary>) : null;
  return [resData, error];
}

// Best-effort, client-triggered fallback for when Paystack's webhook hasn't
// (yet, or ever) reached the backend - call right after Paystack's checkout
// reports success (or from a manual "I've paid" action) so the enrollment
// doesn't sit at Pending waiting on a webhook that may never arrive. Safe to
// call more than once for the same reference (see stcbe's
// PaymentService.verifyTransaction).
export async function VerifyPaymentAction(
  reference: string
): Promise<[ApiResponse<{ status: string }> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/payments/verify/${reference}`,
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<{ status: string }>) : null;
  return [resData, error];
}
