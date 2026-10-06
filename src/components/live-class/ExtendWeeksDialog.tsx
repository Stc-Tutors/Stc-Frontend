"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { invalidateTags } from "@/lib/client-cache";
import { formatDate } from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import { VerifyPaymentAction } from "@/server/payment";
import { ExtendScheduleAction, GetExtensionQuoteAction, type ExtensionQuote } from "@/server/course-enrollment";
import { LocalFirstPrice } from "@/components/local-price-note";

const REFRESH_TAGS = ["hours", "lessons", "payments", "enrollments", "wallet"];

// Buy more weeks of an existing one-on-one service: same tutor, same days and times, starting after the last class.
export default function ExtendWeeksDialog({ studentId, courseId, subject }: { studentId: string; courseId: string; subject?: string }) {
  const [open, setOpen] = useState(false);
  const [weeks, setWeeks] = useState("4");
  const [quote, setQuote] = useState<ExtensionQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const n = Number(weeks);
  const validWeeks = Number.isInteger(n) && n >= 1 && n <= 52;

  useEffect(() => {
    if (!open || !validWeeks) {
      setQuote(null);
      return;
    }
    let stale = false;
    setQuoteError(null);
    const t = setTimeout(async () => {
      const [res, error] = await GetExtensionQuoteAction(studentId, courseId, n);
      if (stale) return;
      setQuote(res?.data ?? null);
      setQuoteError(error);
    }, 300);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [open, n, validWeeks, studentId, courseId]);

  const finish = () => {
    invalidateTags(REFRESH_TAGS);
    setOpen(false);
  };

  const pay = async () => {
    if (!validWeeks) return;
    setBusy(true);
    const [res, error] = await ExtendScheduleAction(studentId, courseId, n);
    setBusy(false);
    const payment = res?.data?.payment;
    if (error || !res?.data) {
      ToastError(error || "Could not start payment");
      return;
    }
    if (payment?.fullyCoveredByWallet) {
      ToastSuccess("Paid from your wallet - the extra classes are being added.");
      finish();
      return;
    }
    if (!payment) {
      ToastSuccess(res.message || "Done");
      finish();
      return;
    }
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction(payment.access_code, {
      onSuccess: async () => {
        const [, verifyError] = await VerifyPaymentAction(payment.reference);
        if (verifyError) {
          ToastError(verifyError);
          return;
        }
        ToastSuccess("Payment successful - the extra classes have been added.");
        finish();
      },
      onCancel: () => ToastError("Payment was not completed."),
      onError: (e: { message?: string }) => ToastError(e?.message || "Payment failed. Please try again."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add more weeks</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add more weeks{subject ? ` of ${subject}` : ""}</DialogTitle>
          <DialogDescription>
            Keeps the same tutor, days and times, starting the week after the last scheduled class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="extend-weeks">How many more weeks?</Label>
            <Input id="extend-weeks" type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(e.target.value)} />
            {!validWeeks && <p className="text-xs text-red-600">Enter a whole number from 1 to 52.</p>}
          </div>
          {quoteError && <p className="text-sm text-red-600">{quoteError}</p>}
          {quote && (
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p>
                {quote.weeks} week{quote.weeks === 1 ? "" : "s"} x {quote.lessonsPerWeek} class{quote.lessonsPerWeek === 1 ? "" : "es"} a week
              </p>
              <p className="mt-1 text-base font-semibold"><LocalFirstPrice amount={quote.amount} currency={quote.currency} explain>{formatMoney(quote.amount, quote.currency)}</LocalFirstPrice></p>
              {quote.firstNewLesson && <p className="mt-1 text-xs text-gray-500">First new class around {formatDate(quote.firstNewLesson)}</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={pay} disabled={busy || !quote}>
            {busy ? "Starting payment..." : "Pay & add weeks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
