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
  user: SubscriptionUser | string;
  plan: PricingPlan | string;
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
