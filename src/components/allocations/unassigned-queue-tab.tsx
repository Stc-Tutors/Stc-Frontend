"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import UnassignedQueueDetailDialog from "./unassigned-queue-detail-dialog";
import { ListAllocationEnrollmentsAction } from "@/server/allocation-hub";
import { SUBJECT_ENROLLMENT_STATUS_LABELS, SubjectEnrollment, SubjectEnrollmentStatus } from "@/types/allocation-hub";

// Enrollment-first workflow for Super Admin: every paid-but-unassigned
// subject/course enrollment, across all tutors and services. Click a row to
// see tutors approved for that exact subject/course, assign one, and set the
// class meeting link.
export default function UnassignedQueueTab({ jumpToken = 0 }: { jumpToken?: number }) {
  const [rows, setRows] = useState<SubjectEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<SubjectEnrollment | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await ListAllocationEnrollmentsAction({ status: SubjectEnrollmentStatus.UNASSIGNED_TUTOR });
    if (error) toast.error(error);
    setRows(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (jumpToken > 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken]);

  const handleChanged = () => {
    setSelected(null);
    load();
  };

  const columns: DataTableColumn<SubjectEnrollment>[] = [
    { header: "Student", cell: (row) => <span className="font-medium text-gray-900">{row.student.fullName}</span> },
    { header: "Subject/Course", cell: (row) => row.subject },
    { header: "Service", cell: (row) => row.serviceType ?? "-" },
    { header: "Status", cell: (row) => <Badge variant="outline">{SUBJECT_ENROLLMENT_STATUS_LABELS[row.status]}</Badge> },
    { header: "Registered", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">
        Every paid-but-unassigned subject/course enrollment, across all tutors and services. Click a row to see
        tutors approved for that exact subject/course, assign one, and set the class meeting link.
      </p>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Nothing waiting on allocation right now."
        onRowClick={setSelected}
      />

      <UnassignedQueueDetailDialog
        enrollment={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onChanged={handleChanged}
      />
    </div>
  );
}
