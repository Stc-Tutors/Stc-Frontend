"use client";

import { useCallback, useEffect, useState } from "react";

import ActionRequiredWidget from "@/components/allocations/action-required-widget";
import TeachingRosterTab from "@/components/allocations/teaching-roster-tab";
import UnassignedQueueTab from "@/components/allocations/unassigned-queue-tab";
import ActiveRosterTab from "@/components/allocations/active-roster-tab";
import OversightRosterTab from "@/components/allocations/oversight-roster-tab";
import OffboardTutorDialog from "@/components/allocations/offboard-tutor-dialog";
import { GetAllocationSummaryAction } from "@/server/allocation-hub";
import { AllocationHubSummary } from "@/types/allocation-hub";
import { useUser } from "@/contexts/user-context";
import { isSuperOrAlmighty } from "@/lib/roles";

type Tab = "teaching" | "oversight";

const ROSTER_LABELS: Record<Tab, string> = {
  teaching: "Teaching Roster",
  oversight: "Oversight Roster",
};

type TeachingView = "by-tutor" | "by-enrollment" | "active-roster";

// Allocation Hub, brought into this app so a tenant's own Super Admin never
// needs Stc-SuperAdmin to do their day-to-day allocation work - connect paid
// subject enrollments (the anchor unit) to Tutors (Teaching Roster) and to
// STC_Admin/TUTOR_ADMIN oversight (Oversight Roster), plus bulk tutor
// offboarding. Which subjects/services a tutor is allocated to teach in the
// first place is still set from Stc-SuperAdmin for now - only the day-to-day
// roster/reassignment workflow is ported here.
export default function AllocationsPage() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [tab, setTab] = useState<Tab>("teaching");
  const [teachingView, setTeachingView] = useState<TeachingView>("by-tutor");
  const [summary, setSummary] = useState<AllocationHubSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [jumpToken, setJumpToken] = useState(0);

  const loadSummary = useCallback(async () => {
    const [res] = await GetAllocationSummaryAction();
    setSummary(res?.data ?? null);
    setIsLoadingSummary(false);
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const jumpTo = (target: Tab) => {
    setTab(target);
    setJumpToken((t) => t + 1);
  };

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!user || !isSuperOrAlmighty(user.role)) {
    return (
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">Allocation Hub</h1>
        <p className="text-sm text-gray-500">Only a Super Admin can connect enrollments to tutors and admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Allocation Hub</h1>
          <p className="text-gray-500 text-sm mt-1">
            Connect paid subject enrollments to tutors and to the admins who oversee them - every allocation is scoped
            to one student&apos;s one subject, never a whole account.
          </p>
        </div>
        <OffboardTutorDialog onDone={loadSummary} />
      </div>

      <ActionRequiredWidget
        summary={summary}
        isLoading={isLoadingSummary}
        onGoToTeachingRoster={() => jumpTo("teaching")}
        onGoToOversightRoster={() => jumpTo("oversight")}
      />

      <div className="space-y-4">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="max-w-xs border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        >
          {(Object.keys(ROSTER_LABELS) as Tab[]).map((t) => (
            <option key={t} value={t}>
              {ROSTER_LABELS[t]}
            </option>
          ))}
        </select>
        {tab === "teaching" && (
          <div className="space-y-4">
            <div className="inline-flex rounded-md border border-gray-200 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setTeachingView("by-tutor")}
                className={`px-3 py-1 rounded ${
                  teachingView === "by-tutor" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                By tutor
              </button>
              <button
                type="button"
                onClick={() => setTeachingView("by-enrollment")}
                className={`px-3 py-1 rounded ${
                  teachingView === "by-enrollment" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                By enrollment
              </button>
              <button
                type="button"
                onClick={() => setTeachingView("active-roster")}
                className={`px-3 py-1 rounded ${
                  teachingView === "active-roster" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Active roster
              </button>
            </div>
            {teachingView === "by-tutor" && <TeachingRosterTab jumpToken={jumpToken} />}
            {teachingView === "by-enrollment" && <UnassignedQueueTab jumpToken={jumpToken} />}
            {teachingView === "active-roster" && <ActiveRosterTab jumpToken={jumpToken} />}
          </div>
        )}
        {tab === "oversight" && <OversightRosterTab jumpToken={jumpToken} />}
      </div>
    </div>
  );
}
