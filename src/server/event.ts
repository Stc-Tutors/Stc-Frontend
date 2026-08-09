"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { PlatformEvent } from "@/types/event";

// Role-scoped: backend narrows to what the caller should see (own linked
// students' invites, own tutor-tagged events, or admin-scope courses) - see
// EventService.listInRange in stcbe.
export async function GetMyEventsAction(
  from: string,
  to: string
): Promise<[ApiResponse<PlatformEvent[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/events?from=${from}&to=${to}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PlatformEvent[]>) : null;
  return [resData, error];
}
