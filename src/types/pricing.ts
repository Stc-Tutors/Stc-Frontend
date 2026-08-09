// Mirrors stcbe's POST /pricing/quote contract (src/api/pricing/dtos/pricing.dto.ts
// and src/api/pricing/pricing.service.ts's PricingQuote). Public/logged-in
// endpoint used to get a live, server-authoritative price before checkout -
// the client never trusts a locally-computed number for the actual charge.

export interface QuotePricingPayload {
  serviceType: string;
  curriculum?: string;
  subject?: string;
  courseId?: string;
  gradeLevel?: string;
  // Overrides IP-detected country.
  country?: string;
  // Overrides the currency implied by the resolved country.
  currency?: string;
}

export interface PricingQuote {
  amount: number;
  currency: string;
  ratePerHour?: number;
  flatRate?: number;
  serviceType: string;
  curriculum?: string;
  gradeLevel?: string;
  country?: string;
  gateway: string;
  channels: string[];
  // True when the requested/resolved currency had no price configured and
  // the backend fell back to a different currency's price row.
  currencyFallback: boolean;
}
