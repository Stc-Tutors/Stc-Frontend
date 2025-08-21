// components/analytics/DownloadReport.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

export default function DownloadReport() {
  const handleDownload = (type: string) => {
    if (type === "pdf") {
      console.log("Download PDF triggered");
      // Implement actual PDF logic here
    } else if (type === "csv") {
      console.log("Download CSV triggered");
      // Implement actual CSV logic here
    }
  };

  return (
    <div className="bg-blue-100 text-blue-800 rounded-xl p-4 flex items-center justify-between shadow-md">
      <div>
        <h4 className="font-semibold text-lg">Attendance Report</h4>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDownload("pdf")}>Download as PDF</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("csv")}>Download as CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
