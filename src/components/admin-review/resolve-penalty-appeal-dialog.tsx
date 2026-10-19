"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/datetime";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResolvePenaltyAppealAction } from "@/server/admin-review";
import { StudentPenaltyAppealStatus, StudentPenaltyCharge, StudentPenaltyType } from "@/types/penalty-admin";

interface Props {
  charge: StudentPenaltyCharge | null;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
}

const TYPE_LABELS: Record<StudentPenaltyType, string> = {
  [StudentPenaltyType.NO_SHOW]: "No-show",
  [StudentPenaltyType.LATE_CANCEL]: "Late cancellation",
  [StudentPenaltyType.LATE_RESCHEDULE]: "Late reschedule",
};

const DECISIONS: { value: StudentPenaltyAppealStatus; label: string; description: string }[] = [
  {
    value: StudentPenaltyAppealStatus.GRANTED,
    label: "Grant the appeal",
    description: "The charge shouldn't have applied - refunds the forfeited amount to the family's wallet on top of what they already got back.",
  },
  {
    value: StudentPenaltyAppealStatus.UPHELD,
    label: "Uphold the charge",
    description: "The original charge stands as-is. Nothing changes financially.",
  },
];

export default function ResolvePenaltyAppealDialog({ charge, onOpenChange, onResolved }: Props) {
  const [decision, setDecision] = useState<StudentPenaltyAppealStatus | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDecision(null);
    setNote("");
  }, [charge]);

  if (!charge) return null;

  const courseTitle = typeof charge.course === "string" ? charge.course : charge.course.title;
  const studentName = typeof charge.student === "string" ? charge.student : (charge.student?.fullName ?? "Removed student");

  const handleResolve = async () => {
    if (!decision) return;
    setIsSubmitting(true);
    const [, error] = await ResolvePenaltyAppealAction(charge.id, decision, note.trim() || undefined);
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Appeal resolved");
    onResolved();
  };

  return (
    <Dialog open={!!charge} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Resolve appeal — {TYPE_LABELS[charge.type]} · {courseTitle}
          </DialogTitle>
          <DialogDescription>
            {studentName} · {charge.currency} {charge.forfeitedAmount.toLocaleString()} forfeited on{" "}
            {formatDateTime(charge.createdAt)}
            {charge.appealReason ? `. Appeal: "${charge.appealReason}"` : "."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {DECISIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDecision(d.value)}
              className={`w-full text-left border rounded-md px-3 py-2 text-sm ${
                decision === d.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <p className="font-medium text-gray-900">{d.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
            </button>
          ))}
        </div>

        <textarea
          placeholder="Note (optional) - what you found when reviewing this"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[4rem]"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!decision || isSubmitting}>
            {isSubmitting ? "Resolving..." : "Confirm resolution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
