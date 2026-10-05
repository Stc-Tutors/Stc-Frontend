"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface ExchangeRatesData {
  base: "NGN";
  // Units of each currency per 1 NGN.
  rates: Record<string, number>;
  asOf: string | null;
  // What a Super Admin assigned each country (keyed by the country's value): the currency
  // it is charged in, and the currency the family sees an approximate figure in.
  countryCurrencies?: Record<string, { payCurrency: string; displayCurrency: string | null }>;
  // Applied once to the converted figure so the estimate leans slightly high.
  margin?: number;
  // Where the visitor is, from their IP (null when unknown) - used until they say where they live.
  viewerCountry?: string | null;
  viewerIso?: string | null;
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
