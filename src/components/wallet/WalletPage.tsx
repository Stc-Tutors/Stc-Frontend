"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Wallet as WalletIcon, PlusCircle, History } from "lucide-react";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetMyWalletOverviewAction, TopUpWalletAction, type WalletOverview } from "@/server/wallet";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { VerifyPaymentAction } from "@/server/payment";
import { WALLET_TRANSACTION_REASON_LABELS, WalletTransactionType } from "@/types/wallet";

// How long to keep asking Paystack whether a payment that hasn't settled yet
// (bank transfer / USSD confirm after the popup closes) has gone through.
const CONFIRM_ATTEMPTS = 8;
const CONFIRM_INTERVAL_MS = 3000;

export default function WalletPage() {
  // Cached: reopening the page shows the last known balance instantly and
  // refreshes behind it, and it refetches by itself the moment the server
  // reports a wallet change (the `wallet` invalidation from RealtimeSync -
  // sent when Paystack's webhook lands) instead of waiting for a manual reload.
  const { data, error, isLoading, refresh } = useCachedQuery<WalletOverview>(
    "wallet",
    async () => (await unwrap(GetMyWalletOverviewAction())) ?? { balances: [], transactions: [] },
    { ttl: 20_000, tags: ["wallet"] }
  );
  const balances = data?.balances ?? [];
  const transactions = data?.transactions ?? [];
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (error) ToastError(`Couldn't load your wallet: ${error.message}`);
  }, [error]);

  const primaryBalance = balances[0];

  // Paystack's own popup reporting success isn't the same as the wallet having
  // been credited: the server confirms with Paystack and only then credits. That
  // answer is what decides what the person is told (previously "topped up
  // successfully" was announced unconditionally and whatever verify returned was
  // ignored, so a payment still settling looked like a top-up that never arrived).
  const confirmTopUp = async (reference: string) => {
    setConfirming(true);
    try {
      for (let attempt = 0; attempt < CONFIRM_ATTEMPTS && mounted.current; attempt++) {
        const [res] = await VerifyPaymentAction(reference);
        if (res?.data?.status === "COMPLETED") {
          await refresh();
          ToastSuccess("Wallet topped up successfully");
          return;
        }
        if (res?.data?.status === "FAILED") {
          ToastError("That payment didn't go through, so nothing was added to your wallet.");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, CONFIRM_INTERVAL_MS));
      }
      // Still unconfirmed - it may yet settle. The server pushes an update to
      // this page when it does, so say that instead of implying a failure.
      ToastSuccess("Payment received - your balance will update here as soon as it's confirmed.");
    } finally {
      if (mounted.current) setConfirming(false);
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      ToastError("Enter a valid top-up amount");
      return;
    }
    setIsToppingUp(true);
    try {
      const [res, error] = await TopUpWalletAction(amount, primaryBalance?.currency ?? "NGN");
      if (error || !res?.data) {
        ToastError(error || "Couldn't start the top-up");
        return;
      }
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();
      popup.resumeTransaction(res.data.access_code, {
        onSuccess: () => {
          setTopUpAmount("");
          void confirmTopUp(res.data!.reference);
        },
        onCancel: () => {
          ToastError("Top-up was not completed.");
        },
        onError: (error) => {
          ToastError(error?.message || "Top-up failed. Please try again.");
        },
      });
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-gray-500">
          Credit from missed-class refunds and top-ups, spendable toward any future payment.
        </p>
        {confirming && (
          <p role="status" className="mt-2 text-sm text-blue-600">
            Confirming your payment...
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card className="flex items-center p-4 gap-4">
            <p className="text-sm text-gray-500">Loading...</p>
          </Card>
        ) : balances.length === 0 ? (
          <StatCard title="Wallet Balance" value={formatMoney(0, "NGN")} />
        ) : (
          balances.map((b) => (
            <StatCard key={b.currency} title={`${b.currency} Balance`} value={formatMoney(b.balance, b.currency)} />
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Top up your wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <Input
              type="number"
              min={1}
              placeholder="Amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!topUpAmount || isToppingUp}>{isToppingUp ? "Starting..." : "Top up"}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm wallet top-up</AlertDialogTitle>
                  <AlertDialogDescription>
                    You&apos;ll be taken to Paystack to add{" "}
                    {formatMoney(Number(topUpAmount) || 0, primaryBalance?.currency ?? "NGN")} to your wallet
                    balance.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTopUp}>Continue to payment</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500 py-4">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No wallet activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b text-sm">
                      <td className="py-2 px-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">{t.description || WALLET_TRANSACTION_REASON_LABELS[t.reason]}</td>
                      <td
                        className={`py-2 px-4 font-medium ${
                          t.type === WalletTransactionType.CREDIT ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {t.type === WalletTransactionType.CREDIT ? "+" : "-"}
                        {formatMoney(t.amount, t.currency)}
                      </td>
                      <td className="py-2 px-4">{formatMoney(t.balanceAfter, t.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="flex items-center p-4 gap-4">
      <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
        <WalletIcon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </Card>
  );
}
