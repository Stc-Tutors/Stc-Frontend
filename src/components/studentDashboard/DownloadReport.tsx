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
    <div className="bg-white-100 text-gray-700 rounded-xl p-4 flex items-center justify-between shadow-md">
      <div>
        <h4 className="font-semibold text-lg">Attendance Report</h4>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600">
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
