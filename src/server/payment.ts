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

