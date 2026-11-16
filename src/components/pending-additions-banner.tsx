"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { invalidateTags } from "@/lib/client-cache";
import { createCheckout } from "@/lib/checkout";
import { formatMoney } from "@/lib/money";
import { VerifyPaymentAction } from "@/server/payment";
import { GetMyPendingAdditionsAction, PayAdditionAction, type PendingAddition } from "@/server/enrollment-addition";

const REFRESH_TAGS = ["enrollments", "payments", "wallet", "lessons", "hours"];

// Subjects/courses STC added to a child's enrollment that still need paying for. Shown as "awaiting payment" until the family pays
// (or an admin releases it) - nothing is scheduled for it before then.
export default function PendingAdditionsBanner() {
  const [items, setItems] = useState<PendingAddition[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [res] = await GetMyPendingAdditionsAction();
    setItems(res?.data ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const done = () => {
    invalidateTags(REFRESH_TAGS);
    load();
  };

  const pay = async (a: PendingAddition) => {
    setBusyId(a.id);
    const [res, error] = await PayAdditionAction(a.id);
    setBusyId(null);
    const payment = res?.data;
    if (error || !payment) {
      ToastError(error || "Could not start payment");
      return;
    }
    if (payment.fullyCoveredByWallet) {
      ToastSuccess("Paid from your wallet - it is being added.");
      done();
      return;
    }
    const popup = await createCheckout(payment);
    popup.resumeTransaction(payment.access_code, {
      onSuccess: async () => {
        const [, verifyError] = await VerifyPaymentAction(payment.reference);
        if (verifyError) {
          ToastError(verifyError);
          return;
        }
        ToastSuccess("Payment successful - it has been added.");
        done();
      },
      onCancel: () => ToastError("Payment was not completed."),
      onError: (e: { message?: string }) => ToastError(e?.message || "Payment failed. Please try again."),
    });
  };

  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div key={a.id} className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-amber-900">
            <p className="font-medium">
              Awaiting payment: {a.items.map((i) => i.subject).join(", ")}
              {a.studentName ? ` for ${a.studentName}` : ""}
            </p>
            <p className="text-xs">Added to the enrollment by STC. Classes can be scheduled once it is paid.</p>
          </div>
          <Button size="sm" onClick={() => pay(a)} disabled={busyId === a.id}>
            {busyId === a.id ? "Starting payment..." : `Pay ${formatMoney(a.amount, a.currency as never)}`}
          </Button>
        </div>
      ))}
    </div>
  );
}
