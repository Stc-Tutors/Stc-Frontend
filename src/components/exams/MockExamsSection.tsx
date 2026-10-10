"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  BuyMockCoinsAction,
  GetMockBalanceAction,
  GetMockCatalogAction,
  GetMockLearnersAction,
  GetMockPricingAction,
  LaunchMockAction,
  type MockPricing,
} from "@/server/exam";
import { VerifyPaymentAction } from "@/server/payment";
import { mockCoinBalance, mockExamName, mockExamReady } from "@/lib/mock-exam-display";
import { formatMoney } from "@/lib/money";

// Practice ("mock") exams from STC Exams' school question bank, shared by students and parents. A parent gets one row per child. Each
// practice costs coins from the child's balance - an admin can give them, and the family can buy more here once they run out.
export default function MockExamsSection() {
  const [learners, setLearners] = useState<{ key: string; fullName: string }[]>([]);
  const [catalog, setCatalog] = useState<Record<string, unknown>[]>([]);
  const [coins, setCoins] = useState<Record<string, number | undefined>>({});
  const [pricing, setPricing] = useState<MockPricing | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [available, setAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadBalances = useCallback(async (people: { key: string }[]) => {
    const balances: Record<string, number | undefined> = {};
    for (const p of people) {
      const [bRes] = await GetMockBalanceAction(p.key);
      balances[p.key] = mockCoinBalance(bRes?.data ?? null);
    }
    setCoins(balances);
  }, []);

  const load = useCallback(async () => {
    const [lRes] = await GetMockLearnersAction();
    const people = lRes?.data ?? [];
    setLearners(people);
    // The catalog doubles as the "is this switched on?" check: STC answers 403 until the mock-exam capability is enabled for the school.
    const [cRes, cError] = await GetMockCatalogAction();
    if (cError || !cRes?.data) {
      setAvailable(false);
      setIsLoading(false);
      return;
    }
    setCatalog(cRes.data);
    const [pRes] = await GetMockPricingAction();
    setPricing(pRes?.data ?? null);
    await loadBalances(people);
    setIsLoading(false);
  }, [loadBalances]);

  useEffect(() => {
    load();
  }, [load]);

  const practise = async (key: string) => {
    setBusyKey(`practise:${key}`);
    // Reserve the tab inside the click, or the browser blocks it as a popup once we have awaited the link.
    const tab = window.open("", "_blank");
    const [res, error] = await LaunchMockAction(key);
    setBusyKey(null);
    if (error || !res?.data) {
      tab?.close();
      ToastError(error ?? "Could not open mock exams");
      return;
    }
    if (tab) {
      tab.opener = null;
      tab.location.href = res.data.launchUrl;
    } else {
      window.location.assign(res.data.launchUrl);
    }
  };

  const quantityFor = (key: string) => qty[key] ?? Math.max(pricing?.minCoins ?? 1, 10);

  const buy = async (key: string) => {
    const count = quantityFor(key);
    setBusyKey(`buy:${key}`);
    const [res, error] = await BuyMockCoinsAction(key, count);
    if (error || !res?.data) {
      ToastError(error ?? "Could not start payment");
      setBusyKey(null);
      return;
    }
    const finish = async () => {
      ToastSuccess("Payment received - the coins are being added.");
      await loadBalances(learners);
      setBusyKey(null);
    };
    // Fully covered by the wallet: the server already completed it, so there is nothing to pay in a popup.
    if (res.data.fullyCoveredByWallet) {
      await finish();
      return;
    }
    const { default: PaystackPop } = await import("@paystack/inline-js");
    new PaystackPop().resumeTransaction(res.data.access_code, {
      onSuccess: async () => {
        const [, verifyError] = await VerifyPaymentAction(res.data!.reference);
        if (verifyError) {
          ToastError(verifyError);
          setBusyKey(null);
          return;
        }
        await finish();
      },
      onCancel: () => {
        ToastError("Payment was not completed.");
        setBusyKey(null);
      },
      onError: (err: { message?: string }) => {
        ToastError(err?.message || "Payment failed. Please try again.");
        setBusyKey(null);
      },
    });
  };

  // Nothing to say when the school has not got mock exams (or this person has no one to practise for) - stay out of the way.
  if (isLoading || !available || learners.length === 0) return null;

  const canBuy = !!pricing && pricing.pricePerCoin > 0;

  return (
    <section className="border-t pt-4 space-y-3">
      <h2 className="text-xl font-semibold">Mock exams</h2>
      <p className="text-sm text-gray-500">Practise past-paper style tests. Each practice uses coins.</p>
      {catalog.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {catalog.map((exam, i) => (
            <span
              key={i}
              className={`text-xs rounded-full px-2 py-1 ${mockExamReady(exam) ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}
            >
              {mockExamName(exam)}
              {mockExamReady(exam) ? "" : " (coming soon)"}
            </span>
          ))}
        </div>
      )}
      <ul className="divide-y">
        {learners.map((l) => {
          const balance = coins[l.key];
          const out = balance == null || balance <= 0;
          const count = quantityFor(l.key);
          return (
            <li key={l.key} className="py-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{l.fullName}</p>
                  <p className={`text-xs ${out ? "text-amber-700" : "text-gray-500"}`}>
                    {balance != null ? `${balance} coin(s) left` : "No coins yet"}
                    {out && canBuy ? " - buy more to keep practising" : ""}
                  </p>
                </div>
                <Button onClick={() => practise(l.key)} disabled={busyKey === `practise:${l.key}`}>
                  {busyKey === `practise:${l.key}` ? "Opening..." : "Practise"}
                </Button>
              </div>
              {canBuy && pricing && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    type="number"
                    min={pricing.minCoins}
                    max={pricing.maxCoins}
                    className="w-24 rounded-md border border-gray-300 px-2 py-1"
                    value={count}
                    onChange={(e) => setQty({ ...qty, [l.key]: Number(e.target.value) })}
                    aria-label={`Coins to buy for ${l.fullName}`}
                  />
                  <Button
                    size="sm"
                    variant={out ? "default" : "outline"}
                    onClick={() => buy(l.key)}
                    disabled={busyKey === `buy:${l.key}` || !Number.isInteger(count) || count < pricing.minCoins || count > pricing.maxCoins}
                  >
                    {busyKey === `buy:${l.key}` ? "Starting..." : `Buy coins · ${formatMoney(count * pricing.pricePerCoin, pricing.currency)}`}
                  </Button>
                  <span className="text-xs text-gray-500">{formatMoney(pricing.pricePerCoin, pricing.currency)} per coin</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
