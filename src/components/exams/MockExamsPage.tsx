"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  GetMyMockAttemptsAction,
  GetMyMockExamsAction,
  GetMyMockLearnersAction,
  GetMyMockSubjectsAction,
  LaunchMyMockAction,
} from "@/server/exam-mock";
import { BuyMockCoinsAction, GetMockBalanceAction, GetMockPricingAction, type MockPricing } from "@/server/exam";
import { VerifyPaymentAction } from "@/server/payment";
import { mockCoinBalance } from "@/lib/mock-exam-display";
import { formatMoney } from "@/lib/money";
import type { MockAttempt, MockExamSubjects, MyMockExam, MyMockLearner } from "@/types/exam-mock";

// The student/parent Mock Exams page (same page for both - the backend scopes everything to the family). Mock exams are switched on per
// student by an admin; a child without it sees a plain "not switched on" note. A parent picks a child first.
export default function MockExamsPage() {
  const [learners, setLearners] = useState<MyMockLearner[]>([]);
  const [exams, setExams] = useState<MyMockExam[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [pricing, setPricing] = useState<MockPricing | null>(null);
  const [coins, setCoins] = useState<number | undefined>(undefined);
  const [qty, setQty] = useState(10);
  const [openExam, setOpenExam] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<MockExamSubjects | null>(null);
  const [attempts, setAttempts] = useState<MockAttempt[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const learner = learners.find((l) => l.key === activeKey) ?? null;

  const loadChild = useCallback(async (key: string) => {
    const [bRes] = await GetMockBalanceAction(key);
    setCoins(mockCoinBalance(bRes?.data ?? null));
    const [aRes] = await GetMyMockAttemptsAction(key);
    setAttempts(aRes?.data?.attempts ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const [lRes] = await GetMyMockLearnersAction();
      const people = lRes?.data ?? [];
      setLearners(people);
      const first = people.find((p) => p.enabled) ?? people[0];
      setActiveKey(first?.key ?? null);
      if (people.some((p) => p.enabled)) {
        const [eRes, eError] = await GetMyMockExamsAction();
        if (eError) setAvailable(false);
        setExams(eRes?.data ?? []);
        const [pRes] = await GetMockPricingAction();
        setPricing(pRes?.data ?? null);
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeKey || !learners.find((l) => l.key === activeKey)?.enabled) return;
    setOpenExam(null);
    setSubjects(null);
    loadChild(activeKey);
  }, [activeKey, learners, loadChild]);

  const chooseExam = async (examId: number) => {
    if (openExam === examId) return setOpenExam(null);
    if (!activeKey) return;
    setOpenExam(examId);
    setSubjects(null);
    const [res, error] = await GetMyMockSubjectsAction(examId, activeKey);
    if (error) ToastError(error);
    setSubjects(res?.data ?? null);
  };

  const start = async (selection: { examId?: number; subjectId?: number; topicId?: number }, tag: string) => {
    if (!activeKey) return;
    setBusy(tag);
    // Reserve the tab inside the click, or the browser blocks it as a popup once we have awaited the link.
    const tab = window.open("", "_blank");
    const [res, error] = await LaunchMyMockAction(activeKey, selection);
    setBusy(null);
    if (error || !res?.data) {
      tab?.close();
      return ToastError(error ?? "Could not open the practice test");
    }
    if (tab) {
      tab.opener = null;
      tab.location.href = res.data.launchUrl;
    } else window.location.assign(res.data.launchUrl);
  };

  const buy = async () => {
    if (!activeKey) return;
    setBusy("buy");
    const [res, error] = await BuyMockCoinsAction(activeKey, qty);
    if (error || !res?.data) {
      ToastError(error ?? "Could not start payment");
      return setBusy(null);
    }
    const finish = async () => {
      ToastSuccess("Payment received - the coins are being added.");
      await loadChild(activeKey);
      setBusy(null);
    };
    if (res.data.fullyCoveredByWallet) return finish();
    const { default: PaystackPop } = await import("@paystack/inline-js");
    new PaystackPop().resumeTransaction(res.data.access_code, {
      onSuccess: async () => {
        const [, verifyError] = await VerifyPaymentAction(res.data!.reference);
        if (verifyError) {
          ToastError(verifyError);
          return setBusy(null);
        }
        await finish();
      },
      onCancel: () => {
        ToastError("Payment was not completed.");
        setBusy(null);
      },
      onError: (err: { message?: string }) => {
        ToastError(err?.message || "Payment failed. Please try again.");
        setBusy(null);
      },
    });
  };

  if (isLoading) return <div className="bg-white shadow rounded-2xl p-6 text-sm text-gray-500">Loading mock exams...</div>;

  if (learners.length === 0 || !learners.some((l) => l.enabled)) {
    return (
      <div className="bg-white shadow rounded-2xl p-6 space-y-2">
        <h1 className="text-2xl font-bold">Mock exams</h1>
        <p className="text-sm text-gray-500">
          Mock exams have not been switched on for {learners.length > 1 ? "your children" : "this account"} yet. Ask your school to turn them on.
        </p>
      </div>
    );
  }

  const out = coins == null || coins <= 0;
  const canBuy = !!pricing && pricing.pricePerCoin > 0;

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Mock exams</h1>
        <p className="text-sm text-gray-500">Practise past-paper style tests. Each practice uses coins.</p>
      </div>

      {learners.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {learners.map((l) => (
            <Button key={l.key} size="sm" variant={l.key === activeKey ? "default" : "outline"} onClick={() => setActiveKey(l.key)}>
              {l.fullName}
              {l.enabled ? "" : " (off)"}
            </Button>
          ))}
        </div>
      )}

      {learner && !learner.enabled ? (
        <p className="text-sm text-gray-500">Mock exams are not switched on for {learner.fullName}. Ask your school to turn them on.</p>
      ) : (
        learner && (
          <>
            <section className="rounded-xl border p-4 space-y-2">
              <p className="font-medium">{learner.fullName}</p>
              <p className={`text-sm ${out ? "text-amber-700" : "text-gray-600"}`}>
                {coins != null ? `${coins} coin(s) left` : "No coins yet"}
                {out && canBuy ? " - buy more to keep practising" : out ? " - ask your school for coins" : ""}
              </p>
              {canBuy && pricing && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    type="number"
                    min={pricing.minCoins}
                    max={pricing.maxCoins}
                    className="w-24 rounded-md border border-gray-300 px-2 py-1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    aria-label="Coins to buy"
                  />
                  <Button
                    size="sm"
                    variant={out ? "default" : "outline"}
                    onClick={buy}
                    disabled={busy === "buy" || !Number.isInteger(qty) || qty < pricing.minCoins || qty > pricing.maxCoins}
                  >
                    {busy === "buy" ? "Starting..." : `Buy coins · ${formatMoney(qty * pricing.pricePerCoin, pricing.currency)}`}
                  </Button>
                  <span className="text-xs text-gray-500">{formatMoney(pricing.pricePerCoin, pricing.currency)} per coin</span>
                </div>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Choose an exam</h2>
              {!available || exams.length === 0 ? (
                <p className="text-sm text-gray-500">No mock exams are available right now.</p>
              ) : (
                <ul className="space-y-2">
                  {exams.map((e) => (
                    <li key={e.id} className="rounded-xl border p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{e.name}</p>
                          <p className="text-xs text-gray-500">{e.country ?? ""}{e.ready ? "" : " · coming soon"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => chooseExam(e.id)} disabled={!e.ready}>
                            {openExam === e.id ? "Hide subjects" : "Subjects & topics"}
                          </Button>
                          <Button size="sm" onClick={() => start({ examId: e.id }, `exam:${e.id}`)} disabled={!e.ready || busy === `exam:${e.id}`}>
                            {busy === `exam:${e.id}` ? "Opening..." : "Start"}
                          </Button>
                        </div>
                      </div>
                      {openExam === e.id &&
                        (subjects ? (
                          <ul className="divide-y text-sm">
                            {subjects.subjects.length === 0 && <li className="py-2 text-gray-500">No subjects available for this student.</li>}
                            {subjects.subjects.map((s) => (
                              <li key={s.id} className="py-2 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium">{s.name}</span>
                                  <Button size="sm" variant="outline" onClick={() => start({ examId: e.id, subjectId: s.id }, `sub:${s.id}`)} disabled={busy === `sub:${s.id}`}>
                                    Whole subject
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {s.topics.map((t) => (
                                    <button
                                      key={t.id}
                                      type="button"
                                      className="text-xs rounded-full border px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                                      disabled={busy === `top:${t.id}`}
                                      onClick={() => start({ examId: e.id, subjectId: s.id, topicId: t.id }, `top:${t.id}`)}
                                    >
                                      {t.name}
                                    </button>
                                  ))}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ))}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Past practice</h2>
              {attempts.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing finished yet.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {attempts.map((a) => (
                    <li key={a.attempt_id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{[a.exam?.name, a.subject?.name, a.topic?.name].filter(Boolean).join(" › ") || "Mock exam"}</p>
                        <p className="text-xs text-gray-500">{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : ""}</p>
                      </div>
                      <span>
                        {a.status === "pending_review"
                          ? "Waiting to be marked"
                          : a.score != null
                            ? `${a.score}/${a.total_marks}${a.percentage != null ? ` (${a.percentage}%)` : ""}`
                            : a.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}
