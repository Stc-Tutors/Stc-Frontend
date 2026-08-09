"use client";

import { useEffect, useState } from "react";
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
import { Copy, Gift, Wallet, Clock, PiggyBank } from "lucide-react";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  GetMyReferralLinkAction,
  GetMyReferralBalanceAction,
  GetMyReferralEarningsAction,
  GetMyReferralProfileAction,
  GetMyReferralWithdrawalsAction,
  GetReferralSettingsAction,
  ListReferralBanksAction,
  SetReferralBankDetailsAction,
  RequestReferralWithdrawalAction,
} from "@/server/referral";
import {
  ReferralBalance,
  ReferralBank,
  ReferralEarning,
  ReferralPayoutProfile,
  ReferralPayoutRequest,
  ReferralPayoutRequestStatus,
  ReferralSettings,
} from "@/types/referral";

const STATUS_COLORS: Record<ReferralPayoutRequestStatus, string> = {
  [ReferralPayoutRequestStatus.PENDING]: "text-orange-500",
  [ReferralPayoutRequestStatus.PROCESSING]: "text-blue-500",
  [ReferralPayoutRequestStatus.PAID]: "text-green-600",
  [ReferralPayoutRequestStatus.REJECTED]: "text-red-500",
  [ReferralPayoutRequestStatus.FAILED]: "text-red-500",
};

export default function ReferAndEarn() {
  const [link, setLink] = useState("");
  const [balance, setBalance] = useState<ReferralBalance | null>(null);
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [withdrawals, setWithdrawals] = useState<ReferralPayoutRequest[]>([]);
  const [profile, setProfile] = useState<ReferralPayoutProfile | null>(null);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [banks, setBanks] = useState<ReferralBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const load = async () => {
    const [linkRes] = await GetMyReferralLinkAction();
    const [balanceRes] = await GetMyReferralBalanceAction();
    const [earningsRes] = await GetMyReferralEarningsAction();
    const [withdrawalsRes] = await GetMyReferralWithdrawalsAction();
    const [profileRes] = await GetMyReferralProfileAction();
    const [settingsRes] = await GetReferralSettingsAction();
    setLink(linkRes?.data?.link ?? "");
    setBalance(balanceRes?.data ?? null);
    setEarnings(earningsRes?.data ?? []);
    setWithdrawals(withdrawalsRes?.data ?? []);
    setProfile(profileRes?.data ?? null);
    setSettings(settingsRes?.data ?? null);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    ListReferralBanksAction().then(([res]) => setBanks(res?.data ?? []));
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(link);
    ToastSuccess("Referral link copied to clipboard");
  };

  const handleSaveBankDetails = async () => {
    const bank = banks.find((b) => b.code === bankCode);
    if (!bank || !accountNumber) {
      ToastError("Select a bank and enter your account number");
      return;
    }
    setIsSaving(true);
    const [, error] = await SetReferralBankDetailsAction({
      bankName: bank.name,
      bankCode: bank.code,
      accountNumber,
    });
    setIsSaving(false);
    if (error) ToastError(error);
    else {
      ToastSuccess("Bank details saved successfully");
      load();
    }
  };

  const handleRequestWithdrawal = async () => {
    setIsRequesting(true);
    const [, error] = await RequestReferralWithdrawalAction();
    setIsRequesting(false);
    if (error) ToastError(error);
    else {
      ToastSuccess("Withdrawal requested successfully - awaiting Super Admin approval");
      load();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-sm text-gray-500">
          Share your link - earn {settings?.percentage ?? "—"}% of every referral&apos;s first payment.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Available Balance"
          value={`₦${(balance?.pendingBalance ?? 0).toLocaleString()}`}
          icon={PiggyBank}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Awaiting Withdrawal Review"
          value={`₦${(balance?.lockedBalance ?? 0).toLocaleString()}`}
          icon={Clock}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Withdrawn"
          value={`₦${(balance?.withdrawnTotal ?? 0).toLocaleString()}`}
          icon={Wallet}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral link */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" /> Your referral link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input readOnly value={link} className="flex-1" />
              <Button onClick={handleCopyLink} disabled={!link}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Anyone who signs up with this link and completes their first payment earns you{" "}
              {settings?.percentage ?? "—"}% of that payment, credited to your available balance below.
            </p>
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <>
                {profile?.accountNumber ? (
                  <div className="border rounded-lg p-3">
                    <p className="font-medium">{profile.bankName}</p>
                    <p className="text-sm text-gray-500">
                      {profile.accountName} · {profile.accountNumber}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Add your bank details to receive withdrawals.</p>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                    >
                      <option value="">Select bank</option>
                      {banks.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                    <Button size="sm" onClick={handleSaveBankDetails} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save bank details"}
                    </Button>
                  </div>
                )}

                <p className="text-lg font-bold">₦{(balance?.pendingBalance ?? 0).toLocaleString()}</p>
                <p className="text-sm font-light">Available to withdraw</p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
                      disabled={
                        isRequesting ||
                        !profile?.paystackRecipientCode ||
                        !balance?.pendingBalance ||
                        balance.hasPendingRequest
                      }
                    >
                      {balance?.hasPendingRequest ? "Request pending review" : isRequesting ? "Requesting..." : "Request Withdrawal"}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm withdrawal request</AlertDialogTitle>
                      <AlertDialogDescription>
                        This submits your available referral balance{profile?.bankName ? ` to ${profile.bankName} · ${profile.accountNumber}` : ""} to
                        the Super Admin&apos;s Finance Approval queue. Funds are transferred once approved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRequestWithdrawal}>Confirm request</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings history */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500 py-4">Loading...</p>
          ) : earnings.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No referral earnings yet - share your link to start earning.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Rate</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.id} className="border-b text-sm">
                      <td className="py-2 px-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">₦{e.amount.toLocaleString()}</td>
                      <td className="py-2 px-4">{e.percentage}%</td>
                      <td className="py-2 px-4">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal history */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500 py-4">Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No withdrawal requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-2 px-4">Requested</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Paid</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b text-sm">
                      <td className="py-2 px-4">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4">₦{w.amount.toLocaleString()}</td>
                      <td className="py-2 px-4">{w.paidAt ? new Date(w.paidAt).toLocaleDateString() : "—"}</td>
                      <td className={`py-2 px-4 font-medium ${STATUS_COLORS[w.status]}`}>{w.status}</td>
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

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="flex items-center p-4 gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </Card>
  );
}
