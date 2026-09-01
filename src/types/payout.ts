export enum PayoutCycle {
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
}

export enum RateStatus {
  PROPOSED = "PROPOSED",
  CONFIRMED = "CONFIRMED",
}

export enum PayoutRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
}

// Rate/rateStatus/proposedRate/proposedBy moved to per-scope TutorRate rows
// (see types/tutor-rate.ts) - this profile now only holds bank/payout-cycle
// bookkeeping that isn't tied to any particular pricing scope.
export interface TutorPayoutProfile {
  id: string;
  tutor: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  paystackRecipientCode?: string;
  lastPaidThrough?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRequestLine {
  courseId: string;
  courseTitle: string;
  hours: number;
  ratePerHour?: number;
  flatRate?: number;
  amount: number;
}

export interface PayoutRequest {
  id: string;
  tutor: string;
  periodStart: string;
  periodEnd: string;
  hoursWorked: number;
  lines: PayoutRequestLine[];
  grossAmount: number;
  surchargeDeduction: number;
  amount: number;
  currency: string;
  status: PayoutRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  paystackTransferCode?: string;
  paystackTransferReference?: string;
  paidAt?: string;
}

export interface PayoutSettings {
  id: string;
  cycle: PayoutCycle;
  updatedBy?: string;
  updatedAt: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface TutorBalance {
  currency: string;
  hoursSincePaid: number;
  // What you can actually withdraw right now: grossBalance minus
  // surchargeDeduction minus committed (already requested/paid, so it's not
  // double-countable).
  currentBalance: number;
  grossBalance: number;
  surchargeDeduction: number;
  committed: number;
  lines: PayoutRequestLine[];
  unpriced: { courseId: string; courseTitle: string; hours: number }[];
  hasPendingRequest: boolean;
  // Null once the withdrawal cooldown has elapsed (or no request has ever
  // been made) - otherwise the timestamp the next request becomes possible.
  nextWithdrawalAvailableAt: string | null;
}
