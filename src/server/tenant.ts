"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface TenantBranding {
  displayName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  supportEmail?: string;
}

export interface TenantInfo {
  name: string;
  slug: string;
  branding: TenantBranding;
}

// Public, unauthenticated - resolves which white-label company this request
// is for from the Origin header (see stcbe's tenant-origin.middleware.ts),
// so a second company's own deployment of this app gets its own name/logo/
// colors instead of STC's, with zero config beyond registering their origin
// on their Tenant record.
export async function GetTenantAction(): Promise<[ApiResponse<TenantInfo> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/tenant",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TenantInfo>) : null;
  return [resData, error];
}

export interface MyTenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  allowedOrigins: string[];
  branding: TenantBranding;
}

// A tenant's own SUPER_ADMIN managing their own tenancy - always resolved
// server-side from the caller's own tenantId, never any other tenant's. See
// stcbe's SuperAdminService.getMyTenant/updateMyTenant.
export async function GetMyTenantAction(): Promise<[ApiResponse<MyTenant> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/super-admin/my-tenant",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<MyTenant>) : null;
  return [resData, error];
}

export async function UpdateMyTenantAction(
  data: Partial<{ allowedOrigins: string[]; branding: TenantBranding }>
): Promise<[ApiResponse<MyTenant> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/super-admin/my-tenant",
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<MyTenant>) : null;
  return [resData, error];
}
