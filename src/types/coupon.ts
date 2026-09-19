export type CouponDiscountType = "PERCENT" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  isActive: boolean;
  maxRedemptions?: number;
  timesRedeemed: number;
  expiresAt?: string;
  description?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponDiscountPreview {
  coupon: Coupon;
  discountAmount: number;
  discountedAmount: number;
}
