"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { ReportedEntityType } from "@/types/moderation";

// Any authenticated role can file one - see stcbe's moderation.routes.ts
// (`router.use(authMiddleware())` with no role list on POST /reports). Lands
// in Stc-SuperAdmin's Approvals > Content Reports queue for review.
export async function ReportContentAction(
  entityType: ReportedEntityType,
  entityId: string,
  reason: string
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/moderation/reports",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId, reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
