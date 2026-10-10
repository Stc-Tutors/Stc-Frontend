// Accepts any Google Drive share link format and returns an embeddable preview URL.
// Handles /file/d/<id>/view, ?id=<id>, and open?id=<id> variants. Returns null if no
// file id can be found, so callers can fall back to a plain link instead of a broken iframe.
export function toGoogleDriveEmbedUrl(shareLink: string): string | null {
  const trimmed = shareLink.trim();
  if (!trimmed) return null;

  // Docs/Sheets/Slides (and Office files opened in them) live under docs.google.com/<type>/d/<id> and need their own preview URL.
  const docsMatch = trimmed.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch) return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`;

  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  return null;
}
