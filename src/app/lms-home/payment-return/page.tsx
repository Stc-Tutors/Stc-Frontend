"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VerifyPaymentAction } from "@/server/payment";
import { PENDING_CHECKOUT_KEY } from "@/lib/checkout";

// Where Flutterwave sends the buyer back to after a hosted checkout (see lib/checkout.ts). The redirect's own
// status is never trusted - the payment is verified with our server, which asks Flutterwave - and then the buyer
// is sent on to wherever they started.
function PaymentReturn() {
  const router = useRouter();
  const params = useSearchParams();
  const ran = useRef(false);
  const [message, setMessage] = useState("Confirming your payment...");
  const [done, setDone] = useState(false);
  const [target, setTarget] = useState("/lms-home");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let pending: { reference?: string; returnTo?: string } = {};
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_CHECKOUT_KEY) || "{}");
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    } catch {
      /* nothing remembered - use what the redirect carried */
    }
    // Only ever send them somewhere on this site.
    const returnTo = pending.returnTo && pending.returnTo.startsWith("/") && !pending.returnTo.startsWith("//") ? pending.returnTo : "/lms-home";
    setTarget(returnTo);

    const reference = params.get("tx_ref") || pending.reference;
    const finish = (text: string) => {
      setMessage(text);
      setDone(true);
      window.setTimeout(() => router.replace(returnTo), 2500);
    };

    if (!reference) {
      finish("We couldn't tell which payment this was. If you paid, it will show in your payment history shortly.");
      return;
    }
    if (params.get("status") === "cancelled") {
      finish("The payment was not completed. You can finish it anytime from your payment history.");
      return;
    }

    // The gateway can redirect back a moment before it confirms the charge, so a still-pending answer is re-checked a few times
    // before giving up (the payments list also refreshes on its own once the server confirms it).
    const check = (attempt: number) => {
      VerifyPaymentAction(reference).then(([res, error]) => {
        if (error) finish(error);
        else if (res?.data?.status === "COMPLETED") finish("Payment successful. Taking you back...");
        else if (res?.data?.status === "FAILED") finish("The payment didn't go through. You can try again from your payment history.");
        else if (attempt < 4) window.setTimeout(() => check(attempt + 1), 3000);
        else finish("Payment received. It will show as paid as soon as it's confirmed.");
      });
    };
    check(0);
  }, [params, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-lg font-medium text-gray-900">{message}</p>
        {done && (
          <button onClick={() => router.replace(target)} className="text-sm text-blue-600 hover:underline">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturn />
    </Suspense>
  );
}
