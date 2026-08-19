"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CreateTenantInquiryDto, ITenantInquiry } from "@/types/tenant-inquiry";

// Public - a B2B/white-label prospect submits this from the demo-request
// form. Distinct from the individual-student enrollment flow; reviewed
// platform-owner-side, not auto-provisioned.
export async function CreateTenantInquiryAction(
  data: CreateTenantInquiryDto
): Promise<[ApiResponse<ITenantInquiry> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tenant-inquiries",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITenantInquiry>) : null;
  return [resData, error];
}
