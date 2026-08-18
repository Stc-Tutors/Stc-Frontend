"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GetUsersAction } from "@/server/admin";
import { GetTutorTeachingSummaryAction, OffboardTutorAction } from "@/server/allocation-hub";
import { BulkActionResult, TutorTeachingSummary } from "@/types/allocation-hub";
import { User, UserRole } from "@/types/user";

// Bulk reassignment flow for a tutor who's resigning/being removed - "This
// tutor is teaching N active subjects. Who should inherit them?"
export default function OffboardTutorDialog({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [tutors, setTutors] = useState<User[]>([]);
  const [outgoingId, setOutgoingId] = useState("");
  const [incomingId, setIncomingId] = useState("");
  const [summary, setSummary] = useState<TutorTeachingSummary | null>(null);
  const [results, setResults] = useState<BulkActionResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    GetUsersAction({ role: UserRole.TUTOR, limit: 1000 }).then(([res]) => setTutors(res?.data ?? []));
  }, [open]);

  useEffect(() => {
    setSummary(null);
    setResults(null);
    if (!outgoingId) return;
    GetTutorTeachingSummaryAction(outgoingId).then(([res]) => setSummary(res?.data ?? null));
  }, [outgoingId]);

  const reset = () => {
    setOutgoingId("");
    setIncomingId("");
    setSummary(null);
    setResults(null);
  };

  const handleConfirm = async () => {
    if (!outgoingId || !incomingId) return;
    setIsSubmitting(true);
    const [res, error] = await OffboardTutorAction(outgoingId, incomingId);
    setIsSubmitting(false);
    if (error || !res?.data) {
      toast.error(error || "Failed to offboard tutor");
      return;
    }
    setResults(res.data);
    const failed = res.data.filter((r) => !r.success).length;
    if (failed > 0) toast.warning(res.message);
    else toast.success(res.message);
    onDone?.();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Offboard a tutor
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Offboard a tutor</AlertDialogTitle>
          <AlertDialogDescription>Move every one of their active subject enrollments to another tutor.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Departing tutor</label>
            <select
              value={outgoingId}
              onChange={(e) => setOutgoingId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">Select a tutor...</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>

          {summary && (
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              This tutor is teaching <strong>{summary.activeCount}</strong> active subject enrollment{summary.activeCount === 1 ? "" : "s"}
              {summary.courses.length > 0 && (
                <>
                  {" "}
                  across: {summary.courses.map((c) => `${c.course.title} (${c.studentCount})`).join(", ")}
                </>
              )}
              . Who should inherit them?
            </p>
          )}

          {outgoingId && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Incoming tutor</label>
              <select
                value={incomingId}
                onChange={(e) => setIncomingId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Select a tutor...</option>
                {tutors
                  .filter((t) => t.id !== outgoingId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {results && (
            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-md p-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs gap-2">
                  <Badge variant={r.success ? "success" : "destructive"}>{r.success ? "OK" : "Failed"}</Badge>
                  <span className="text-gray-600 flex-1 truncate">{r.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!outgoingId || !incomingId || isSubmitting}
          >
            {isSubmitting ? "Reassigning..." : "Reassign all subjects"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
