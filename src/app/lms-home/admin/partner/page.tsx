"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import InlineLoader from "@/components/shared/InlineLoader";
import {
  GetMyPartnerContractAction,
  GetPartnerEarningsAction,
  GetPartnerKpisAction,
  GetPartnerRevenueAction,
} from "@/server/partner";
import {
  PARTNER_EARNINGS_LABEL,
  PARTNER_STATUS_LABEL,
  PartnerContract,
  PartnerEarningsStatement,
  PartnerKpiReport,
  PartnerRevenueReport,
  formatMoney,
} from "@/types/partner";

const thisMonth = () => new Date().toISOString().slice(0, 7);
const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-");

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function MoneyList({ rows, empty }: { rows: { currency: string; total: number }[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-1">
      {rows.map((r) => (
        <li key={r.currency} className="text-lg font-semibold text-gray-900">
          {formatMoney(r.total, r.currency)}
        </li>
      ))}
    </ul>
  );
}

// A partner's own page: contract and terms, how they are doing against their targets, revenue of their scope and what they earned.
export default function PartnerPage() {
  const [month, setMonth] = useState(thisMonth());
  const [contract, setContract] = useState<PartnerContract | null | undefined>(undefined);
  const [kpis, setKpis] = useState<PartnerKpiReport | null>(null);
  const [revenue, setRevenue] = useState<PartnerRevenueReport | null>(null);
  const [earnings, setEarnings] = useState<PartnerEarningsStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [c, cErr] = await GetMyPartnerContractAction();
    if (cErr) toast.error(cErr);
    setContract(c?.data ?? null);
    if (c?.data && !c.data.locked) {
      const [k, r, e] = await Promise.all([GetPartnerKpisAction(month), GetPartnerRevenueAction(month), GetPartnerEarningsAction(month)]);
      setKpis(k[0]?.data ?? null);
      setRevenue(r[0]?.data ?? null);
      setEarnings(e[0]?.data ?? null);
    } else {
      setKpis(null);
      setRevenue(null);
      setEarnings(null);
    }
    setIsLoading(false);
  }, [month]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  if (isLoading && contract === undefined) return <InlineLoader />;

  if (!contract) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Partner</h1>
        <p className="text-sm text-gray-500">You do not have a partner contract yet. STC sets one up when you join as a Country or Service Partner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{contract.title || "Partner"}</h1>
          <p className="text-sm text-gray-500 mt-1">{PARTNER_STATUS_LABEL[contract.effectiveStatus]}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/lms-home/admin/partner/proposals" className="text-sm text-blue-600 underline">
            My proposals
          </Link>
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Month
            <input type="month" value={month} max={thisMonth()} onChange={(e) => e.target.value && setMonth(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
          </label>
        </div>
      </div>

      {contract.locked && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {contract.effectiveStatus === "TERMINATED"
            ? "This contract has ended and your partner access is switched off."
            : "Your contract has run out, so your partner access is paused until STC renews it."}
          {contract.terminationReason ? ` Reason: ${contract.terminationReason}` : ""}
        </div>
      )}
      {contract.effectiveStatus === "PROBATION_REVIEW" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your probation period is over. STC will decide whether to confirm you as an Operating Partner - you keep your access meanwhile.
        </div>
      )}

      <section className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Started</p>
          <p className="font-medium text-gray-900">{day(contract.startDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Probation ends</p>
          <p className="font-medium text-gray-900">{day(contract.probationEndsAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Contract ends / next review</p>
          <p className="font-medium text-gray-900">{day(contract.termEndsAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">You earn</p>
          <p className="font-medium text-gray-900">
            {PARTNER_EARNINGS_LABEL[contract.earnings.model]}
            {contract.earnings.percent !== undefined ? ` (${contract.earnings.percent}%)` : ""}
          </p>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        !contract.locked && (
          <>
            {kpis && (
              <section className="space-y-3">
                <h2 className="font-semibold text-gray-900">Performance - {kpis.period.label}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Active learners" value={kpis.activeLearners} />
                  <Stat label="Tutors" value={kpis.tutors} />
                  <Stat label="New enrolments" value={kpis.newEnrollments} />
                  <Stat label="Classes held" value={`${kpis.classesHeld} / ${kpis.classesDue}`} hint="held / due this month" />
                </div>
                {kpis.unassignedWaiting !== null && (
                  <p className="text-sm text-gray-600">
                    {kpis.unassignedWaiting} learner(s) waiting for a tutor
                    {kpis.oldestWaitDays !== null && kpis.unassignedWaiting > 0 ? ` - the longest for ${kpis.oldestWaitDays} day(s)` : ""}.
                  </p>
                )}
                <div className="bg-white rounded-xl shadow-sm divide-y">
                  {kpis.lines.map((line) => (
                    <div key={line.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <span className="text-gray-700">{line.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-gray-900 font-medium">{line.actual === null ? "no data yet" : `${line.actual} ${line.unit}`}</span>
                        <span className="text-gray-500">{line.target === null ? "no target" : `target ${line.target}`}</span>
                        {line.met !== null && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${line.met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {line.met ? "Met" : "Not met"}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {revenue && (
              <section className="space-y-3">
                <h2 className="font-semibold text-gray-900">Revenue of your scope - {revenue.period.label}</h2>
                <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                  <MoneyList rows={revenue.total} empty="No completed payments in your scope this month." />
                  {revenue.byScope.length > 1 && (
                    <div className="border-t pt-3 space-y-2">
                      {revenue.byScope.map((s) => (
                        <div key={s.scopeLabel} className="flex flex-wrap justify-between gap-2 text-sm">
                          <span className="text-gray-600">{s.scopeLabel}</span>
                          <span className="text-gray-900">{s.rows.length ? s.rows.map((r) => formatMoney(r.total, r.currency)).join(" + ") : "-"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">Totals only - no learner or payment details. Currencies are never added together.</p>
                </div>
              </section>
            )}

            {earnings && (
              <section className="space-y-3">
                <h2 className="font-semibold text-gray-900">Your earnings - {earnings.period.label}</h2>
                <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                  {earnings.lines.length === 0 ? (
                    <p className="text-sm text-gray-500">Nothing earned this month yet.</p>
                  ) : (
                    <div className="divide-y">
                      {earnings.lines.map((l, i) => (
                        <div key={i} className="flex justify-between gap-3 py-2 text-sm">
                          <span className="text-gray-700">{l.label}</span>
                          <span className="font-medium text-gray-900">{formatMoney(l.amount, l.currency)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {earnings.totals.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <MoneyList rows={earnings.totals} empty="" />
                    </div>
                  )}
                  {earnings.bonusEarned === false && <p className="text-xs text-amber-700">The target bonus was not earned this month (new-enrolment target not met).</p>}
                  <p className="text-xs text-gray-400">{earnings.note}</p>
                </div>
              </section>
            )}
          </>
        )
      )}
    </div>
  );
}
