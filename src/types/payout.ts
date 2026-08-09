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
  periodStart: string;
  periodEnd: string;
  hoursSincePaid: number;
  currentBalance: number;
  lines: PayoutRequestLine[];
  unpriced: { courseId: string; courseTitle: string; hours: number }[];
  hasPendingRequest: boolean;
}
