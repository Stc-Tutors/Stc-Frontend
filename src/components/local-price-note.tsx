"use client";

import { useEffect, useState } from "react";
import { GetExchangeRatesAction, type ExchangeRatesData } from "@/server/exchange-rates";
import { formatMoney } from "@/lib/money";

// Display-only. Every price is charged in naira (the only currency the payment
// gateway collects today), so for a visitor elsewhere this shows roughly what that
// is in their own money - the amount actually charged never changes.

const EURO_REGIONS = new Set(["IE", "DE", "FR", "ES", "IT", "NL", "BE", "PT", "AT", "FI", "GR", "LU", "MT", "CY", "SK", "SI", "EE", "LV", "LT", "HR"]);
const REGION_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", CA: "CAD", GH: "GHS", ZA: "ZAR", KE: "KES", ZM: "ZMW", CH: "CHF", CN: "CNY",
};

// Best guess from the browser's language region (en-GB -> GBP). Returns undefined
// when it can't tell or the visitor looks Nigerian - then no estimate is shown
// rather than a wrong one.
function detectCurrency(): string | undefined {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (!region || region === "NG") return undefined;
    return EURO_REGIONS.has(region) ? "EUR" : REGION_CURRENCY[region];
  } catch {
    return undefined;
  }
}

let ratesPromise: Promise<ExchangeRatesData | null> | null = null;
function loadRates(): Promise<ExchangeRatesData | null> {
  if (!ratesPromise) {
    ratesPromise = GetExchangeRatesAction()
      .then(([res]) => (res?.data && Object.keys(res.data.rates ?? {}).length > 0 ? res.data : null))
      .catch(() => null);
    // A failed load shouldn't stick for the whole session.
    ratesPromise.then((r) => {
      if (!r) ratesPromise = null;
    });
  }
  return ratesPromise;
}

export function LocalPriceNote({ amountNgn, className }: { amountNgn: number; className?: string }) {
  const [estimate, setEstimate] = useState<{ currency: string; rate: number } | null>(null);

  useEffect(() => {
    const currency = detectCurrency();
    if (!currency) return;
    let cancelled = false;
    loadRates().then((data) => {
      const rate = data?.rates[currency];
      if (!cancelled && rate) setEstimate({ currency, rate });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!estimate || !(amountNgn > 0)) return null;

  const local = amountNgn * estimate.rate;
  // Whole units for big amounts, cents for small ones.
  const rounded = local >= 100 ? Math.round(local) : Math.round(local * 100) / 100;

  return (
    <p className={className ?? "text-sm text-gray-600"}>
      ≈ {formatMoney(rounded, estimate.currency)} · you&apos;ll be charged {formatMoney(amountNgn, "NGN")} in naira, and your bank
      converts it. The exact amount depends on your bank&apos;s rate.
    </p>
  );
}
