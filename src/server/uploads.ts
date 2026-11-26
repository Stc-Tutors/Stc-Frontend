"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  allowedFormats: string;
  // Present (== "authenticated") for a folder the backend uploads as a
  // restricted Cloudinary delivery type instead of its default public one -
  // see stcbe's uploads.controller.ts AUTHENTICATED_FOLDERS.
  type?: string;
  apiKey: string;
  cloudName: string;
}

// Backs signed client-side uploads (tutor registration documents/headshot) -
// see stcbe's src/api/uploads. Deliberately unauthenticated on the backend
// since draft-phase applicants (gov ID, CV, cert proofs) don't have a normal
// session yet - the signature only blesses a specific folder/timestamp.
export async function GetUploadSignatureAction(
  folder: string
): Promise<[ApiResponse<UploadSignature> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/uploads/signature?folder=${encodeURIComponent(folder)}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<UploadSignature>) : null;
  return [resData, error];
}

export interface FinalizedUpload {
  url: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

// Step two of every upload (see stcbe's core/uploads/upload-finalize.service.ts): the backend checks the file Cloudinary just
// received (real file type, trojan checks, hidden data such as photo GPS location and document author removed), stores a
// clean copy under a random name and deletes the original. Only the returned file can be saved on a record.
export async function FinalizeUploadAction(url: string, folder: string): Promise<[ApiResponse<FinalizedUpload> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/uploads/finalize",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, folder }) },
  });
  const resData = res ? ((await res.json()) as ApiResponse<FinalizedUpload>) : null;
  return [resData, error];
}
