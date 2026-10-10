"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastSuccess } from "@/components/ui/custom/toast";
import { formatScheduleDateTime } from "@/lib/datetime";
import { GetReportsDueAction, type ReportDueLesson } from "@/server/lesson";
import ClockOutDialog from "@/components/tutorDashboard/ClockOutDialog";

// Classes this tutor has taught whose post-lesson report is still missing. Filing it is what lets the session be approved and paid.
export default function ReportsDuePage() {
  const [items, setItems] = useState<ReportDueLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filing, setFiling] = useState<ReportDueLesson | null>(null);

  const load = useCallback(async () => {
    const [res, err] = await GetReportsDueAction();
    setError(err);
    setItems(res?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reports due</h1>
        <p className="text-sm text-gray-600">
          File a short report after every class. Parents and students read it, and a session is not approved or paid until its report is in.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="py-6 text-sm text-gray-700">{error}</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border bg-green-50 p-4 text-sm text-green-800">You&apos;re all caught up - no reports are waiting.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((lesson) => (
            <li key={lesson.id} className="flex flex-col gap-2 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900">{lesson.course?.title ?? lesson.title}</p>
                <p className="text-sm text-gray-600">{formatScheduleDateTime(lesson.scheduledDate)}</p>
              </div>
              <Button size="sm" onClick={() => setFiling(lesson)}>
                File report
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ClockOutDialog
        lessonId={filing?.id ?? null}
        lateReport={filing?.status === "COMPLETED"}
        title={filing ? (filing.course?.title ?? filing.title) : undefined}
        onClose={() => setFiling(null)}
        onClockedOut={() => {
          setFiling(null);
          ToastSuccess("Report filed - thank you");
          load();
        }}
      />
    </div>
  );
}
