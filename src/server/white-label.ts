"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { WhiteLabelOffering } from "@/types/white-label";

// Public, unauthenticated - powers the B2B White-Label LMS marketing page.
// `data: null` means nobody's configured it yet in Stc-SuperAdmin's White
// Label tab, not that the offering doesn't exist.
export async function GetWhiteLabelAction(): Promise<[ApiResponse<WhiteLabelOffering | null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/white-label",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<WhiteLabelOffering | null>) : null;
  return [resData, error];
}
