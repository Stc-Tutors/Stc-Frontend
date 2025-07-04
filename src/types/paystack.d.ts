declare module "@paystack/inline-js"

interface PaystackPop {
  new (): PaystackPopInstance;
  resumeTransaction(accessCode: string): void;
  // Add other PaystackPop methods you use, if any
}

interface PaystackPopInstance {
  resumeTransaction(accessCode: string): void;
  // Add other instance methods if needed
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}