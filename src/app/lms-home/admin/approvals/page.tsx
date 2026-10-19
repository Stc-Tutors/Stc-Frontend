"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Flag, XCircle } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";
import { formatDateTime, formatScheduleDateTime } from "@/lib/datetime";
import {
  ApproveSessionAction,
  FlagSessionAction,
  GetPendingTutorChangeRequestsAction,
  GetPenaltyAppealsAction,
  GetSessionsForReviewAction,
  GetTutorNoShowReportsAction,
  RejectTutorChangeRequestAction,
} from "@/server/admin-review";
import type { SessionForReview } from "@/types/session-review";
import type { TutorChangeRequest } from "@/types/tutor-change-request";
import {
  StudentPenaltyType,
  TutorNoShowReportStatus,
  type StudentPenaltyCharge,
  type TutorNoShowReport,
} from "@/types/penalty-admin";
import ApproveTutorChangeDialog from "@/components/admin-review/approve-tutor-change-dialog";
import ResolveNoShowReportDialog from "@/components/admin-review/resolve-no-show-report-dialog";
import ResolvePenaltyAppealDialog from "@/components/admin-review/resolve-penalty-appeal-dialog";

// The review queues that used to exist only in the Super Admin app. Each tab appears only for an admin holding the permission the
// backend requires for it (a Super Admin sees them all), so nobody is shown a queue they would only get 403s from.
type TabKey = "changes" | "noshows" | "appeals" | "sessions";

const TABS: { key: TabKey; label: string; permission: AdminPermission }[] = [
  { key: "changes", label: "Tutor Changes", permission: AdminPermission.APPROVE_TUTOR_CHANGE_REQUESTS },
  { key: "noshows", label: "No-Show Reports", permission: AdminPermission.RESOLVE_TUTOR_NO_SHOW_REPORTS },
  { key: "appeals", label: "Penalty Appeals", permission: AdminPermission.RESOLVE_PENALTY_APPEALS },
  { key: "sessions", label: "Session Review", permission: AdminPermission.APPROVE_RESOURCES },
];

const NO_SHOW_LABELS: Record<TutorNoShowReportStatus, string> = {
  [TutorNoShowReportStatus.PENDING]: "Pending",
  [TutorNoShowReportStatus.TUTOR_NO_SHOW_CONFIRMED]: "Tutor no-show confirmed",
  [TutorNoShowReportStatus.MUTUAL_NO_SHOW]: "Mutual no-show",
  [TutorNoShowReportStatus.DISMISSED]: "Dismissed - tutor attended",
};

const PENALTY_LABELS: Record<StudentPenaltyType, string> = {
  [StudentPenaltyType.NO_SHOW]: "No-show",
  [StudentPenaltyType.LATE_CANCEL]: "Late cancellation",
  [StudentPenaltyType.LATE_RESCHEDULE]: "Late reschedule",
};

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900">{children}</div>;
}

function Empty({ label }: { label: string }) {
  return <p className="p-6 text-sm text-gray-500">Nothing pending in {label}.</p>;
}

export default function AdminApprovalsPage() {
  const { hasPermission, isLoading } = useUser();
  const visibleTabs = useMemo(() => TABS.filter((t) => hasPermission(t.permission)), [hasPermission]);
  const [tab, setTab] = useState<TabKey | null>(null);
  const active = tab && visibleTabs.some((t) => t.key === tab) ? tab : visibleTabs[0]?.key;

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (visibleTabs.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You do not hold a permission for any approval queue. Ask a Super Admin for access to what you need.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">Decisions waiting on an admin: only the queues your permissions cover are shown.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              active === t.key ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "changes" && <TutorChangesTab />}
      {active === "noshows" && <NoShowTab />}
      {active === "appeals" && <AppealsTab />}
      {active === "sessions" && <SessionsTab />}
    </div>
  );
}

