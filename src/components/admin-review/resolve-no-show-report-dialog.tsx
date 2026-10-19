"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/datetime";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResolveTutorNoShowReportAction } from "@/server/admin-review";
import { TutorNoShowReport, TutorNoShowReportStatus } from "@/types/penalty-admin";

interface Props {
  report: TutorNoShowReport | null;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
}

const OUTCOMES: { value: TutorNoShowReportStatus; label: string; description: string }[] = [
  {
    value: TutorNoShowReportStatus.TUTOR_NO_SHOW_CONFIRMED,
    label: "Tutor no-show confirmed",
    description: "The family attended and the tutor didn't. Charges the tutor in full (nothing is credited to the family).",
  },
  {
    value: TutorNoShowReportStatus.MUTUAL_NO_SHOW,
    label: "Mutual no-show",
    description: "Neither side joined. No charge to either party - any existing student no-show charge is reversed.",
  },
  {
    value: TutorNoShowReportStatus.DISMISSED,
    label: "Dismissed - tutor did attend",
    description: "The report doesn't hold up. No financial action taken.",
  },
];

export default function ResolveNoShowReportDialog({ report, onOpenChange, onResolved }: Props) {
  const [outcome, setOutcome] = useState<TutorNoShowReportStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setOutcome(null);
    setNotes("");
  }, [report]);

  if (!report) return null;

  const lessonTitle = typeof report.lesson === "string" ? "this lesson" : report.lesson.title;
  const reporterName =
    typeof report.reportedBy === "string" ? "The family" : `${report.reportedBy.firstName} ${report.reportedBy.lastName}`;

  const handleResolve = async () => {
    if (!outcome) return;
    setIsSubmitting(true);
    const [, error] = await ResolveTutorNoShowReportAction(report.id, outcome, notes.trim() || undefined);
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Report resolved");
    onResolved();
  };

  return (
    <Dialog open={!!report} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve tutor no-show report — {lessonTitle}</DialogTitle>
          <DialogDescription>
            {reporterName} reported this on {formatDateTime(report.createdAt)}
            {report.reason ? `: "${report.reason}"` : "."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOutcome(o.value)}
              className={`w-full text-left border rounded-md px-3 py-2 text-sm ${
                outcome === o.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <p className="font-medium text-gray-900">{o.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{o.description}</p>
            </button>
          ))}
        </div>

        <textarea
          placeholder="Notes (optional) - what you found when reviewing this"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[4rem]"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!outcome || isSubmitting}>
            {isSubmitting ? "Resolving..." : "Confirm resolution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
