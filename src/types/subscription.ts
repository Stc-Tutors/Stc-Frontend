import { PricingPlan } from "./pricing-plan";

export enum SubscriptionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface SubscriptionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Subscription {
  id: string;
  // null when the referenced account/plan has since been deleted - a
  // populated ref resolves to null rather than the string id in that case.
  user: SubscriptionUser | string | null;
  plan: PricingPlan | string | null;
  status: SubscriptionStatus;
  reference: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  pausedReason?: string;
  pausedAt?: string;
  createdAt: string;
}

// GET /subscriptions/mine/restrictions - effective access state for the
// current user, aggregated across their own + (for a STUDENT) their
// parent's paused subscriptions. See SubscriptionService.getMyRestrictions.
export interface SubscriptionRestrictions {
  lmsAccessPaused: boolean;
  studentPortalRestricted: boolean;
  courseEnrollmentRestricted: boolean;
  reason?: string;
}
