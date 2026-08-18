"use client";

import { AlertTriangle, UserX, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AllocationHubSummary } from "@/types/allocation-hub";

interface ActionRequiredWidgetProps {
  summary: AllocationHubSummary | null;
  isLoading: boolean;
  onGoToTeachingRoster: () => void;
  onGoToOversightRoster: () => void;
}

// Orphan dashboard at the top of the Hub - flags subject enrollments that
// are paid for but missing a tutor, or missing an oversight admin, and jumps
// straight to the relevant tab/pane on click.
export default function ActionRequiredWidget({
  summary,
  isLoading,
  onGoToTeachingRoster,
  onGoToOversightRoster,
}: ActionRequiredWidgetProps) {
  const unassignedTutor = summary?.unassignedTutorCount ?? 0;
  const unassignedOversight = summary?.unassignedOversightCount ?? 0;
  const hasIssues = unassignedTutor > 0 || unassignedOversight > 0;

  return (
    <Card className={hasIssues ? "border-amber-300 bg-amber-50/40" : ""}>
      <CardContent className="flex items-start gap-3">
        <AlertTriangle className={`size-5 mt-0.5 shrink-0 ${hasIssues ? "text-amber-600" : "text-gray-300"}`} />
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Action required</h3>
          {isLoading && <p className="text-sm text-gray-500">Checking allocation status...</p>}
          {!isLoading && !hasIssues && <p className="text-sm text-gray-500">Everything paid-for is assigned a tutor and an overseeing admin.</p>}
          {!isLoading && hasIssues && (
            <div className="flex flex-col sm:flex-row gap-2">
              {unassignedTutor > 0 && (
                <button
                  type="button"
                  onClick={onGoToTeachingRoster}
                  className="flex items-center gap-2 text-sm bg-white border border-amber-200 rounded-md px-3 py-2 hover:bg-amber-100/60 text-left"
                >
                  <UserX className="size-4 text-amber-600 shrink-0" />
                  <span>
                    You have <strong>{unassignedTutor}</strong> active subject enrollment{unassignedTutor === 1 ? "" : "s"} with no tutor.
                  </span>
                </button>
              )}
              {unassignedOversight > 0 && (
                <button
                  type="button"
                  onClick={onGoToOversightRoster}
                  className="flex items-center gap-2 text-sm bg-white border border-amber-200 rounded-md px-3 py-2 hover:bg-amber-100/60 text-left"
                >
                  <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                  <span>
                    You have <strong>{unassignedOversight}</strong> active subject enrollment{unassignedOversight === 1 ? "" : "s"} not assigned to any admin.
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
