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
