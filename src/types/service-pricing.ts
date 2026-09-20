// IService.slug - previously a fixed 10-value union, widened to string so
// any live Service Catalog entry can be priced, not just the original ten.
export type EnrollmentServiceType = string;

export const CURRENCIES = ["NGN", "USD", "EUR", "GBP", "CAD", "GHS", "ZAR", "KES", "ZMW", "CHF", "CNY"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

// A single currency-specific amount within a pricing row - one row can carry
// a distinct amount per currency instead of forcing a conversion at checkout.
// Mirrors stcbe's IServicePricePoint/Stc-SuperAdmin's PricePoint exactly -
// this repo's version previously modeled a single flat ratePerHour/flatRate/
// currency instead of this array, which doesn't match the real
// CreateServicePricingDto (prices is required) - every create attempt here
// was rejected by the backend outright.
export interface PricePoint {
  currency: CurrencyCode;
  ratePerHour?: number;
  flatRate?: number;
}

// Every priced combination is its own explicit row - no fallback/inheritance
// matching, per how the backend's ServicePricingRepository.findMatching works.
export interface ServicePricing {
  id: string;
  serviceType: EnrollmentServiceType;
  curriculum?: string;
  subject?: string;
  courseId?: string;
  // Priced against one specific Flow Tree item (e.g. a single module of a
  // Course Module service) - takes precedence over the name/curriculum
  // dimensions when a subject's node id is known. See stcbe's
  // ServicePricingRepository.findMatching.
  taxonomyNodeId?: string;
  country?: string;
  gradeLevel?: string;
  // One-on-one vs group - a row with this unset matches either format (see
  // stcbe's IServicePricing.classFormat/ServicePricingRepository.findMatching).
  classFormat?: "one-on-one" | "group";
  prices: PricePoint[];
  isActive: boolean;
}
