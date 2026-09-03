"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcceptAssignmentAction, GetMyPendingAssignmentsAction, RejectAssignmentAction } from "@/server/allocation-hub";
import { SubjectEnrollment } from "@/types/allocation-hub";

// A student's paid subject, proposed to this tutor by an admin/HOD, waiting
// on exactly one decision: accept or decline. Nothing is scheduled and no
// course is created for this pairing until accepted - see stcbe's
// AllocationHubService.acceptAssignment/rejectAssignment.
export default function PendingAssignmentsPage() {
  const [rows, setRows] = useState<SubjectEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetMyPendingAssignmentsAction();
    if (error) toast.error(error);
    setRows(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (id: string) => {
    setBusyId(id);
    const [, error] = await AcceptAssignmentAction(id);
    setBusyId(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Assignment accepted - it's on your schedule now");
    load();
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    const [, error] = await RejectAssignmentAction(id, reason.trim() || undefined);
    setBusyId(null);
    setDecliningId(null);
    setReason("");
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Declined - an admin will assign a different tutor");
    load();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Pending Assignments</h1>
        <p className="text-sm text-gray-600 mt-1">
          Students proposed to you for a subject you&apos;re allocated to teach. Accept to add them to your
          schedule, or decline if you can&apos;t take this one - an admin will find someone else.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing waiting on you right now.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {row.subject}
                  {row.student && typeof row.student === "object" && (
                    <span className="font-normal text-gray-500"> — {row.student.fullName}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {decliningId === row.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Optional - let the admin know why (e.g. schedule conflict)"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        disabled={busyId === row.id}
                        onClick={() => handleReject(row.id)}
                      >
                        {busyId === row.id ? "Declining..." : "Confirm decline"}
                      </Button>
                      <Button variant="outline" onClick={() => setDecliningId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button disabled={busyId === row.id} onClick={() => handleAccept(row.id)}>
                      {busyId === row.id ? "Accepting..." : "Accept"}
                    </Button>
                    <Button variant="outline" disabled={busyId === row.id} onClick={() => setDecliningId(row.id)}>
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
