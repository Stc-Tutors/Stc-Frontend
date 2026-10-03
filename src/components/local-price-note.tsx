"use client";

import { useEffect, useState } from "react";
import { GetExchangeRatesAction, type ExchangeRatesData } from "@/server/exchange-rates";
import { formatMoney } from "@/lib/money";
import { currencyForCountry, currencyFromLocale, getRememberedResidence, rememberResidence } from "@/lib/display-currency";

// Display-only. Prices are charged in naira (the only currency the payment gateway
// collects today), so for a family living elsewhere this shows roughly what that is
// in their own money - the amount actually charged never changes.

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

interface LocalPriceNoteProps {
  amount: number;
  // The currency `amount` is actually charged in. Only naira amounts are converted.
  currency?: string | null;
  // Where the family lives (a country code or name) - decides the currency shown.
  // Omit it and the last residence they entered on this device is used, then the
  // browser's language region.
  country?: string | null;
  // "short" is one line for tight spots (cards, buttons); "full" adds the explanation.
  variant?: "full" | "short";
  className?: string;
}

export function LocalPriceNote({ amount, currency, country, variant = "full", className }: LocalPriceNoteProps) {
  const [estimate, setEstimate] = useState<{ currency: string; rate: number } | null>(null);
  const isNaira = !currency || currency.toUpperCase() === "NGN";

  useEffect(() => {
    if (!isNaira) return;
    if (country) rememberResidence(country);
    const residence = country || getRememberedResidence();
    // A residence we know is authoritative - even Nigeria (no note), rather than
    // falling through to the browser language of someone who lives in Nigeria.
    const target = residence ? currencyForCountry(residence) : currencyFromLocale();
    if (!target) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    loadRates().then((data) => {
      const rate = data?.rates[target];
      if (!cancelled && rate) setEstimate({ currency: target, rate });
    });
    return () => {
      cancelled = true;
    };
  }, [country, isNaira]);

  if (!isNaira || !estimate || !(amount > 0)) return null;

  const local = amount * estimate.rate;
  // Whole units for big amounts, cents for small ones.
  const rounded = local >= 100 ? Math.round(local) : Math.round(local * 100) / 100;

  if (variant === "short") {
    return <span className={className ?? "text-xs text-gray-500"}>≈ {formatMoney(rounded, estimate.currency)}</span>;
  }
  return (
    <p className={className ?? "text-sm text-gray-600"}>
      ≈ {formatMoney(rounded, estimate.currency)} · you&apos;ll be charged {formatMoney(amount, "NGN")} in naira, and your bank
      converts it. The exact amount depends on your bank&apos;s rate.
    </p>
  );
}
