"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { csvFilename, downloadCsv, toCsv, type CsvColumn } from "@/lib/csv-export";

// Exports every row matching the list's current filters (not just the visible page).
export function ExportCsvButton<T>({
  filenameBase,
  columns,
  fetchRows,
  label = "Export CSV",
}: {
  filenameBase: string;
  columns: CsvColumn<T>[];
  fetchRows: () => Promise<T[]>;
  label?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const rows = await fetchRows();
      if (rows.length === 0) {
        toast.info("Nothing to export for the current filters.");
        return;
      }
      downloadCsv(csvFilename(filenameBase), toCsv(rows, columns));
      toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {isExporting ? "Exporting..." : label}
    </Button>
  );
}
