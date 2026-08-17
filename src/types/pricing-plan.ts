export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  isActive: boolean;
  // Perks an ACTIVE subscriber to this plan receives.
  discountPercent?: number;
  resourceAccess?: boolean;
  referralBonusPercent?: number;
  priorityAllocation?: boolean;
}
