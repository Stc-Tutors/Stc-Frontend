"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  AllocateMockCoinsAction,
  GetMockCatalogAction,
  GetMockStudentAction,
  SearchExamLearnersAction,
} from "@/server/exam";
import { ExamLearnerHit } from "@/types/exam";
import { mockCoinBalance, mockExamName, mockExamReady, mockPoolBalance } from "@/lib/mock-exam-display";

const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

// Admin tool for the school's mock-exam coins: the pool is bought on the STC Exams dashboard; here an admin moves coins from it to a
// student, who then spends them on practice tests. Also shows which mock exams STC has switched on.
export default function MockCoinsManager({ backHref }: { backHref: string }) {
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<ExamLearnerHit[]>([]);
  const [picked, setPicked] = useState<ExamLearnerHit | null>(null);
  const [account, setAccount] = useState<Record<string, unknown> | null>(null);
  const [coins, setCoins] = useState(10);
  const [busy, setBusy] = useState(false);
  const [catalog, setCatalog] = useState<Record<string, unknown>[] | null>(null);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    (async () => {
      const [res, error] = await GetMockCatalogAction();
      setCatalog(res?.data ?? null);
      if (error) setCatalogError(error);
    })();
  }, []);

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

  const balance = mockCoinBalance(account);
  const pool = mockPoolBalance(account);

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-blue-600 hover:underline">
          ← All exams
        </Link>
        <h1 className="text-2xl font-bold mt-1">Mock exam coins</h1>
        <p className="text-sm text-gray-500">
          Students spend coins on practice tests. Coins come from your school&apos;s pool (bought on the STC Exams dashboard); give them out here.
        </p>
      </div>

      <section className="rounded-xl border p-4 space-y-2">
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

      <section className="rounded-xl border p-4 space-y-3">
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
                {busy ? "Giving..." : "Give coins"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
