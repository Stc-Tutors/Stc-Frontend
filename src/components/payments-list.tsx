"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { GetPaymentsAction, VerifyPaymentAction } from "@/server/payment";
import { Payment, PaymentStatus } from "@/types/payment";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  [PaymentStatus.COMPLETED]: "bg-green-50 text-green-700 border-green-200",
  [PaymentStatus.PENDING]: "bg-amber-50 text-amber-700 border-amber-200",
  [PaymentStatus.FAILED]: "bg-red-50 text-red-700 border-red-200",
  [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-700 border-gray-200",
};

interface PaymentsListProps {
  // "parent" pays for linked children (student.fullName can differ from the
  // account holder); "student" is a self-registering student (STUDENT-role
  // account with its own email - see StudentService.enroll's email check)
  // paying for their own enrollment. Same GetPaymentsAction/VerifyPaymentAction
  // either way - a Payment.user is always whoever actually paid.
  variant: "parent" | "student";
}

// Shared by the parent and self-paying-student Payments pages - identical
// list/resume/verify behavior, only the copy differs (see `variant`).
export default function PaymentsList({ variant }: PaymentsListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const refresh = () => {
    GetPaymentsAction().then(([res, err]) => {
      setPayments(res?.data ?? []);
      setError(err);
      setIsLoading(false);
    });
  };

  useEffect(refresh, []);

  // In-app Paystack popup (not a new-tab hosted-checkout redirect) so we get
  // an onSuccess callback to verify against - a new-tab redirect leaves this
  // app with no way to learn the outcome besides Paystack's webhook, which is
  // exactly the gap that leaves a paid enrollment stuck showing "Pending".
  const completePayment = async (payment: Payment) => {
    setPayingId(payment.id);
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction(payment.accessCode, {
      onSuccess: async () => {
        await VerifyPaymentAction(payment.reference);
        ToastSuccess("Payment successful");
        setPayingId(null);
        refresh();
      },
      onCancel: () => {
        setPayingId(null);
      },
      onError: (err) => {
        ToastError(err?.message || "Payment failed. Please try again.");
        setPayingId(null);
      },
    });
  };

  // For a payment that actually went through on Paystack's side but is
  // still stuck PENDING here (missed/delayed webhook) - re-checks directly
  // with Paystack without reopening a checkout for an already-paid charge.
  const checkStatus = async (payment: Payment) => {
    setPayingId(payment.id);
    const [res] = await VerifyPaymentAction(payment.reference);
    if (res?.data?.status === PaymentStatus.COMPLETED) {
      ToastSuccess("Payment confirmed");
    } else {
      ToastError("Still not confirmed as paid - if you already paid, please contact support.");
    }
    setPayingId(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments &amp; Invoices</h1>
        <p className="text-gray-500 text-sm">
          {variant === "parent"
            ? "A record of every payment made for your children's enrollments."
            : "A record of every payment made for your enrollments."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-gray-500 py-4">Loading payments...</p>}
          {error && !isLoading && <p className="text-sm text-red-600 py-4">Failed to load payments: {error}</p>}

          {!isLoading && !error && payments.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <CreditCard className="w-10 h-10 mx-auto text-gray-400" />
              <p className="text-sm text-gray-500">No payments yet.</p>
            </div>
          )}

          {!isLoading && !error && payments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  {variant === "parent" && <TableHead>Child</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="max-w-xs truncate">{payment.description || "-"}</TableCell>
                    {variant === "parent" && <TableCell>{payment.student?.fullName ?? "-"}</TableCell>}
                    <TableCell className="whitespace-nowrap">
                      {payment.currency} {payment.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLES[payment.status]}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === PaymentStatus.PENDING && payment.accessCode && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={payingId === payment.id}
                            onClick={() => checkStatus(payment)}
                            title="If you already paid, check whether it's gone through"
                          >
                            Already paid?
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={payingId === payment.id}
                            onClick={() => completePayment(payment)}
                          >
                            {payingId === payment.id ? "Processing..." : "Complete Payment"}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
