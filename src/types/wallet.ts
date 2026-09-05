export enum WalletTransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum WalletTransactionReason {
  NO_SHOW_PENALTY_CREDIT = "NO_SHOW_PENALTY_CREDIT",
  LATE_CANCEL_PENALTY_CREDIT = "LATE_CANCEL_PENALTY_CREDIT",
  LATE_RESCHEDULE_PENALTY_CREDIT = "LATE_RESCHEDULE_PENALTY_CREDIT",
  TUTOR_NO_SHOW_COMPENSATION = "TUTOR_NO_SHOW_COMPENSATION",
  TOPUP = "TOPUP",
  PAYMENT_APPLIED = "PAYMENT_APPLIED",
  REVERSAL = "REVERSAL",
}

export const WALLET_TRANSACTION_REASON_LABELS: Record<WalletTransactionReason, string> = {
  [WalletTransactionReason.NO_SHOW_PENALTY_CREDIT]: "No-show penalty credit",
  [WalletTransactionReason.LATE_CANCEL_PENALTY_CREDIT]: "Late cancellation credit",
  [WalletTransactionReason.LATE_RESCHEDULE_PENALTY_CREDIT]: "Late reschedule credit",
  [WalletTransactionReason.TUTOR_NO_SHOW_COMPENSATION]: "Tutor no-show compensation",
  [WalletTransactionReason.TOPUP]: "Wallet top-up",
  [WalletTransactionReason.PAYMENT_APPLIED]: "Applied to a payment",
  [WalletTransactionReason.REVERSAL]: "Reversal",
};

export interface WalletBalance {
  currency: string;
  balance: number;
}

export interface WalletTransaction {
  id: string;
  currency: string;
  type: WalletTransactionType;
  reason: WalletTransactionReason;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

export interface WalletTopUpResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}
