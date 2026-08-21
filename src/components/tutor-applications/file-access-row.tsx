import { Eye, Download } from "lucide-react";
import { UploadedFile } from "@/lib/cloudinary-upload";

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Cloudinary serves the plain URL inline (browsers render images/PDFs,
// download everything else) - `fl_attachment` forces a real download
// regardless of type, for the admin's explicit "Download" action.
function toDownloadUrl(url: string): string {
  return url.replace("/upload/", "/upload/fl_attachment/");
}

// One row of crossCuttingRequirements.adminFileAccess in
// tutor-registration-schema.json: file name, upload date, type/size, a
// preview action, and a download action - for one uploaded file under an
// applicant's record. Used for every file_upload field (gov ID, CV,
// headshot, supporting documents, each certification proof).
export default function FileAccessRow({ label, file }: { label: string; file: UploadedFile }) {
  return (
    <div className="flex items-center justify-between gap-3 border rounded-md px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-500 truncate">
          {file.fileName} · {file.fileType} · {formatFileSize(file.fileSizeBytes)} · uploaded{" "}
          {new Date(file.uploadedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </a>
        <a
          href={toDownloadUrl(file.url)}
          className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>
    </div>
  );
}
