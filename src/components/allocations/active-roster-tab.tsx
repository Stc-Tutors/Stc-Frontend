"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import ReassignTutorDialog from "./reassign-tutor-dialog";
import { ListAllocationEnrollmentsAction } from "@/server/allocation-hub";
import { GetUsersAction } from "@/server/admin";
import { SUBJECT_ENROLLMENT_STATUS_LABELS, SubjectEnrollment, SubjectEnrollmentStatus } from "@/types/allocation-hub";
import { User, UserRole } from "@/types/user";

function tutorLabel(subjectEnrollment: SubjectEnrollment, tutorsById: Map<string, User>) {
  const courseEnrollment = typeof subjectEnrollment.courseEnrollment === "object" ? subjectEnrollment.courseEnrollment : undefined;
  const course = courseEnrollment && typeof courseEnrollment.course === "object" ? courseEnrollment.course : undefined;
  // PENDING_TUTOR_ACCEPTANCE has no courseEnrollment yet - the proposed
  // tutor lives on pendingTutor instead until they accept.
  const tutorId = course
    ? typeof course.tutor === "string"
      ? course.tutor
      : course.tutor?.id
    : subjectEnrollment.pendingTutor;
  const tutor = tutorId ? tutorsById.get(tutorId) : undefined;
  return tutor ? `${tutor.firstName} ${tutor.lastName}` : "Unknown tutor";
}

// Every subject enrollment that already has a tutor in the picture -
// proposed but not yet accepted (PENDING_TUTOR_ACCEPTANCE), or confirmed
// (PENDING_CONFIRMATION/ACTIVE) - across the whole roster. The "move this
// student to a different tutor" view assignTutor/Teaching Roster can't
// cover, since that flow only ever handles a fresh UNASSIGNED_TUTOR row.
export default function ActiveRosterTab({ jumpToken = 0 }: { jumpToken?: number }) {
  const [rows, setRows] = useState<SubjectEnrollment[]>([]);
  const [tutorsById, setTutorsById] = useState<Map<string, User>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [reassignTarget, setReassignTarget] = useState<SubjectEnrollment | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [[enrollmentsRes, error], [tutorsRes]] = await Promise.all([
      ListAllocationEnrollmentsAction({
        statuses: [
          SubjectEnrollmentStatus.PENDING_TUTOR_ACCEPTANCE,
          SubjectEnrollmentStatus.PENDING_CONFIRMATION,
          SubjectEnrollmentStatus.ACTIVE,
        ],
      }),
      GetUsersAction({ role: UserRole.TUTOR, limit: 1000 }),
    ]);
    if (error) toast.error(error);
    setRows(enrollmentsRes?.data ?? []);
    setTutorsById(new Map((tutorsRes?.data ?? []).map((t) => [t.id, t])));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (jumpToken > 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken]);

  const columns: DataTableColumn<SubjectEnrollment>[] = [
    { header: "Student", cell: (row) => <span className="font-medium text-gray-900">{row.student.fullName}</span> },
    { header: "Subject/Course", cell: (row) => row.subject },
    { header: "Current tutor", cell: (row) => <span className="text-gray-500">{tutorLabel(row, tutorsById)}</span> },
    { header: "Status", cell: (row) => <Badge variant="outline">{SUBJECT_ENROLLMENT_STATUS_LABELS[row.status]}</Badge> },
    {
      header: "",
      className: "text-right",
      cell: (row) =>
        // Reassigning only makes sense once a tutor has actually accepted -
        // a still-PENDING_TUTOR_ACCEPTANCE row has no CourseEnrollment yet
        // for reassignTutor to move (it'd just reject with an error).
        row.status === SubjectEnrollmentStatus.PENDING_TUTOR_ACCEPTANCE ? null : (
          <Button variant="outline" size="sm" onClick={() => setReassignTarget(row)}>
            Reassign
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">
        Every subject enrollment that already has a tutor. Reassigning moves the student to a different tutor
        allocated for this exact subject - blocked only by a real schedule clash.
      </p>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No active or pending-confirmation enrollments yet."
      />

      <ReassignTutorDialog
        enrollment={reassignTarget}
        onOpenChange={(open) => !open && setReassignTarget(null)}
        onReassigned={() => {
          setReassignTarget(null);
          load();
        }}
      />
    </div>
  );
}
