export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  isActive: boolean;
}
