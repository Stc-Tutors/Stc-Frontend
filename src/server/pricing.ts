"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { PricingQuote, QuotePricingPayload } from "@/types/pricing";

// POST /pricing/quote - live, server-authoritative price for a
// service/curriculum/subject/course/gradeLevel/country combination. Used by
// the Service Marketplace to show a real price as a parent narrows down a
// course selection, before EnrollInCourseAction + InitiatePaymentAction.
export async function QuotePricingAction(
  data: QuotePricingPayload
): Promise<[ApiResponse<PricingQuote> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/pricing/quote",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PricingQuote>) : null;
  return [resData, error];
}
