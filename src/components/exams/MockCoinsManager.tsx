"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  AllocateMockCoinsAction,
  GetMockCatalogAdminAction,
  GetMockPricingAdminAction,
  GetMockPurchasesAction,
  GetMockStudentAction,
  RetryMockPurchaseAction,
  SearchExamLearnersAction,
  UpdateMockPricingAction,
  type MockPricing,
  type MockPurchase,
} from "@/server/exam";
import { ExamLearnerHit } from "@/types/exam";
import { mockCoinBalance, mockExamName, mockExamReady, mockPoolBalance } from "@/lib/mock-exam-display";
import { formatMoney } from "@/lib/money";
import { useUser } from "@/contexts/user-context";
import { isSuperOrAlmighty } from "@/lib/roles";

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";
const box = "rounded-xl border p-4 space-y-3";

// Admin tool for the school's mock-exam coins: the pool is bought on the STC Exams dashboard; here an admin gives coins from it to a
// student, a Super Admin sets what a family pays per coin, and any payment that could not be turned into coins is retried.
export default function MockCoinsManager({ backHref }: { backHref: string }) {
  const { user } = useUser();
  const isSuper = !!user && isSuperOrAlmighty(user.role);
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<ExamLearnerHit[]>([]);
  const [picked, setPicked] = useState<ExamLearnerHit | null>(null);
  const [account, setAccount] = useState<Record<string, unknown> | null>(null);
  const [coins, setCoins] = useState(10);
  const [busy, setBusy] = useState(false);
  const [catalog, setCatalog] = useState<Record<string, unknown>[] | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [pricing, setPricing] = useState<MockPricing>({ pricePerCoin: 0, currency: "NGN", minCoins: 1, maxCoins: 500 });
  const [purchases, setPurchases] = useState<MockPurchase[]>([]);

  const loadPurchases = useCallback(async () => {
    const [res] = await GetMockPurchasesAction();
    setPurchases(res?.data ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const [res, error] = await GetMockCatalogAdminAction();
      setCatalog(res?.data ?? null);
      if (error) setCatalogError(error);
      const [pRes] = await GetMockPricingAdminAction();
      if (pRes?.data) setPricing(pRes.data);
      await loadPurchases();
    })();
  }, [loadPurchases]);

  useEffect(() => {
    if (picked || search.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const [res] = await SearchExamLearnersAction(search);
      setHits(res?.data ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [search, picked]);

  const choose = async (hit: ExamLearnerHit) => {
    setPicked(hit);
    setSearch(hit.fullName);
    setHits([]);
    const [res, error] = await GetMockStudentAction(hit.key);
    if (error) ToastError(error);
    setAccount(res?.data?.account ?? null);
  };

  const give = async () => {
    if (!picked) return;
    setBusy(true);
    const [res, error] = await AllocateMockCoinsAction(picked.key, coins);
    if (error || !res?.data) {
      ToastError(error ?? "Could not give coins");
    } else {
      ToastSuccess(`Gave ${coins} coin(s) to ${picked.fullName}`);
      const [after] = await GetMockStudentAction(picked.key);
      setAccount(after?.data?.account ?? null);
    }
    setBusy(false);
  };

  const savePricing = async () => {
    setBusy(true);
    const [res, error] = await UpdateMockPricingAction(pricing);
    if (error || !res?.data) ToastError(error ?? "Could not save the price");
    else ToastSuccess(pricing.pricePerCoin > 0 ? "Coin price saved" : "Coin buying switched off");
    setBusy(false);
  };

  const retry = async (id: string) => {
    setBusy(true);
    const [, error] = await RetryMockPurchaseAction(id);
    if (error) ToastError(error);
    else ToastSuccess("Retried");
    await loadPurchases();
    setBusy(false);
  };

  const balance = mockCoinBalance(account);
  const pool = mockPoolBalance(account);
  const waiting = purchases.filter((p) => p.status === "FAILED");

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-blue-600 hover:underline">
          ← All exams
        </Link>
        <h1 className="text-2xl font-bold mt-1">Mock exam coins</h1>
        <p className="text-sm text-gray-500">
          Students spend coins on practice tests. Coins come from your school&apos;s pool (bought on the STC Exams dashboard). You can give them out
          here, and families can buy more themselves at the price below.
        </p>
      </div>

      {waiting.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
          <h2 className="font-semibold text-amber-900">Paid, coins not added yet ({waiting.length})</h2>
          <p className="text-xs text-amber-800">Usually the school pool ran out. Top it up on the STC Exams dashboard, then retry.</p>
          <ul className="divide-y text-sm">
            {waiting.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-3">
                <div>
                  <p>
                    {p.learnerName} · {p.coins} coin(s) · {formatMoney(p.amount, p.currency)}
                  </p>
                  {p.error && <p className="text-xs text-red-700">{p.error}</p>}
                </div>
                <Button size="sm" onClick={() => retry(p.id)} disabled={busy}>
                  Retry
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={box}>
        <h2 className="font-semibold">Mock exams switched on</h2>
        {catalog === null ? (
          <p className="text-sm text-amber-700">{catalogError || "Not available yet - STC must enable mock exams for your school."}</p>
        ) : catalog.length === 0 ? (
          <p className="text-sm text-gray-500">None yet. Switch exams on in the Mock Exams page of the STC Exams dashboard.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {catalog.map((exam, i) => (
              <span key={i} className="text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1">
                {mockExamName(exam)}
                {mockExamReady(exam) ? "" : " (question bank fee unpaid)"}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className={box}>
        <h2 className="font-semibold">What families pay for coins</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <label className="space-y-1">
            <span className="font-medium">Price per coin</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={field}
              value={pricing.pricePerCoin}
              disabled={!isSuper}
              onChange={(e) => setPricing({ ...pricing, pricePerCoin: Number(e.target.value) })}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium">Currency</span>
            <input
              className={field}
              value={pricing.currency}
              disabled={!isSuper}
              maxLength={3}
              onChange={(e) => setPricing({ ...pricing, currency: e.target.value.toUpperCase() })}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium">Fewest per purchase</span>
            <input
              type="number"
              min={1}
              className={field}
              value={pricing.minCoins}
              disabled={!isSuper}
              onChange={(e) => setPricing({ ...pricing, minCoins: Number(e.target.value) })}
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium">Most per purchase</span>
            <input
              type="number"
              min={1}
              className={field}
              value={pricing.maxCoins}
              disabled={!isSuper}
              onChange={(e) => setPricing({ ...pricing, maxCoins: Number(e.target.value) })}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          {pricing.pricePerCoin > 0 ? "Families can buy coins when theirs run out." : "Price is 0, so families cannot buy coins."}{" "}
          {isSuper ? "Set it to 0 to switch buying off." : "Only a Super Admin can change the price."}
        </p>
        {isSuper && (
          <Button onClick={savePricing} disabled={busy}>
            Save price
          </Button>
        )}
      </section>

      <section className={box}>
        <h2 className="font-semibold">Give coins</h2>
        <input
          className={field}
          placeholder="Search a child by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPicked(null);
            setAccount(null);
          }}
        />
        {hits.length > 0 && (
          <ul className="rounded-md border divide-y text-sm">
            {hits.map((h) => (
              <li key={h.key}>
                <button type="button" className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => choose(h)}>
                  {h.fullName} {h.grade ? <span className="text-gray-500">· {h.grade}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
        {picked && (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">{picked.fullName}</span>:{" "}
              {balance != null ? `${balance} coin(s)` : "no mock account yet (created on their first practice)"}
              {pool != null ? ` · school pool: ${pool}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10000}
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={coins}
                onChange={(e) => setCoins(Number(e.target.value))}
              />
              <Button onClick={give} disabled={busy || !Number.isInteger(coins) || coins < 1}>
                {busy ? "Working..." : "Give coins"}
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className={box}>
        <h2 className="font-semibold">Recent coin purchases</h2>
        {purchases.length === 0 ? (
          <p className="text-sm text-gray-500">No purchases yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {purchases.slice(0, 30).map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-3">
                <span>
                  {p.learnerName} · {p.coins} coin(s) · {formatMoney(p.amount, p.currency)}
                </span>
                <span className={p.status === "ALLOCATED" ? "text-green-700" : p.status === "FAILED" ? "text-red-700" : "text-gray-500"}>
                  {p.status === "ALLOCATED" ? "Added" : p.status === "FAILED" ? "Waiting" : "Processing"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
