import DOMPurify from "isomorphic-dompurify";

// Allow-list matches exactly what Stc-SuperAdmin's RichTextEditor toolbar can
// produce (bold/italic/underline/strikethrough, font family/size, colour) -
// nothing that could carry a script, link, or embedded media, since this
// content is admin-authored HTML rendered straight into the public
// marketing site for every visitor. Keep in sync with that toolbar.
const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "s", "strike", "font", "span", "div", "p", "br"];
const ALLOWED_ATTR = ["color", "face", "size", "style"];

export function sanitizeRichText(html?: string | null): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
