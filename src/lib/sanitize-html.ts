import sanitizeHtml from "sanitize-html";

// Allow-list matches exactly what Stc-SuperAdmin's RichTextEditor toolbar can
// produce (bold/italic/underline/strikethrough, font family/size, colour) -
// nothing that could carry a script, link, or embedded media, since this
// content is admin-authored HTML rendered straight into the public
// marketing site for every visitor. Keep in sync with that toolbar.
//
// Uses sanitize-html (pure JS, no jsdom) rather than isomorphic-dompurify -
// the latter's server-side path pulls in jsdom, whose html-encoding-sniffer
// dependency require()s an ESM-only module. That's fatal under Vercel's
// Turbopack SSR bundling (ERR_REQUIRE_ESM) the moment a non-empty string
// actually reaches DOMPurify.sanitize(), which is exactly what crashed the
// campaign landing page (/go/<slug>) to a bare 500 in production while every
// other page happened not to hit it.
const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "s", "strike", "font", "span", "div", "p", "br"];
const ALLOWED_ATTR = ["color", "face", "size", "style"];

export function sanitizeRichText(html?: string | null): string {
  if (!html) return "";
  return sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: { "*": ALLOWED_ATTR } });
}
