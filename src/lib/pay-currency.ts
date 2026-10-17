import type { ExchangeRatesData } from "@/server/exchange-rates";
import { currencyForCountry } from "@/lib/display-currency";

// The currency a family is CHARGED in. Mirrors the server (PricingService.resolvePreferredCurrency) so that what the
// browser works out and what the server charges can't drift apart: the Super Admin's assignment for where the family
// lives, else that country's own currency, else the one their IP suggests - and anything neither payment gateway can
// collect yet is charged in naira.
export function resolvePayCurrency(data: ExchangeRatesData | null | undefined, residence?: string | null): string {
  const where = residence?.trim();
  const assigned = where ? data?.countryCurrencies?.[where]?.payCurrency : undefined;
  const byCountry = where ? (where.toUpperCase() === "NG" || where.toLowerCase() === "nigeria" ? "NGN" : currencyForCountry(where)) : undefined;
  const wanted = assigned ?? byCountry ?? data?.viewerCurrency ?? "NGN";
  return data?.collectibleCurrencies?.includes(wanted) ? wanted : "NGN";
}
