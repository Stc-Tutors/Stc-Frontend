"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import { GetMockBalanceAction, GetMockCatalogAction, GetMockLearnersAction, LaunchMockAction } from "@/server/exam";
import { mockCoinBalance, mockExamName, mockExamReady } from "@/lib/mock-exam-display";

// Practice ("mock") exams from STC Exams' school question bank, shared by students and parents. A parent gets one row per child. Each
// practice costs coins from the child's balance, which an admin gives them - the balance shows here so they know before they start.
export default function MockExamsSection() {
  const [learners, setLearners] = useState<{ key: string; fullName: string }[]>([]);
  const [catalog, setCatalog] = useState<Record<string, unknown>[]>([]);
  const [coins, setCoins] = useState<Record<string, number | undefined>>({});
  const [available, setAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

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
    const balances: Record<string, number | undefined> = {};
    for (const p of people) {
      const [bRes] = await GetMockBalanceAction(p.key);
      balances[p.key] = mockCoinBalance(bRes?.data ?? null);
    }
    setCoins(balances);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const practise = async (key: string) => {
    setBusyKey(key);
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

  // Nothing to say when the school has not got mock exams (or this person has no one to practise for) - the section simply stays out of the way.
  if (isLoading || !available || learners.length === 0) return null;

  return (
    <section className="border-t pt-4 space-y-3">
      <h2 className="text-xl font-semibold">Mock exams</h2>
      <p className="text-sm text-gray-500">
        Practise past-paper style tests. Each practice uses coins your school gives you.
      </p>
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
        {learners.map((l) => (
          <li key={l.key} className="py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{l.fullName}</p>
              <p className="text-xs text-gray-500">
                {coins[l.key] != null ? `${coins[l.key]} coin(s)` : "No coins yet - ask your school to add some"}
              </p>
            </div>
            <Button onClick={() => practise(l.key)} disabled={busyKey === l.key}>
              {busyKey === l.key ? "Opening..." : "Practise"}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
