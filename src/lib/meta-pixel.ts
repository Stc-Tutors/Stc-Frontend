// Meta (Facebook) Pixel helpers. The pixel itself is loaded by
// components/meta-pixel.tsx when NEXT_PUBLIC_META_PIXEL_ID is set; every helper
// here is a safe no-op when it isn't (local dev, or the id not configured yet).

type Fbq = (...args: unknown[]) => void;

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

// Standard events only, and never personal data (no email/phone/names) -
// Meta's standard events need none, and parents' details stay off third parties.
export function trackMetaEvent(event: "Lead" | "CompleteRegistration" | "InitiateCheckout", params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);
}
