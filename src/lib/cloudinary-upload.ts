import { GetUploadSignatureAction } from "@/server/uploads";

// Allowed folders - must match stcbe's uploads.controller.ts ALLOWED_FOLDERS.
export type UploadFolder =
  | "tutor-applications/gov-id"
  | "tutor-applications/cv"
  | "tutor-applications/headshot"
  | "tutor-applications/cert-proof"
  | "tutor-applications/supporting-documents"
  | "assignments/attachments";

// Metadata captured at upload time - see stcbe's IUploadedFile. Cloudinary's
// upload response has all of this already; discarding everything but the
// URL (as this used to) is what made the admin file-access view impossible.
export interface UploadedFile {
  url: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface UploadLimits {
  allowedFormats: string[];
  maxSizeMB: number;
}

// UI-side check so a rejected file never even reaches the network - the
// backend re-validates against the same limits (assertDocumentUploadsValid)
// and is the actual source of truth. Extension-based, not content-sniffed:
// good enough for steering a well-intentioned upload, not a security boundary.
export function validateFileBeforeUpload(file: File, limits: UploadLimits): string | null {
  const ext = file.name.split(".").pop()?.toUpperCase();
  if (!ext || !limits.allowedFormats.includes(ext)) {
    return `File type must be one of ${limits.allowedFormats.join(", ")}`;
  }
  const maxBytes = limits.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File must be ${limits.maxSizeMB}MB or smaller`;
  }
  return null;
}

// Signed client-side upload: fetches a signature from our backend, then
// posts the file straight to Cloudinary - the file itself never transits
// our API server. Used by any tutor-application file_upload field.
export async function uploadToCloudinary(file: File, folder: UploadFolder): Promise<UploadedFile> {
  const [res, error] = await GetUploadSignatureAction(folder);
  if (error || !res?.data) {
    throw new Error(error || "Could not prepare file upload");
  }
  const { signature, timestamp, apiKey, cloudName } = res.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error("File upload failed - please try again");
  }

  const uploadData = await uploadRes.json();
  return {
    url: uploadData.secure_url as string,
    // Cloudinary strips the extension into `format` separately - original_filename
    // is just the base name, so re-attach it for a filename that reads naturally.
    fileName: uploadData.format ? `${uploadData.original_filename}.${uploadData.format}` : uploadData.original_filename,
    fileType: (uploadData.format as string)?.toUpperCase() ?? "",
    fileSizeBytes: uploadData.bytes as number,
    uploadedAt: uploadData.created_at as string,
  };
}
