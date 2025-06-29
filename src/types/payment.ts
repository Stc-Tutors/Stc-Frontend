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
}

export interface PaymentRequest {
  authorization_url: string;
  access_code: string;
  reference: string;
}