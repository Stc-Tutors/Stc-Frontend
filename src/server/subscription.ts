"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { PricingPlan } from "@/types/pricing-plan";
import { Subscription, SubscriptionRestrictions } from "@/types/subscription";
import { PaymentRequest } from "@/types/payment";

export async function GetPublicPricingPlansAction(): Promise<[ApiResponse<PricingPlan[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/pricing-plans",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PricingPlan[]>) : null;
  return [resData, error];
}

export async function SubscribeAction(
  planId: string
): Promise<[ApiResponse<PaymentRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/subscriptions",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PaymentRequest>) : null;
  return [resData, error];
}

export async function GetMySubscriptionsAction(): Promise<[ApiResponse<Subscription[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/subscriptions/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Subscription[]>) : null;
  return [resData, error];
}

export async function GetMyRestrictionsAction(): Promise<[ApiResponse<SubscriptionRestrictions> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/subscriptions/mine/restrictions",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SubscriptionRestrictions>) : null;
  return [resData, error];
}

export async function GetAllSubscriptionsAction(): Promise<[ApiResponse<Subscription[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/subscriptions",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Subscription[]>) : null;
  return [resData, error];
}

export async function PauseSubscriptionAction(
  id: string,
  reason: string
): Promise<[ApiResponse<Subscription> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/subscriptions/${id}/pause`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Subscription>) : null;
  return [resData, error];
}

export async function ResumeSubscriptionAction(
  id: string
): Promise<[ApiResponse<Subscription> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/subscriptions/${id}/resume`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Subscription>) : null;
  return [resData, error];
}
