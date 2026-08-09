"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { AuditLog, AuditLogFilters } from "@/types/audit-log";

// GET /audit-logs responds with {success, message, data, total, page, limit}
// rather than nesting pagination info under `data` - extend ApiResponse to
// capture the extra top-level fields (see AuditLogController.list).
export interface AuditLogListResponse extends ApiResponse<AuditLog[]> {
  total: number;
  page: number;
  limit: number;
}

export async function GetAuditLogsAction(
  filters?: AuditLogFilters
): Promise<[AuditLogListResponse | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(filters ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/audit-logs${query ? `?${query}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as AuditLogListResponse) : null;
  return [resData, error];
}
