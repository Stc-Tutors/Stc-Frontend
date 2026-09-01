export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface Payment {
  id: string;
  user: string;
  student: {
    fullName: string;
  };
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  description: string;
  paymentDate: string;
  reference: string;
  transactionId: string;
  // Paystack's access_code for this transaction, stored camelCase on the
  // backend's IPayment/Payment model (see stcbe src/core/interfaces/payment.ts
  // and src/models/payment.model.ts - no snake_case transform happens for
  // this field, only _id -> id). Used to resume a PENDING payment via
  // https://checkout.paystack.com/{accessCode}.
  accessCode: string;
}

export interface PaymentRequest {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// POST /payments/initialize body - mirrors stcbe's CreatePaymentDto
// (src/api/payment/dtos/payment.dto.ts). `student` is the studentId being
// paid for, not the paying parent/user (that's inferred server-side from
// the auth token).
export interface CreatePaymentPayload {
  student: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  country?: string;
  serviceType?: string;
}

export interface SpendingSummary {
  totalSpent: number;
  currency: string;
  byMonth: { month: string; total: number }[];
  byChild: { studentId: string | null; studentName: string; total: number }[];
}