"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { GetHodDetailedReportAction } from "@/server/hod";
import { HodDetailedReportRow } from "@/types/hod";

const VETTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending Review",
  RECOMMENDED: "Under Final Review",
  NEEDS_MORE_INFO: "Needs More Info",
  APPROVED_PENDING_VETTING: "Approved - Vetting Pending",
  APPROVED: "Vetted",
  REJECTED: "Not Approved",
  NOT_APPLIED: "No Application on File",
};

const VETTING_STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  APPROVED_PENDING_VETTING: "bg-amber-100 text-amber-700",
  RECOMMENDED: "bg-blue-100 text-blue-700",
  PENDING: "bg-gray-100 text-gray-700",
  NEEDS_MORE_INFO: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
  NOT_APPLIED: "bg-gray-100 text-gray-500",
};

function pct(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: HodDetailedReportRow[]): string {
  const header = [
    "Student Name",
    "Course/Subject",
    "Assigned Tutor",
    "Tutor Vetting Status",
    "Attendance Rate (%)",
    "Attendance Records",
    "Academic Performance (%)",
    "Graded Assignments",
  ];
  const csvRows = [
    header,
    ...rows.map((r) => [
      r.studentName,
      `${r.courseTitle} (${r.subject})`,
      r.tutorName,
      VETTING_STATUS_LABELS[r.tutorVettingStatus] ?? r.tutorVettingStatus,
      r.attendanceRate === null ? "" : String(r.attendanceRate),
      String(r.attendanceRecordCount),
      r.academicPerformance === null ? "" : String(r.academicPerformance),
      String(r.gradedAssignmentCount),
    ]),
  ];
  return csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

// Granular per-(student, course) breakdown behind HodReportsPage's
// high-level scope cards - see stcbe's HodService.getDetailedReport.
export function HodDetailedReportTable() {
  const [rows, setRows] = useState<HodDetailedReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [res, error] = await GetHodDetailedReportAction();
    if (error) toast.error(error);
    setRows(res?.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    if (rows.length === 0) return;
    downloadBlob(toCsv(rows), `hod-report-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };

  const columns: DataTableColumn<HodDetailedReportRow>[] = [
    { header: "Student", cell: (r) => <span className="font-medium text-gray-900">{r.studentName}</span> },
    {
      header: "Course / Subject",
      cell: (r) => (
        <div>
          <p className="text-gray-900">{r.courseTitle}</p>
          {r.subject !== r.courseTitle && <p className="text-xs text-gray-400">{r.subject}</p>}
        </div>
      ),
    },
    {
      header: "Tutor",
      cell: (r) => (
        <div className="space-y-1">
          <p className="text-gray-900">{r.tutorName}</p>
          <Badge className={VETTING_STATUS_COLORS[r.tutorVettingStatus] ?? "bg-gray-100 text-gray-600"} variant="secondary">
            {VETTING_STATUS_LABELS[r.tutorVettingStatus] ?? r.tutorVettingStatus}
          </Badge>
        </div>
      ),
    },
    {
      header: "Attendance",
      cell: (r) => (
        <div>
          <p className="text-gray-900">{pct(r.attendanceRate)}</p>
          <p className="text-xs text-gray-400">{r.attendanceRecordCount} session(s) logged</p>
        </div>
      ),
    },
    {
      header: "Academic Performance",
      cell: (r) => (
        <div>
          <p className="text-gray-900">{pct(r.academicPerformance)}</p>
          <p className="text-xs text-gray-400">{r.gradedAssignmentCount} graded assignment(s)</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Detailed Report</h2>
          <p className="text-xs text-gray-500">One row per student per course, within your scope(s).</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0} className="gap-1.5">
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => `${r.studentId}-${r.courseId}`}
        isLoading={isLoading}
        emptyMessage="Nothing to report yet."
      />
    </div>
  );
}
