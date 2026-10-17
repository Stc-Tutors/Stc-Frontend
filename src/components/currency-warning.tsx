"use client";

import { useEffect, useState } from "react";
import { GetExchangeRatesAction } from "@/server/exchange-rates";

// Shown beside a currency an admin has picked for a price: a price in a currency no payment gateway collects can be saved,
// but nobody can buy it until the currency is enabled (backend settings PAYSTACK_ENABLED_CURRENCIES /
// FLUTTERWAVE_ENABLED_CURRENCIES). Renders nothing for a currency that can be charged, or while that is still unknown.
let collectiblePromise: Promise<string[] | null> | null = null;

export function CurrencyWarning({ currency, compact = false }: { currency: string; compact?: boolean }) {
  const [collectible, setCollectible] = useState<string[] | null>(null);

  useEffect(() => {
    if (!collectiblePromise) collectiblePromise = GetExchangeRatesAction()
        .then(([res]) => res?.data?.collectibleCurrencies ?? null)
        .catch(() => null);
    let active = true;
    collectiblePromise.then((list) => active && setCollectible(list));
    return () => {
      active = false;
    };
  }, []);

  if (!collectible || collectible.includes(currency)) return null;
  const why = `${currency} can't be charged yet - no payment gateway is enabled for it, so this can't be bought until one is.`;
  if (compact) {
    return (
      <span className="text-xs text-amber-700" title={why}>
        can&apos;t be charged yet
      </span>
    );
  }
  return <p className="text-xs text-amber-700 mt-1">{why}</p>;
}
