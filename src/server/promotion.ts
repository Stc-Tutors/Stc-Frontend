"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Promotion } from "@/types/promotion";

export async function GetActivePromotionsAction(): Promise<[ApiResponse<Promotion[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/promotions/active",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  return [res ? ((await res.json()) as ApiResponse<Promotion[]>) : null, error];
}
