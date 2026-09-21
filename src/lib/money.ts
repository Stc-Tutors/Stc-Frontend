// One way to show money everywhere. Screens used to mix "2,027,500", "NGN 5,000" and "₦0" for the same kind of
// figure. Amounts are stored as whole currency units (not kobo/cents).
//
// `en-NG` puts the naira sign on NGN and unambiguous prefixes on other currencies (US$, CA$, £, €) so two
// different dollars are never both shown as "$". A figure with no currency of its own is shown in the platform
// currency, NGN (every current price and course is NGN).
export const DEFAULT_CURRENCY = "NGN";

export function formatMoney(amount: number | string | null | undefined, currency?: string | null): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return "—";
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: code,
      // Whole amounts read as "₦5,000", not "₦5,000.00"; fractional ones keep both decimals.
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // An unknown or malformed currency code must not break the page it appears on.
    return `${code} ${value.toLocaleString()}`;
  }
}

// Short form for chart axes, where "₦2,000,000" on every tick would crowd the plot: "₦2M", "₦1.5K".
export function formatMoneyCompact(amount: number, currency?: string | null): string {
  if (!Number.isFinite(amount)) return "";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: (currency || DEFAULT_CURRENCY).toUpperCase(),
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return String(amount);
  }
}
