"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { PricePoint, ServicePricing } from "@/types/service-pricing";

// Public/active-only - used by enrollment cost calculation.
export async function GetServicePricingAction(): Promise<[ApiResponse<ServicePricing[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/service-pricing",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ServicePricing[]>) : null;
  return [resData, error];
}

// ADMIN (with MANAGE_PRICING permission)/SUPER_ADMIN - includes inactive rows,
// used by the Service Pricing management page.
export async function GetAdminServicePricingAction(): Promise<[ApiResponse<ServicePricing[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/service-pricing",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ServicePricing[]>) : null;
  return [resData, error];
}

export async function CreateServicePricingAction(data: {
  serviceType: string;
  curriculum?: string;
  gradeLevel?: string;
  subject?: string;
  courseId?: string;
  country?: string;
  prices: PricePoint[];
}): Promise<[ApiResponse<ServicePricing> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/service-pricing",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ServicePricing>) : null;
  return [resData, error];
}

export async function UpdateServicePricingAction(
  id: string,
  data: Partial<{ prices: PricePoint[]; isActive: boolean }>
): Promise<[ApiResponse<ServicePricing> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/service-pricing/${id}`,
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ServicePricing>) : null;
  return [resData, error];
}

export async function DeleteServicePricingAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/service-pricing/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
