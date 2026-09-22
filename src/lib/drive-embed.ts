// Shared Google Drive / Docs embed helpers. Originally lived as a local
// copy inside SecureVideoPlayer.tsx; pulled out here so any resource
// preview surface (not just lesson recordings) can embed the same way.
export function extractDriveFileId(url: string): string | null {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch) return fileMatch[1];
  const idParamMatch = url.match(/[?&]id=([^&#]+)/);
  if (idParamMatch) return idParamMatch[1];
  return null;
}

export function getEmbeddableUrl(url: string): string {
  const id = extractDriveFileId(url);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  const docsMatch = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([^/?#]+)/);
  if (docsMatch) return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`;
  return url; // fallback: try the raw url in an iframe; caller should always offer an "open in new tab" link alongside
}

export type ViewerKind = "frame" | "image" | "video" | "audio" | "blocked";

const EXT = (url: string) => (url.split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();

// The backend now rejects a non-http(s) attachment/resource URL at save time
// (see stcbe's UploadedFileDto/attachmentUrl @IsUrl decorators), but this is
// the actual sink (an <iframe src>/<img src>/<a href> built straight from
// whatever this returns) - checking here too means a URL from anywhere else
// (an older row saved before that fix, a different future source) still
// can't land a `javascript:`/`data:` URI in one of those.
export function isSafeResourceUrl(url: string): boolean {
  try {
    const protocol = new URL(url, "https://placeholder.invalid").protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Decides how a resource URL is rendered inside the LMS rather than sending
// the user to a new tab: Drive/Docs and PDFs frame directly, Office files go
// through Google's viewer (browsers can't render them natively), and
// image/audio/video use the native element. `src` is what to point that
// element/iframe at. Anything unrecognised falls back to framing the raw URL -
// callers should still offer an "open in new tab" link for sources that
// refuse to be framed (X-Frame-Options), which no client-side code can detect.
export function getViewerSource(url: string): { kind: ViewerKind; src: string } {
  if (!isSafeResourceUrl(url)) {
    return { kind: "blocked", src: "" };
  }
  if (extractDriveFileId(url) || /docs\.google\.com\/(document|spreadsheets|presentation)\//.test(url)) {
    return { kind: "frame", src: getEmbeddableUrl(url) };
  }
  const ext = EXT(url);
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return { kind: "image", src: url };
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return { kind: "video", src: url };
  if (["mp3", "wav", "m4a", "ogg"].includes(ext)) return { kind: "audio", src: url };
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
    return { kind: "frame", src: `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}` };
  }
  return { kind: "frame", src: url };
}
