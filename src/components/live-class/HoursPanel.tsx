"use client";

import { Clock, Hourglass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { formatDate } from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import { formatMinutes, percent } from "@/lib/live-class-format";
import { GetMyHoursAction } from "@/server/hours";
import type { HoursAccountSummary, HoursLessonLine } from "@/types/live-class";

const STATE_LABEL: Record<HoursLessonLine["state"], { label: string; variant: "success" | "secondary" | "destructive" }> = {
  COUNTED: { label: "Counted", variant: "success" },
  PENDING_REVIEW: { label: "Awaiting review", variant: "secondary" },
  FLAGGED: { label: "Under review", variant: "destructive" },
};

function AccountCard({ account }: { account: HoursAccountSummary }) {
  const { purchasedMinutes, usedMinutes, pendingMinutes, remainingMinutes, upcomingScheduledMinutes } = account;
  const usedPct = percent(usedMinutes, purchasedMinutes);
  const pendingPct = Math.min(100 - usedPct, percent(pendingMinutes, purchasedMinutes));
  const hasMoney = account.effectiveRatePerHour != null && account.currency;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-baseline justify-between gap-2 text-base">
          <span>
            {account.subject || account.courseTitle}
            <span className="ml-2 text-sm font-normal text-gray-500">{account.studentName}</span>
          </span>
          <span className="text-sm font-normal text-gray-500">{account.courseTitle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
            role="img"
            aria-label={`${formatMinutes(usedMinutes)} used of ${formatMinutes(purchasedMinutes)}`}
          >
            <div className="bg-blue-500" style={{ width: `${usedPct}%` }} />
            <div className="bg-blue-200" style={{ width: `${pendingPct}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Used {formatMinutes(usedMinutes)}
            </span>
            {pendingMinutes > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-200" /> Awaiting review {formatMinutes(pendingMinutes)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-200" /> Remaining {formatMinutes(remainingMinutes)}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-500">Bought</dt>
            <dd className="font-semibold">{formatMinutes(purchasedMinutes)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Used</dt>
            <dd className="font-semibold">{formatMinutes(usedMinutes)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Remaining</dt>
            <dd className="font-semibold">{formatMinutes(remainingMinutes)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Already scheduled</dt>
            <dd className="font-semibold">{formatMinutes(upcomingScheduledMinutes)}</dd>
          </div>
        </dl>

        {hasMoney && (
          <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
            At {formatMoney(account.effectiveRatePerHour, account.currency)} per hour, you have used{" "}
            <strong>{formatMoney(account.valueUsed, account.currency)}</strong> of your prepaid classes and{" "}
            <strong>{formatMoney(account.valueRemaining, account.currency)}</strong> is still available.
          </p>
        )}

        {account.lessons.length > 0 && (
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent classes</h4>
            <ul className="divide-y rounded-md border text-sm">
              {account.lessons.slice(0, 8).map((line) => (
                <li key={line.lessonId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <div>
                    <p className="font-medium">{line.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(line.scheduledDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {formatMinutes(line.billableMinutes)}
                      {line.billableMinutes < line.scheduledMinutes && (
                        <span className="text-gray-400"> of {formatMinutes(line.scheduledMinutes)}</span>
                      )}
                    </span>
                    <Badge variant={STATE_LABEL[line.state].variant}>{STATE_LABEL[line.state].label}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HoursPanel() {
  const { data, error, isLoading } = useCachedQuery<HoursAccountSummary[]>(
    "my-hours",
    async () => (await unwrap(GetMyHoursAction())) ?? [],
    { ttl: 30_000, tags: ["hours", "lessons"] }
  );

  if (isLoading) return <p className="text-sm text-gray-500">Loading your hours...</p>;
  if (error && !data) return <p className="text-sm text-red-600">Couldn&apos;t load your hours: {error.message}</p>;
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center text-gray-500">
        <Hourglass className="h-7 w-7" />
        <p className="text-sm">No classes are set up yet. Your hours will appear here once a tutor is assigned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 text-sm text-gray-600">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Only the time a class actually ran counts, and never more than the scheduled length. Classes that are
          cancelled or missed by the tutor don&apos;t use any of your hours, so they stay available to you.
        </span>
      </p>
      {data.map((account) => (
        <AccountCard key={account.accountId} account={account} />
      ))}
    </div>
  );
}
