"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentAttendanceAction } from "@/server/attendance";

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DownloadReport() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (type: "csv" | "pdf") => {
    setIsLoading(true);
    const [enrollmentsRes] = await GetEnrollmentsAction();
    const studentId = enrollmentsRes?.data?.[0]?.id;
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const [attendanceRes] = await GetStudentAttendanceAction(studentId);
    const records = attendanceRes?.data ?? [];

    if (type === "csv") {
      const rows = [
        ["Date", "Course", "Status", "Notes"],
        ...records.map((r) => [
          new Date(r.date).toLocaleDateString(),
          typeof r.course === "string" ? r.course : r.course.title,
          r.status,
          r.notes ?? "",
        ]),
      ];
      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      downloadBlob(csv, "attendance-report.csv", "text/csv");
    } else {
      const printable = `
        <html><head><title>Attendance Report</title></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>Attendance Report</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead><tr><th>Date</th><th>Course</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>
              ${records
                .map(
                  (r) =>
                    `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td>${
                      typeof r.course === "string" ? r.course : r.course.title
                    }</td><td>${r.status}</td><td>${r.notes ?? ""}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body></html>`;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printable);
        printWindow.document.close();
        printWindow.print();
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white-100 text-gray-700 rounded-xl p-4 flex items-center justify-between shadow-md">
      <div>
        <h4 className="font-semibold text-lg">Attendance Report</h4>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600"
          >
            <Download className="w-4 h-4" />
            {isLoading ? "Preparing..." : "Download Report"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDownload("pdf")}>Print / Save as PDF</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("csv")}>Download as CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
