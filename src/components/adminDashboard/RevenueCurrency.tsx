"use client";

import { useEffect, useState } from "react";
import { GetFinanceOverviewAction } from "@/server/admin";
import { formatMoney } from "@/lib/money";
import type { CurrencyBalance } from "@/types/admin";

// The platform takes money in several currencies, and amounts in different currencies are never added together - so every
// revenue figure for the admins is for ONE currency at a time, picked here, and the totals per currency are listed side by side.
// Both read the per-currency finance overview (needs the financial-reports permission - without it there is nothing to offer
// beyond naira, and nothing is shown).
let balancesPromise: Promise<CurrencyBalance[]> | null = null;

function loadBalances(): Promise<CurrencyBalance[]> {
  if (!balancesPromise) {
    balancesPromise = GetFinanceOverviewAction()
      .then(([res]) => res?.data?.balances ?? [])
      .catch(() => []);
  }
  return balancesPromise;
}

export function useCurrencyBalances(): CurrencyBalance[] {
  const [balances, setBalances] = useState<CurrencyBalance[]>([]);
  useEffect(() => {
    let active = true;
    loadBalances().then((b) => active && setBalances(b));
    return () => {
      active = false;
    };
  }, []);
  return balances;
}

// A "Show revenue in" dropdown - renders nothing while naira is the only currency with revenue.
export function RevenueCurrencySelect({ value, onChange, className }: { value: string; onChange: (currency: string) => void; className?: string }) {
  const balances = useCurrencyBalances();
  const options = Array.from(new Set(["NGN", ...balances.map((b) => b.currency)]));
  if (options.length < 2) return null;
  return (
    <label className={className ?? "flex items-center gap-2 text-sm text-gray-600"}>
      Show revenue in
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white">
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

// Revenue collected, paid out and net - one row per currency. Renders nothing until there is something to show.
export function MoneyByCurrency() {
  const balances = useCurrencyBalances();
  if (balances.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="font-semibold mb-1">Revenue and balance by currency</h2>
      <p className="text-xs text-gray-500 mb-4">All-time. Currencies are never added together - each is its own line.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="py-2">Currency</th>
              <th>Revenue collected</th>
              <th>Paid out</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b) => (
              <tr key={b.currency} className="border-b last:border-none">
                <td className="py-2 font-medium">{b.currency}</td>
                <td>{formatMoney(b.revenue, b.currency)}</td>
                <td>{formatMoney(b.paidOut, b.currency)}</td>
                <td>{formatMoney(b.balance, b.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
