import { NextResponse } from "next/server";
import fetchAPI from "@/lib/fetch";

// Backup path for file uploads. The normal path sends the file straight from the visitor's browser to Cloudinary (see
// lib/cloudinary-upload.ts), which is the one hop that can fail for reasons on the visitor's side - a mobile network, an
// antivirus/ad-blocker or a filtered connection that cannot reach api.cloudinary.com shows up as a bare "Failed to fetch". When that
// happens the browser retries here instead: the file comes to our own site (which the visitor demonstrably can reach), and THIS
// server hands it to Cloudinary using the same signed parameters. The signature call goes through our API exactly as before, so the
// same folder / session / rate-limit rules apply.

// Largest file accepted here; every folder's own limit (1-5MB) is enforced when the saved record is validated.
const MAX_BYTES = 8 * 1024 * 1024;

interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  allowedFormats: string;
  type?: string;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "That upload could not be read - please try again" }, { status: 400 });
  }

  const file = form.get("file");
  const folder = form.get("folder");
  if (!(file instanceof File) || typeof folder !== "string" || !folder) {
    return NextResponse.json({ message: "A file and a folder are required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "That file is too large to upload" }, { status: 413 });
  }

  const [sigRes, sigError] = await fetchAPI({
    url: `/uploads/signature?folder=${encodeURIComponent(folder)}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  if (sigError || !sigRes) {
    return NextResponse.json({ message: sigError || "Could not prepare file upload" }, { status: 502 });
  }
  const { data } = (await sigRes.json()) as { data?: UploadSignature };
  if (!data) return NextResponse.json({ message: "Could not prepare file upload" }, { status: 502 });

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", data.apiKey);
  body.append("timestamp", String(data.timestamp));
  body.append("signature", data.signature);
  body.append("folder", folder);
  body.append("allowed_formats", data.allowedFormats);
  if (data.type) body.append("type", data.type);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const upload = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`, { method: "POST", body, signal: controller.signal });
    const result = await upload.json().catch(() => ({}));
    if (!upload.ok) {
      return NextResponse.json({ message: result?.error?.message || "File upload failed - please try again" }, { status: upload.status >= 500 ? 502 : 400 });
    }
    return NextResponse.json({
      url: result.secure_url as string,
      fileName: result.format ? `${result.original_filename}.${result.format}` : result.original_filename,
      fileType: ((result.format as string) ?? "").toUpperCase(),
      fileSizeBytes: result.bytes as number,
      uploadedAt: result.created_at as string,
    });
  } catch {
    return NextResponse.json({ message: "The upload service did not respond - please try again in a moment" }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