function TutorChangesTab() {
  const [items, setItems] = useState<TutorChangeRequest[]>([]);
  const [rejectDraft, setRejectDraft] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<TutorChangeRequest | null>(null);

  const load = useCallback(async () => {
    const [res] = await GetPendingTutorChangeRequestsAction();
    setItems(res?.data ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const reject = async (id: string) => {
    const reason = rejectDraft[id]?.trim();
    if (!reason) return toast.error("Enter a reason for rejecting");
    const [, error] = await RejectTutorChangeRequestAction(id, reason);
    if (error) return toast.error(error);
    setRejectDraft((p) => ({ ...p, [id]: "" }));
    load();
  };

  return (
    <Panel>
      {items.length === 0 ? (
        <Empty label="tutor change requests" />
      ) : (
        items.map((r) => (
          <div key={r.id} className="space-y-3 border-b p-4 text-sm last:border-0">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {r.student?.fullName ?? "Removed student"} · {r.subject}
              </p>
              <p className="text-xs text-gray-500">
                Requested by {r.requestedBy.firstName} {r.requestedBy.lastName}
                {r.currentTutor && ` · current tutor ${r.currentTutor.firstName} ${r.currentTutor.lastName}`} · {formatDateTime(r.createdAt)}
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">Reason: {r.reason}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setApproving(r)} className="flex items-center gap-1 text-green-700 hover:underline">
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <input
                placeholder="Reason for rejecting"
                value={rejectDraft[r.id] ?? ""}
                onChange={(e) => setRejectDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                className="max-w-xs flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
              />
              <button onClick={() => reject(r.id)} className="flex items-center gap-1 text-red-700 hover:underline">
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        ))
      )}
      <ApproveTutorChangeDialog
        request={approving}
        onOpenChange={(open) => !open && setApproving(null)}
        onApproved={() => {
          setApproving(null);
          load();
        }}
      />
    </Panel>
  );
}

function NoShowTab() {
  const [items, setItems] = useState<TutorNoShowReport[]>([]);
  const [status, setStatus] = useState<string>(TutorNoShowReportStatus.PENDING);
  const [resolving, setResolving] = useState<TutorNoShowReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res] = await GetTutorNoShowReportsAction((status || undefined) as TutorNoShowReportStatus | undefined);
    setItems(res?.data ?? []);
    setIsLoading(false);
  }, [status]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-3">
      <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        {Object.values(TutorNoShowReportStatus).map((s) => (
          <option key={s} value={s}>
            {NO_SHOW_LABELS[s]}
          </option>
        ))}
      </select>
      <Panel>
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <Empty label="tutor no-show reports" />
        ) : (
          items.map((r) => {
            const lessonTitle = typeof r.lesson === "string" ? r.lesson : r.lesson.title;
            const courseTitle = typeof r.course === "string" ? r.course : r.course.title;
            const reporter = typeof r.reportedBy === "string" ? r.reportedBy : `${r.reportedBy.firstName} ${r.reportedBy.lastName}`;
            return (
              <div key={r.id} className="space-y-2 border-b p-4 text-sm last:border-0">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {courseTitle} · {lessonTitle}
                </p>
                <p className="text-xs text-gray-500">
                  Reported by {reporter} · {formatDateTime(r.createdAt)}
                </p>
                {r.reason && <p className="text-gray-700 dark:text-gray-300">Reason: {r.reason}</p>}
                {r.status !== TutorNoShowReportStatus.PENDING ? (
                  <p className="text-xs text-gray-500">
                    Resolved: {NO_SHOW_LABELS[r.status]}
                    {r.resolutionNotes ? ` - ${r.resolutionNotes}` : ""}
                  </p>
                ) : (
                  <button onClick={() => setResolving(r)} className="text-blue-700 hover:underline">
                    Review &amp; resolve
                  </button>
                )}
              </div>
            );
          })
        )}
      </Panel>
      <ResolveNoShowReportDialog
        report={resolving}
        onOpenChange={(open) => !open && setResolving(null)}
        onResolved={() => {
          setResolving(null);
          load();
        }}
      />
    </div>
  );
}

