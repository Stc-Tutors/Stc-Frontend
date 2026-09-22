"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AcceptAssignmentAction,
  AcceptGroupAssignmentAction,
  GetMyPendingAssignmentsAction,
  RejectAssignmentAction,
  RejectGroupAssignmentAction,
} from "@/server/allocation-hub";
import { TutorPendingAssignment } from "@/types/allocation-hub";

interface OneOnOneEntry {
  kind: "one-on-one";
  row: TutorPendingAssignment;
}

interface GroupEntry {
  kind: "group";
  classGroupId: string;
  rows: TutorPendingAssignment[];
}

type Entry = OneOnOneEntry | GroupEntry;

// "Grade 5 · Age 10" - whichever of the two the student's record has.
function studentSummary(student: TutorPendingAssignment["student"]): string {
  return [student.gradeLabel, student.age !== undefined ? `Age ${student.age}` : undefined].filter(Boolean).join(" · ");
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// The proposed class times this tutor would be committing to - a group's
// confirmed matrix, or a one-on-one's family-requested slots. Renders an
// explicit "not set" line rather than nothing, so an empty schedule is never
// mistaken for a card that failed to load.
function ScheduleBlock({ entry }: { entry: Entry }) {
  const first = entry.kind === "one-on-one" ? entry.row : entry.rows[0];
  const group = first?.proposedSchedule;
  const requested = first?.requestedSchedule;
  const tz = group?.timezone ?? requested?.timezone;
  const start = formatDate(group?.startDate ?? requested?.startDate);

  let lines: string[] = [];
  if (group) {
    lines = [`${group.days.join(", ")} at ${group.time} · ${group.durationMinutes} min · ${group.weeks} week(s)`];
  } else if (requested && requested.slots.length > 0) {
    lines = requested.slots.map((s) => `${s.days.join(", ")} at ${s.time} · ${s.durationMinutes} min`);
  }

  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">
      <p className="text-xs font-medium text-gray-500 mb-1">Proposed class schedule</p>
      {lines.length > 0 ? (
        lines.map((line) => <p key={line}>{line}</p>)
      ) : (
        <p className="text-gray-500">
          {requested?.flexible
            ? "Flexible - the family will agree exact days and times with an admin."
            : "No schedule set yet."}
        </p>
      )}
      {(start || tz) && (
        <p className="text-xs text-gray-500 mt-1">
          {start && <>Starts {start}</>}
          {start && tz && " · "}
          {tz && <>Times in {tz}</>}
        </p>
      )}
    </div>
  );
}

// A student's paid subject, proposed to this tutor by an admin/HOD, waiting
// on exactly one decision: accept or decline. Nothing is scheduled and no
// course is created for this pairing until accepted - see stcbe's
// AllocationHubService.acceptAssignment/rejectAssignment. Rows sharing a
// classGroup (a Group Class - see PENDING_STUDENT_CONFIRMATION, which every
// one of these already passed before reaching this queue) are one shared
// class with one shared schedule, so they're grouped into a single
// accept/decline decision (AllocationHubService.acceptGroupAssignment/
// rejectGroupAssignment) rather than one per student.
export default function PendingAssignmentsPage() {
  const [rows, setRows] = useState<TutorPendingAssignment[]>([]);
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

  const handleAcceptGroup = async (classGroupId: string) => {
    setBusyId(classGroupId);
    const [res, error] = await AcceptGroupAssignmentAction(classGroupId);
    setBusyId(null);
    if (error || !res?.data) {
      toast.error(error || "Failed to accept class");
      return;
    }
    const failed = res.data.filter((r) => !r.success);
    if (failed.length > 0) {
      toast.warning(`${res.data.length - failed.length}/${res.data.length} accepted - ${failed[0].message}`);
    } else {
      toast.success("Class accepted - it's on your schedule now");
    }
    load();
  };

  const handleRejectGroup = async (classGroupId: string) => {
    setBusyId(classGroupId);
    const [, error] = await RejectGroupAssignmentAction(classGroupId, reason.trim() || undefined);
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

  const entries: Entry[] = (() => {
    const groupIds = new Map<string, TutorPendingAssignment[]>();
    const oneOnOne: TutorPendingAssignment[] = [];
    for (const row of rows) {
      if (row.classGroup) {
        (groupIds.get(row.classGroup) ?? groupIds.set(row.classGroup, []).get(row.classGroup)!).push(row);
      } else {
        oneOnOne.push(row);
      }
    }
    return [
      ...oneOnOne.map((row): Entry => ({ kind: "one-on-one", row })),
      ...Array.from(groupIds.entries()).map(([classGroupId, groupRows]): Entry => ({ kind: "group", classGroupId, rows: groupRows })),
    ];
  })();

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
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing waiting on you right now.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const key = entry.kind === "one-on-one" ? entry.row.id : entry.classGroupId;
            const isDeclining = decliningId === key;
            const isBusy = busyId === key;
            const subject = entry.kind === "one-on-one" ? entry.row.subject : entry.rows[0]?.subject;

            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5">{subject}</span>
                    {entry.kind === "group" && <span className="text-xs font-normal text-gray-500">Group class</span>}
                  </CardTitle>
                  {entry.kind === "one-on-one" ? (
                    <div className="mt-1">
                      <p className="text-sm font-medium">{entry.row.student.fullName}</p>
                      {studentSummary(entry.row.student) && (
                        <p className="text-xs text-gray-500">{studentSummary(entry.row.student)}</p>
                      )}
                      {entry.row.student.specialNeeds && (
                        <p className="text-xs text-amber-700 mt-1">Learning needs: {entry.row.student.specialNeeds}</p>
                      )}
                    </div>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {entry.rows.map((r) => (
                        <li key={r.id}>
                          <p className="text-sm font-medium">{r.student.fullName}</p>
                          {studentSummary(r.student) && <p className="text-xs text-gray-500">{studentSummary(r.student)}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScheduleBlock entry={entry} />
                  {isDeclining ? (
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
                          disabled={isBusy}
                          onClick={() => (entry.kind === "one-on-one" ? handleReject(entry.row.id) : handleRejectGroup(entry.classGroupId))}
                        >
                          {isBusy ? "Declining..." : "Confirm decline"}
                        </Button>
                        <Button variant="outline" onClick={() => setDecliningId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        disabled={isBusy}
                        onClick={() => (entry.kind === "one-on-one" ? handleAccept(entry.row.id) : handleAcceptGroup(entry.classGroupId))}
                      >
                        {isBusy ? "Accepting..." : entry.kind === "group" ? "Accept whole class" : "Accept"}
                      </Button>
                      <Button variant="outline" disabled={isBusy} onClick={() => setDecliningId(key)}>
                        {entry.kind === "group" ? "Decline whole class" : "Decline"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
