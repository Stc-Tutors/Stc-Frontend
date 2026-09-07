"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GetMySubjectEnrollmentsAction } from "@/server/subject-enrollment";
import { ConfirmGroupScheduleAction, DeclineGroupScheduleAction } from "@/server/allocation-hub";
import { SubjectEnrollment, SubjectEnrollmentStatus } from "@/types/subject-enrollment";

// Group Class only: an admin/HOD has proposed a tutor AND a definitive
// day/time matrix for a shared class - a student can no longer pick their
// own slot for a Group Class (see the registration wizard's classFormat
// gating), so this is the one place that slot actually gets agreed to. Every
// student sharing the class must confirm before the tutor is even notified -
// see stcbe's AllocationHubService.confirmGroupSchedule. Declining reopens
// the WHOLE group's proposal for the admin to re-propose, not just this row.
export default function GroupScheduleConfirmationBanner() {
  const [rows, setRows] = useState<SubjectEnrollment[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    const [res] = await GetMySubjectEnrollmentsAction();
    setRows((res?.data ?? []).filter((r) => r.status === SubjectEnrollmentStatus.PENDING_STUDENT_CONFIRMATION));
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirm = async (id: string) => {
    setBusyId(id);
    const [, error] = await ConfirmGroupScheduleAction(id);
    setBusyId(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Schedule confirmed");
    load();
  };

  const handleDecline = async (id: string) => {
    setBusyId(id);
    const [, error] = await DeclineGroupScheduleAction(id, reason.trim() || undefined);
    setBusyId(null);
    setDecliningId(null);
    setReason("");
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Declined - the admin has been notified and will propose a new schedule");
    load();
  };

  if (rows.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400 space-y-3">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Confirm your class schedule</h3>
        <p className="text-xs text-gray-500">
          A schedule has been proposed for the classes below. Every family in the class needs to confirm before
          the tutor is asked to accept it.
        </p>
      </div>

      {rows.map((row) => {
        const schedule = row.proposedSchedule;
        return (
          <div key={row.id} className="border rounded-lg p-3 space-y-2">
            <p className="font-medium text-gray-800 text-sm">{row.subject}</p>
            {schedule && (
              <p className="text-sm text-gray-600">
                {schedule.days.join(", ")} at {schedule.time} · {schedule.durationMinutes} min · {schedule.weeks} week(s)
              </p>
            )}

            {decliningId === row.id ? (
              <div className="space-y-2">
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional - let the admin know why (e.g. time conflict)"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" disabled={busyId === row.id} onClick={() => handleDecline(row.id)}>
                    {busyId === row.id ? "Declining..." : "Confirm decline"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDecliningId(null)}>
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" disabled={busyId === row.id} onClick={() => handleConfirm(row.id)}>
                  {busyId === row.id ? "Confirming..." : "Confirm schedule"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  disabled={busyId === row.id}
                  onClick={() => setDecliningId(row.id)}
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