function AppealsTab() {
  const [items, setItems] = useState<StudentPenaltyCharge[]>([]);
  const [resolving, setResolving] = useState<StudentPenaltyCharge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res] = await GetPenaltyAppealsAction();
    setItems(res?.data ?? []);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-3">
      <Panel>
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <Empty label="pending penalty appeals" />
        ) : (
          items.map((c) => {
            const courseTitle = typeof c.course === "string" ? c.course : c.course.title;
            const studentName = typeof c.student === "string" ? c.student : (c.student?.fullName ?? "Removed student");
            return (
              <div key={c.id} className="space-y-2 border-b p-4 text-sm last:border-0">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {PENALTY_LABELS[c.type]} · {courseTitle}
                </p>
                <p className="text-xs text-gray-500">
                  {studentName} · {c.currency} {c.forfeitedAmount.toLocaleString()} forfeited · appealed {formatDateTime(c.appealedAt ?? c.createdAt)}
                </p>
                {c.appealReason && <p className="text-gray-700 dark:text-gray-300">Appeal: {c.appealReason}</p>}
                <button onClick={() => setResolving(c)} className="text-blue-700 hover:underline">
                  Review &amp; resolve
                </button>
              </div>
            );
          })
        )}
      </Panel>
      <ResolvePenaltyAppealDialog
        charge={resolving}
        onOpenChange={(open) => !open && setResolving(null)}
        onResolved={() => {
          setResolving(null);
          load();
        }}
      />
    </div>
  );
}

const BUCKETS = [
  { value: "ongoing", label: "Pending review" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
] as const;

function SessionsTab() {
  const [bucket, setBucket] = useState<"upcoming" | "ongoing" | "completed">("ongoing");
  const [items, setItems] = useState<SessionForReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetSessionsForReviewAction(bucket);
    if (error) toast.error(error);
    setItems(res?.data ?? []);
    setIsLoading(false);
  }, [bucket]);
  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    const [, error] = await ApproveSessionAction(id);
    toast[error ? "error" : "success"](error || "Session approved");
    load();
  };
  const flag = async (id: string) => {
    const reason = window.prompt("Reason for flagging this session:");
    if (!reason) return;
    const [, error] = await FlagSessionAction(id, reason);
    toast[error ? "error" : "success"](error || "Session flagged");
    load();
  };

  const studentName = (r: SessionForReview) => {
    const ce = r.courseEnrollment;
    if (!ce || typeof ce === "string") return "Group class";
    const s = (ce as { student?: unknown }).student;
    return !s || typeof s === "string" ? "Group class" : ((s as { fullName?: string }).fullName ?? "Student");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {BUCKETS.map((b) => (
          <button
            key={b.value}
            type="button"
            onClick={() => setBucket(b.value)}
            className={`rounded-md border px-3 py-1.5 text-sm ${bucket === b.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"}`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Approving counts the class towards the tutor&apos;s pay and the family&apos;s used hours. Flagging holds it back. Billable time is never more than the scheduled length.
      </p>
      <Panel>
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <Empty label="this view" />
        ) : (
          items.map((r) => {
            const report = r.sessionReport ? Object.entries(r.sessionReport).filter(([, v]) => v) : [];
            const v = r.verification as { billableMinutes?: number; trust?: string; flags?: string[] } | undefined;
            return (
              <div key={r.id} className="space-y-2 border-b p-4 text-sm last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{r.course?.title ?? r.title}</p>
                    <p className="text-xs text-gray-500">
                      {studentName(r)} · tutor {r.course?.tutor ? `${r.course.tutor.firstName} ${r.course.tutor.lastName}` : "-"} · {formatScheduleDateTime(r.scheduledDate)} ·{" "}
                      {r.durationMinutes} min
                    </p>
                    {v && (
                      <p className="mt-1 text-xs text-gray-600">
                        Counts for {v.billableMinutes ?? 0} min · trust {v.trust ?? "-"}
                        {v.flags && v.flags.length > 0 ? ` · flags: ${v.flags.join(", ")}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{r.reviewStatus ?? "-"}</span>
                    {bucket === "ongoing" && (
                      <>
                        <button onClick={() => approve(r.id)} className="flex items-center gap-1 text-green-700 hover:underline">
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                        <button onClick={() => flag(r.id)} className="flex items-center gap-1 text-red-700 hover:underline">
                          <Flag className="h-4 w-4" /> Flag
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {report.length > 0 ? (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer text-blue-700">View tutor report</summary>
                    <dl className="mt-1 grid gap-x-3 sm:grid-cols-[max-content_1fr]">
                      {report.map(([k, val]) => (
                        <div key={k} className="contents">
                          <dt className="font-medium">{k.replace(/([A-Z])/g, " $1").toLowerCase()}</dt>
                          <dd>{val}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                ) : (
                  <p className="text-xs text-gray-400">No report filed.</p>
                )}
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}
