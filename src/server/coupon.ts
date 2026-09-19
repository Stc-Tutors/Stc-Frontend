"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Coupon, CouponDiscountPreview } from "@/types/coupon";

// Read-only preview - does NOT consume a redemption (see stcbe's
// CouponService.validate). The actual redemption happens server-side when
// the enrollment is finalized (StudentService.computeEnrollmentQuote), via
// the couponCode carried in EnrollmentData.
export async function ValidateCouponAction(
  code: string,
  amount: number
): Promise<[ApiResponse<CouponDiscountPreview> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/coupons/validate",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, amount }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CouponDiscountPreview>) : null;
  return [resData, error];
}

// Admin (SUPER_ADMIN/ALMIGHTY_ADMIN, or an admin granted MANAGE_COUPONS)

export async function CreateCouponAction(data: {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxRedemptions?: number;
  expiresAt?: string;
  description?: string;
}): Promise<[ApiResponse<Coupon> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/coupons/admin",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Coupon>) : null;
  return [resData, error];
}

export async function ListCouponsAction(): Promise<[ApiResponse<Coupon[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/coupons/admin",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Coupon[]>) : null;
  return [resData, error];
}

export async function SetCouponActiveAction(
  id: string,
  isActive: boolean
): Promise<[ApiResponse<Coupon> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/coupons/admin/${id}/status`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Coupon>) : null;
  return [resData, error];
}
