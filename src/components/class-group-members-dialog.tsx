"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/datetime";
import { ListAllocationEnrollmentsAction } from "@/server/allocation-hub";
import { GetUsersAction } from "@/server/admin";
import { SUBJECT_ENROLLMENT_STATUS_LABELS, SubjectEnrollment } from "@/types/allocation-hub";
import { IClassGroup } from "@/types/service-catalog";
import { User, UserRole } from "@/types/user";

function tutorLabel(row: SubjectEnrollment, tutorsById: Map<string, User>): string {
  const courseEnrollment = typeof row.courseEnrollment === "object" ? row.courseEnrollment : undefined;
  const course = courseEnrollment && typeof courseEnrollment.course === "object" ? courseEnrollment.course : undefined;
  const tutorId = course ? (typeof course.tutor === "string" ? course.tutor : course.tutor?.id) : row.pendingTutor;
  const tutor = tutorId ? tutorsById.get(tutorId) : undefined;
  return tutor ? `${tutor.firstName} ${tutor.lastName}` : tutorId ? "Unknown tutor" : "-";
}

interface Props {
  group: IClassGroup | null;
  onOpenChange: (open: boolean) => void;
}

// A class group's admin page only ever showed aggregate confirmed/waitlist
// counts (IClassGroup.confirmedCount/waitlistCount are just numbers, not a
// stored roster - SubjectEnrollment doesn't record which of the two a given
// row landed in either), so there was no way to see WHO is actually in a
// group without leaving this page. Every SubjectEnrollment sharing this
// classGroup id is listed here instead, each with whatever tutor-assignment
// stage it's individually at - deliberately not attempting to also label
// which of these are the confirmed seats vs the waitlisted ones, since that
// split isn't stored per-row anywhere to read. Mirrors Stc-SuperAdmin's
// component of the same name.
export default function ClassGroupMembersDialog({ group, onOpenChange }: Props) {
  const [rows, setRows] = useState<SubjectEnrollment[]>([]);
  const [tutorsById, setTutorsById] = useState<Map<string, User>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (classGroupId: string) => {
    setIsLoading(true);
    const [[enrollmentsRes, error], [tutorsRes]] = await Promise.all([
      ListAllocationEnrollmentsAction({ classGroup: classGroupId }),
      GetUsersAction({ role: UserRole.TUTOR, limit: 1000 }),
    ]);
    if (error) toast.error(error);
    setRows(enrollmentsRes?.data ?? []);
    setTutorsById(new Map((tutorsRes?.data ?? []).map((t) => [t.id, t])));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (group) load(group.id);
  }, [group, load]);

  const columns: DataTableColumn<SubjectEnrollment>[] = [
    { header: "Student", cell: (row) => <span className="font-medium text-gray-900">{row.student.fullName}</span> },
    { header: "Subject", cell: (row) => row.subject },
    { header: "Tutor", cell: (row) => <span className="text-gray-500">{tutorLabel(row, tutorsById)}</span> },
    { header: "Status", cell: (row) => <Badge variant="outline">{SUBJECT_ENROLLMENT_STATUS_LABELS[row.status]}</Badge> },
    { header: "Since", cell: (row) => <span className="text-gray-500">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <Dialog open={!!group} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{group?.label ?? "Class group"}</DialogTitle>
        </DialogHeader>
        {group && (
          <p className="text-sm text-gray-500 -mt-2">
            {group.confirmedCount}/{group.capacity} confirmed
            {group.waitlistCount > 0 ? `, ${group.waitlistCount} waitlisted` : ""} · seat status isn&apos;t tracked
            per student below, only each row&apos;s own tutor-assignment progress.
          </p>
        )}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No students on this class group's subject yet."
        />
      </DialogContent>
    </Dialog>
  );
}
