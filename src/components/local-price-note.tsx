"use client";

import { useEffect, useState } from "react";
import { GetExchangeRatesAction, type ExchangeRatesData } from "@/server/exchange-rates";
import { formatMoney } from "@/lib/money";
import { currencyForCountry, currencyFromLocale, getRememberedResidence, rememberResidence } from "@/lib/display-currency";

// Display-only. Shows roughly what a price is in the family's own currency, converted
// from the currency it is charged in - the amount actually charged never changes.

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
  // The currency `amount` is charged in (naira when omitted).
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
  const chargeCode = (currency || "NGN").toUpperCase();

  useEffect(() => {
    if (country) rememberResidence(country);
    const residence = country || getRememberedResidence();
    let cancelled = false;
    loadRates().then((data) => {
      // The "shows in" currency a Super Admin assigned this country wins; otherwise our
      // own guess. A residence we know is authoritative - even Nigeria (no note), rather
      // than falling through to the browser language of someone who lives in Nigeria.
      // Where they live (entered) wins; otherwise where their IP says, then the browser's language.
      const where = residence || data?.viewerCountry || data?.viewerIso || "";
      const assigned = where ? data?.countryCurrencies?.[where.trim()]?.displayCurrency : undefined;
      const target = assigned ?? (where ? currencyForCountry(where) : currencyFromLocale());
      // Rates are per 1 NGN, so any pair converts through naira (NGN itself is 1).
      const perNaira = (code: string) => (code === "NGN" ? 1 : data?.rates[code]);
      const from = perNaira(chargeCode);
      const to = target ? perNaira(target) : undefined;
      if (cancelled) return;
      setEstimate(target && target !== chargeCode && from && to ? { currency: target, rate: (to / from) * (data?.margin ?? 1.03) } : null);
    });
    return () => {
      cancelled = true;
    };
  }, [country, chargeCode]);

  if (!estimate || !(amount > 0)) return null;

  const local = amount * estimate.rate;
  // Whole units for big amounts, cents for small ones.
  const rounded = local >= 100 ? Math.round(local) : Math.round(local * 100) / 100;

  if (variant === "short") {
    return (
      <span className={className ?? "text-xs text-gray-500"} title="Approximate, at today's exchange rate">
        ≈ {formatMoney(rounded, estimate.currency)}
      </span>
    );
  }
  return (
    <p className={className ?? "text-sm text-gray-600"}>
      ≈ {formatMoney(rounded, estimate.currency)} · you&apos;ll be charged {formatMoney(amount, chargeCode)}, and your bank
      converts it. The exact amount depends on your bank&apos;s rate.
    </p>
  );
}
