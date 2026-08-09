export enum ReferralEarningStatus {
  PENDING = "PENDING",
  LOCKED = "LOCKED",
  WITHDRAWN = "WITHDRAWN",
}

export enum ReferralPayoutRequestStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  REJECTED = "REJECTED",
  FAILED = "FAILED",
}

export interface ReferralEarning {
  id: string;
  referrer: string;
  referredUser: string | { id: string; firstName: string; lastName: string };
  payment: string;
  amount: number;
  currency: string;
  percentage: number;
  status: ReferralEarningStatus;
  payoutRequest?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralPayoutRequest {
  id: string;
  user: string | { id: string; firstName: string; lastName: string; email?: string; role?: string };
  amount: number;
  currency: string;
  status: ReferralPayoutRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  paystackTransferCode?: string;
  paystackTransferReference?: string;
  paidAt?: string;
  createdAt: string;
}

export interface ReferralPayoutProfile {
  id: string;
  user: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  paystackRecipientCode?: string;
}

export interface ReferralSettings {
  id: string;
  percentage: number;
  updatedBy?: string;
  updatedAt: string;
}

export interface ReferralBalance {
  pendingBalance: number;
  lockedBalance: number;
  withdrawnTotal: number;
  hasPendingRequest: boolean;
}

export interface ReferralBank {
  name: string;
  code: string;
}
