"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface ExchangeRatesData {
  base: "NGN";
  // Units of each currency per 1 NGN.
  rates: Record<string, number>;
  asOf: string | null;
}

// Display-only estimate rates - nothing is ever charged from these.
export async function GetExchangeRatesAction(): Promise<[ApiResponse<ExchangeRatesData> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/exchange-rates",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ExchangeRatesData>) : null;
  return [resData, error];
}
