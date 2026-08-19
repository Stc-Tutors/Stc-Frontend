// Derives a readable page name from a route pathname for the loading
// screen (PageLoader) - no per-route name map to maintain, just a
// reasonable guess from the URL itself. Skips id-shaped trailing segments
// (Mongo ObjectIds, numeric ids) in favor of the nearest real word.
export function humanizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "Home";

  const segments = pathname.split("/").filter(Boolean);
  const isIdLike = (s: string) => /^[0-9a-f]{20,}$/i.test(s) || /^\d+$/.test(s);
  const word = [...segments].reverse().find((s) => !isIdLike(s)) ?? segments[segments.length - 1];

  return word
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
