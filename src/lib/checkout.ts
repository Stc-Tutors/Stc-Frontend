// One way to open a payment checkout, whichever gateway took the payment.
//
// Paystack (naira) opens an in-page popup that reports back through callbacks. Flutterwave (every other
// currency) is a hosted page: the buyer is sent to it and returns to /lms-home/payment-return, which verifies
// the payment with our server and sends them on - so no in-page callback can run. createCheckout hides that
// difference behind the same `resumeTransaction(accessCode, callbacks)` call the Paystack popup has, so every
// place that used to open the popup directly now just asks this for one.

export interface CheckoutPayment {
  // 'flutterwave' | 'paystack' - absent on payments made before Flutterwave existed (all Paystack).
  gateway?: string;
  // What a freshly started payment carries (snake_case, from the initialize call) ...
  authorization_url?: string;
  // ... and what a stored Payment record carries when resumed from history.
  authorizationUrl?: string;
  reference?: string;
}

export interface CheckoutCallbacks {
  onSuccess?: (transaction?: any) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: { message?: string }) => void;
}

export interface CheckoutLauncher {
  resumeTransaction(accessCode: string, callbacks?: CheckoutCallbacks): unknown;
}

// Where the return page picks up after a hosted checkout, and the reference to verify if Flutterwave's redirect
// doesn't carry one.
export const PENDING_CHECKOUT_KEY = "stc.pendingCheckout";

export async function createCheckout(
  payment: CheckoutPayment,
  options?: {
    // Where to send the buyer once their payment has been checked after a hosted checkout. Defaults to the
    // page they started from.
    returnTo?: string;
  }
): Promise<CheckoutLauncher> {
  const hostedUrl = payment.authorization_url || payment.authorizationUrl;
  if (payment.gateway === "flutterwave" && hostedUrl) {
    return {
      resumeTransaction() {
        try {
          sessionStorage.setItem(
            PENDING_CHECKOUT_KEY,
            JSON.stringify({ reference: payment.reference, returnTo: options?.returnTo ?? window.location.pathname + window.location.search })
          );
        } catch {
          /* storage unavailable - the return page falls back to the dashboard */
        }
        window.location.assign(hostedUrl);
      },
    };
  }
  const { default: PaystackPop } = await import("@paystack/inline-js");
  return new PaystackPop() as unknown as CheckoutLauncher;
}
