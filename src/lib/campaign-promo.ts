// CampaignSignupForm listens for this to prefill its coupon field.
export const APPLY_COUPON_EVENT = "stc:apply-coupon";

const DAY_MS = 24 * 60 * 60 * 1000;

// promoDeadline is stored as a date (UTC midnight), so it's formatted in UTC -
// otherwise a visitor west of UTC would see the day before. The offer runs
// through the end of that day. Plain module (not "use client") so both the
// server page and the client banner can call it.
export function promoExpired(deadlineIso?: string, now = Date.now()) {
  if (!deadlineIso) return false;
  return now >= new Date(deadlineIso).getTime() + DAY_MS;
}

export function formatPromoDeadline(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
