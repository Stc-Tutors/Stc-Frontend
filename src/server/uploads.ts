"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
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
