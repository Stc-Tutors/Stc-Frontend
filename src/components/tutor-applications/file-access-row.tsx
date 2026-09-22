"use client";

import { useState } from "react";
import { formatDate } from "@/lib/datetime";
import { Eye, Download } from "lucide-react";
import { UploadedFile } from "@/lib/cloudinary-upload";
import ResourcePreviewDialog from "@/components/resources/ResourcePreviewDialog";

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Cloudinary serves the plain URL inline (browsers render images/PDFs,
// download everything else) - `fl_attachment` forces a real download
// regardless of type, for the admin's explicit "Download" action. Only
// valid for a plain `type: upload` delivery URL - an `authenticated`-type
// one (gov ID / cert proof - see stcbe's uploads.controller.ts
// AUTHENTICATED_FOLDERS) has its signature computed over the exact
// transformation string it was minted with, so splicing fl_attachment into
// it afterward produces an invalid signature and a broken link. Left
// unchanged for that case - opens/saves via the browser's own handling of
// the plain (still correctly signed, still working) URL instead.
function toDownloadUrl(url: string): string {
  if (url.includes("/authenticated/")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}

// One row of crossCuttingRequirements.adminFileAccess in
// tutor-registration-schema.json: file name, upload date, type/size, a
// preview action, and a download action - for one uploaded file under an
// applicant's record. Used for every file_upload field (gov ID, CV,
// headshot, supporting documents, each certification proof).
export default function FileAccessRow({ label, file }: { label: string; file: UploadedFile }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 border rounded-md px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-500 truncate">
          {file.fileName} · {file.fileType} · {formatFileSize(file.fileSizeBytes)} · uploaded{" "}
          {formatDate(file.uploadedAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => setPreviewOpen(true)} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
        <a
          href={toDownloadUrl(file.url)}
          className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>
      <ResourcePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} title={label} url={file.url} />
    </div>
  );
}
