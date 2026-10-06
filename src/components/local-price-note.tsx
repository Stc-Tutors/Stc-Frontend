"use client";

import { useEffect, useState, type ReactNode } from "react";
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

interface Estimate {
  currency: string;
  // Multiply an amount in the charged currency by this to get the estimate in `currency`.
  rate: number;
}

// The currency to show this visitor, and the rate from the currency the price is charged in.
// null when there is nothing to show (they live where the price is already in their money, or
// we can't tell, or the rates are unavailable).
function useLocalEstimate(currency?: string | null, country?: string | null): Estimate | null {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const chargeCode = (currency || "NGN").toUpperCase();

  useEffect(() => {
    if (country) rememberResidence(country);
    const residence = country || getRememberedResidence();
    let cancelled = false;
    loadRates().then((data) => {
      // Where they live (entered) wins; otherwise where their IP says, then the browser's language.
      const where = residence || data?.viewerCountry || data?.viewerIso || "";
      // The "shows in" currency a Super Admin assigned this country wins; otherwise our own guess.
      // A residence we know is authoritative - even Nigeria (no note), rather than falling through
      // to the browser language of someone who lives in Nigeria.
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

  return estimate;
}

function estimateText(amount: number, estimate: Estimate): string {
  const local = amount * estimate.rate;
  // Whole units for big amounts, cents for small ones.
  const rounded = local >= 100 ? Math.round(local) : Math.round(local * 100) / 100;
  return formatMoney(rounded, estimate.currency);
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

// A small "≈ their currency" line beside a price that is shown as it is. Used where the figure is
// money already held or paid (balances, history), which stays in the currency it was in.
export function LocalPriceNote({ amount, currency, country, variant = "full", className }: LocalPriceNoteProps) {
  const estimate = useLocalEstimate(currency, country);
  if (!estimate || !(amount > 0)) return null;

  if (variant === "short") {
    return (
      <span className={className ?? "text-xs text-gray-500"} title="Approximate, at today's exchange rate">
        ≈ {estimateText(amount, estimate)}
      </span>
    );
  }
  return (
    <p className={className ?? "text-sm text-gray-600"}>
      ≈ {estimateText(amount, estimate)} · you&apos;ll be charged {formatMoney(amount, (currency || "NGN").toUpperCase())}, and your
      bank converts it. The exact amount depends on your bank&apos;s rate.
    </p>
  );
}

interface LocalFirstPriceProps {
  amount: number;
  currency?: string | null;
  country?: string | null;
  // Spell out that their bank converts the charge (for the main price on a page).
  explain?: boolean;
  // The price exactly as it would normally be shown, in the currency it is charged in.
  children: ReactNode;
}

// For a price someone is about to pay: their own currency is the prominent figure (it takes the
// styling of the element this sits in), and the amount actually charged is stated plainly just
// beneath it - never hidden, because that is what appears at checkout and on their bank statement.
// Where there is nothing to convert, it renders the price as it normally is.
export function LocalFirstPrice({ amount, currency, country, explain, children }: LocalFirstPriceProps) {
  const estimate = useLocalEstimate(currency, country);
  if (!estimate || !(amount > 0)) return <>{children}</>;

  return (
    <>
      <span className="block" title="Approximate, at today's exchange rate">
        ≈ {estimateText(amount, estimate)}
      </span>
      <span className="block text-xs font-normal text-gray-600">
        Charged as {children}
        {explain ? " · your bank converts it at its own rate" : ""}
      </span>
    </>
  );
}
