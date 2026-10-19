"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import type { ManualSectionDto } from "@/types/manual";

// The manuals this person is allowed to read - the backend decides which ones (their own role's, plus the shared "getting started"
// chapter), so a family never receives the admin manual at all.
export async function GetManualsAction(): Promise<[ApiResponse<ManualSectionDto[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/docs/manual",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ManualSectionDto[]>) : null;
  return [resData, error];
}
