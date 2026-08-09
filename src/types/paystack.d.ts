declare module "@paystack/inline-js" {
  interface PaystackTransaction {
    reference: string;
    status: string;
    message: string;
    transaction: string;
    trxref: string;
  }

  interface ResumeTransactionOptions {
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onLoad?: (response: unknown) => void;
    onError?: (error: { message: string }) => void;
  }

  interface PaystackPopInstance {
    resumeTransaction(accessCode: string, options?: ResumeTransactionOptions): void;
  }

  export default class PaystackPop {
    constructor();
    resumeTransaction(accessCode: string, options?: ResumeTransactionOptions): void;
  }
}
