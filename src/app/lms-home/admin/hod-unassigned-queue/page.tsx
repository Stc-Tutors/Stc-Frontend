"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-context";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import UnassignedQueueDetailDialog from "@/components/allocations/unassigned-queue-detail-dialog";
import { GetHodUnassignedQueueAction } from "@/server/hod";
import { HodPermission } from "@/types/hod";
import { SUBJECT_ENROLLMENT_STATUS_LABELS, SubjectEnrollment } from "@/types/allocation-hub";

// HOD-scoped view of the Unassigned Enrollments queue - server-side scoped
// to whatever service(s)/curriculum the caller's MANAGE_UNASSIGNED_QUEUE
// scope(s) grant (see stcbe's HodService.getUnassignedQueue). Row click
// reuses the same suggest/assign/meeting-link workflow the platform-wide
// Allocation Hub uses.
export default function HodUnassignedQueuePage() {
  const { hasHodPermission, isLoading: isLoadingUser } = useUser();
  const [rows, setRows] = useState<SubjectEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<SubjectEnrollment | null>(null);

  const canView = hasHodPermission(HodPermission.MANAGE_UNASSIGNED_QUEUE);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetHodUnassignedQueueAction();
    if (error) toast.error(error);
    setRows(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (canView) load();
    else setIsLoading(false);
  }, [canView, load]);

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

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!canView) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Unassigned Queue</h1>
        <p className="text-sm text-gray-500">
          You need Manage Unassigned Queue granted on at least one HOD scope to see this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Unassigned Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          Newly registered/paid students within your scope, waiting on a tutor. Click a row to find a tutor, assign
          one, and set the class meeting link.
        </p>
      </div>

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
