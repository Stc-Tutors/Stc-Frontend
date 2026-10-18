import { GetUploadSignatureAction } from "@/server/uploads";

// Allowed folders - must match stcbe's uploads.controller.ts ALLOWED_FOLDERS.
export type UploadFolder =
  | "tutor-applications/gov-id"
  | "tutor-applications/cv"
  | "tutor-applications/headshot"
  | "tutor-applications/cert-proof"
  | "tutor-applications/supporting-documents"
  | "assignments/attachments"
  | "submissions/attachments"
  | "careers/resumes"
  | "avatars";

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
//
// The direct hop to Cloudinary is the one part that can fail on the visitor's side (a poor or filtered mobile connection, an
// ad-blocker, antivirus) and the browser reports every such failure as the same unhelpful "Failed to fetch". So a network-level
// failure is retried once, and if it still fails the file is sent through our own site instead (/api/upload-fallback), which hands it
// to Cloudinary from the server.
export async function uploadToCloudinary(file: File, folder: UploadFolder): Promise<UploadedFile> {
  const [res, error] = await GetUploadSignatureAction(folder);
  if (error || !res?.data) {
    throw new Error(error || "Could not prepare file upload");
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await postDirectToCloudinary(file, folder, res.data);
    } catch (err) {
      if (!(err instanceof NetworkOrServerError)) throw err;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  return uploadViaOurServer(file, folder);
}

class NetworkOrServerError extends Error {}

type Signature = NonNullable<Awaited<ReturnType<typeof GetUploadSignatureAction>>[0]>["data"];

async function postDirectToCloudinary(file: File, folder: UploadFolder, signed: NonNullable<Signature>): Promise<UploadedFile> {
  const { signature, timestamp, apiKey, cloudName, allowedFormats, type } = signed;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);
  // Part of what the backend signed - Cloudinary rejects a mismatch, and refuses files outside this list.
  formData.append("allowed_formats", allowedFormats);
  // Also part of what was signed, only present for a folder the backend
  // restricts delivery on (currently gov-id/cert-proof) - omitted entirely
  // otherwise, matching what was actually signed.
  if (type) formData.append("type", type);

  let uploadRes: Response;
  try {
    uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData });
  } catch {
    // fetch only throws when the request never completed (no connection, blocked, cancelled).
    throw new NetworkOrServerError("network");
  }

  if (!uploadRes.ok) {
    if (uploadRes.status >= 500) throw new NetworkOrServerError("server");
    let message = "File upload failed - please try again";
    try {
      const body = await uploadRes.json();
      if (body?.error?.message) message = `File upload failed: ${body.error.message}`;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
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

async function uploadViaOurServer(file: File, folder: UploadFolder): Promise<UploadedFile> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  let res: Response;
  try {
    res = await fetch("/api/upload-fallback", { method: "POST", body });
  } catch {
    throw new Error("We couldn't upload your file - please check your internet connection and try again. If it keeps happening, try a different network or browser.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "File upload failed - please try again");
  return data as UploadedFile;
}
