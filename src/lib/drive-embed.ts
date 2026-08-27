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
