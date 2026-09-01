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
import { CreditCard, DollarSign, Wallet, TrendingUp, PiggyBank } from "lucide-react";
import RevenueChart from "@/components/tutorDashboard/RevenueCharts";
import {
  GetMyPayoutProfileAction,
  GetMyPayoutRequestsAction,
  ListMyRatesAction,
  ConfirmTutorRateAction,
  RejectTutorRateAction,
  CounterTutorRateAction,
  SetPayoutBankDetailsAction,
  RequestPayoutAction,
  ListPayoutBanksAction,
  GetMyBalanceAction,
} from "@/server/payout";
import { Bank, PayoutRequest, PayoutRequestStatus, RateStatus, TutorBalance, TutorPayoutProfile } from "@/types/payout";
import { TutorRate } from "@/types/tutor-rate";

const STATUS_COLORS: Record<PayoutRequestStatus, string> = {
  [PayoutRequestStatus.PENDING]: "text-orange-500",
  [PayoutRequestStatus.APPROVED]: "text-blue-500",
  [PayoutRequestStatus.PROCESSING]: "text-blue-500",
  [PayoutRequestStatus.PAID]: "text-green-600",
  [PayoutRequestStatus.REJECTED]: "text-red-500",
  [PayoutRequestStatus.FAILED]: "text-red-500",
};

/* ------------------- Dashboard Page ------------------- */
export default function DashboardPage() {
  const [profile, setProfile] = useState<TutorPayoutProfile | null>(null);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [rates, setRates] = useState<TutorRate[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [balance, setBalance] = useState<TutorBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [counterDrafts, setCounterDrafts] = useState<Record<string, string>>({});
  const [withdrawAll, setWithdrawAll] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const load = async () => {
    const [profileRes] = await GetMyPayoutProfileAction();
    const [requestsRes] = await GetMyPayoutRequestsAction();
    const [balanceRes] = await GetMyBalanceAction();
    const [ratesRes] = await ListMyRatesAction();
    setProfile(profileRes?.data ?? null);
    setRequests(requestsRes?.data ?? []);
    setBalance(balanceRes?.data ?? null);
    setRates(ratesRes?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    ListPayoutBanksAction().then(([res]) => setBanks(res?.data ?? []));
  }, []);

  const totalPaid = requests.filter((r) => r.status === PayoutRequestStatus.PAID).reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = requests
    .filter((r) => [PayoutRequestStatus.PENDING, PayoutRequestStatus.APPROVED, PayoutRequestStatus.PROCESSING].includes(r.status))
    .reduce((sum, r) => sum + r.amount, 0);
  const lastPaid = requests.filter((r) => r.status === PayoutRequestStatus.PAID)[0];
  const thisMonthPaid = requests
    .filter(
      (r) =>
        r.status === PayoutRequestStatus.PAID &&
        r.paidAt &&
        new Date(r.paidAt).getMonth() === new Date().getMonth() &&
        new Date(r.paidAt).getFullYear() === new Date().getFullYear()
    )
    .reduce((sum, r) => sum + r.amount, 0);

  // Proposals genuinely awaiting a response from THIS tutor - not just "has a
  // proposed* value set", since confirming/rejecting doesn't clear those
  // fields, only rateStatus flips back to CONFIRMED. proposedBy !== r.tutor
  // additionally excludes the tutor's own counter-offers (those are awaiting
  // the admin, not the tutor).
  const pendingRates = rates.filter((r) => r.rateStatus === RateStatus.PROPOSED && r.proposedBy !== r.tutor);
  // The tutor's own counter-offers, awaiting an admin's response.
  const myCounters = rates.filter((r) => r.rateStatus === RateStatus.PROPOSED && r.proposedBy === r.tutor);
  const hasConfirmedRate = rates.some((r) => r.ratePerHour != null || r.flatRate != null);

  const rateScopeLabel = (r: TutorRate) => {
    const parts = [r.serviceType, r.curriculum, r.subject, r.gradeLevel, r.country].filter(Boolean);
    return parts.length > 0 ? parts.join(" / ") : "Default rate";
  };

  const handleConfirmRate = async (rateId: string) => {
    const [, error] = await ConfirmTutorRateAction(rateId);
    setMessage(error || "Rate confirmed");
    if (!error) load();
  };

  const handleRejectRate = async (rateId: string) => {
    const [, error] = await RejectTutorRateAction(rateId);
    setMessage(error || "Rate rejected");
    if (!error) load();
  };

  const handleCounterRate = async (r: TutorRate) => {
    const value = Number(counterDrafts[r.id]);
    if (!counterDrafts[r.id] || Number.isNaN(value) || value < 0) {
      setMessage("Enter a valid non-negative counter-offer");
      return;
    }
    const isFlat = r.proposedFlatRate != null;
    const [, error] = await CounterTutorRateAction(r.id, isFlat ? { flatRate: value } : { ratePerHour: value });
    setMessage(error || "Counter-offer submitted");
    if (!error) {
      setCounterDrafts((prev) => ({ ...prev, [r.id]: "" }));
      load();
    }
  };

  const handleSaveBankDetails = async () => {
    const bank = banks.find((b) => b.code === bankCode);
    if (!bank || !accountNumber) {
      setMessage("Select a bank and enter your account number");
      return;
    }
    setIsSaving(true);
    const [, error] = await SetPayoutBankDetailsAction({
      bankName: bank.name,
      bankCode: bank.code,
      accountNumber,
    });
    setIsSaving(false);
    setMessage(error || "Bank details saved successfully");
    if (!error) load();
  };

  const handleRequestPayout = async () => {
    setIsRequesting(true);
    const amount = withdrawAll ? undefined : Number(withdrawAmount);
    const [, error] = await RequestPayoutAction(amount);
    setIsRequesting(false);
    setMessage(error || "Payout requested successfully");
    if (!error) {
      setWithdrawAmount("");
      setWithdrawAll(true);
      load();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {message && <p className="text-sm text-blue-600">{message}</p>}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Current Balance"
          value={`${balance?.currency ?? "NGN"} ${(balance?.currentBalance ?? 0).toLocaleString()}`}
          icon={PiggyBank}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard title="Total Paid Out" value={`₦${totalPaid.toLocaleString()}`} icon={DollarSign} color="bg-orange-100 text-orange-600" />
        <StatCard title="Pending Amount" value={`₦${pendingAmount.toLocaleString()}`} icon={Wallet} color="bg-purple-100 text-purple-600" />
        <StatCard
          title="Confirmed Rates"
          value={rates.filter((r) => r.ratePerHour != null || r.flatRate != null).length}
          icon={TrendingUp}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard title="This Month" value={`₦${thisMonthPaid.toLocaleString()}`} icon={CreditCard} color="bg-green-100 text-green-600" />
      </div>
      {balance && balance.hoursSincePaid > 0 && (
        <p className="text-xs text-gray-500">
          Balance reflects {balance.hoursSincePaid.toFixed(1)} unpaid hour(s) since your last payout
          {balance.hasPendingRequest ? " (a payout request is already pending review)." : "."}
        </p>
      )}
      {balance && balance.surchargeDeduction > 0 && (
        <p className="text-xs text-amber-600">
          {balance.currency} {balance.surchargeDeduction.toLocaleString()} deducted from your {balance.currency}{" "}
          {balance.grossBalance.toLocaleString()} gross balance for late-notice reschedule surcharge(s).
        </p>
      )}
      {balance && balance.unpriced.length > 0 && (
        <p className="text-xs text-amber-600">
          {balance.unpriced.length} course(s) have hours excluded from your balance because no rate has been
          confirmed for them yet - contact an admin to have them priced.
        </p>
      )}

      {/* Chart + Withdraw Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2">
          <RevenueChart />
        </div>

        {/* Withdraw */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : (
              <>
                {pendingRates.length > 0 && (
                  <div className="border rounded-lg p-3 space-y-3">
                    {pendingRates.map((r) => (
                      <div key={r.id} className="space-y-2 text-sm">
                        <p>
                          {rateScopeLabel(r)}: new rate proposed —{" "}
                          <span className="font-semibold">
                            {r.currency}{" "}
                            {r.proposedFlatRate != null ? `${r.proposedFlatRate} flat` : `${r.proposedRatePerHour}/hr`}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleConfirmRate(r.id)}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectRate(r.id)}>Reject</Button>
                        </div>
                        {r.negotiable && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              placeholder="Your counter-offer"
                              value={counterDrafts[r.id] ?? ""}
                              onChange={(e) => setCounterDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                              className="h-8 max-w-[160px]"
                            />
                            <Button size="sm" variant="outline" onClick={() => handleCounterRate(r)}>
                              Propose different rate
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {myCounters.length > 0 && (
                  <div className="border rounded-lg p-3 space-y-2">
                    {myCounters.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                        <p>
                          {rateScopeLabel(r)}: your counter-offer of{" "}
                          <span className="font-semibold">
                            {r.currency}{" "}
                            {r.proposedFlatRate != null ? `${r.proposedFlatRate} flat` : `${r.proposedRatePerHour}/hr`}
                          </span>{" "}
                          is awaiting admin review
                        </p>
                        <Button size="sm" variant="outline" onClick={() => handleRejectRate(r.id)}>Withdraw</Button>
                      </div>
                    ))}
                  </div>
                )}

                {profile?.accountNumber ? (
                  <div className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{profile.bankName}</p>
                      <p className="text-sm text-gray-500">
                        {profile.accountName} · {profile.accountNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Add your bank details to receive payouts.</p>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                    >
                      <option value="">Select bank</option>
                      {banks.map((b) => (
                        <option key={b.code} value={b.code}>{b.name}</option>
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

                <p className="text-lg font-bold">₦{pendingAmount.toLocaleString()}</p>
                <p className="text-sm font-light">Pending payout requests</p>

                {balance && balance.nextWithdrawalAvailableAt ? (
                  <p className="text-xs text-amber-600">
                    You can request another withdrawal on{" "}
                    {new Date(balance.nextWithdrawalAvailableAt).toLocaleDateString()} - one withdrawal is allowed
                    every 14 days.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={withdrawAll} onChange={() => setWithdrawAll(true)} />
                      Withdraw all ({balance?.currency ?? "NGN"} {(balance?.currentBalance ?? 0).toLocaleString()})
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={!withdrawAll} onChange={() => setWithdrawAll(false)} />
                      Withdraw part of it
                    </label>
                    {!withdrawAll && (
                      <Input
                        type="number"
                        min={0}
                        max={balance?.currentBalance ?? 0}
                        placeholder={`Up to ${balance?.currentBalance ?? 0}`}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    )}
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
                      disabled={
                        isRequesting ||
                        !hasConfirmedRate ||
                        !profile?.paystackRecipientCode ||
                        !!balance?.nextWithdrawalAvailableAt ||
                        (!withdrawAll && (!withdrawAmount || Number(withdrawAmount) <= 0))
                      }
                    >
                      {isRequesting ? "Requesting..." : "Request Payout"}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm withdrawal request</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will submit a payout request for{" "}
                        {withdrawAll
                          ? `your full available balance (${balance?.currency ?? "NGN"} ${(balance?.currentBalance ?? 0).toLocaleString()})`
                          : `${balance?.currency ?? "NGN"} ${withdrawAmount}`}
                        {profile?.bankName ? ` to ${profile.bankName} · ${profile.accountNumber}` : ""}. An admin will need
                        to review and approve it before funds are transferred. You won't be able to request again for
                        14 days after this.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRequestPayout}>Confirm request</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory requests={requests} isLoading={isLoading} lastPaid={lastPaid} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- Reusable Stat Card ------------------- */
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

/* ------------------- Transaction History ------------------- */
function TransactionHistory({
  requests,
  isLoading,
  lastPaid,
}: {
  requests: PayoutRequest[];
  isLoading: boolean;
  lastPaid?: PayoutRequest;
}) {
  if (isLoading) return <p className="text-sm text-gray-500 py-4">Loading payout history...</p>;
  if (requests.length === 0) return <p className="text-sm text-gray-500 py-4">No payout requests yet.</p>;

  return (
    <div className="bg-white rounded-lg overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="py-2 px-4">Period</th>
            <th className="py-2 px-4">Hours</th>
            <th className="py-2 px-4">Amount</th>
            <th className="py-2 px-4">Requested</th>
            <th className="py-2 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b text-sm">
              <td className="py-2 px-4">
                {new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()}
              </td>
              <td className="py-2 px-4">{r.hoursWorked.toFixed(1)}</td>
              <td className="py-2 px-4">₦{r.amount.toLocaleString()}</td>
              <td className="py-2 px-4">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "—"}</td>
              <td className={`py-2 px-4 font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {lastPaid && (
        <p className="text-xs text-gray-400 px-4 py-2">
          Last paid ₦{lastPaid.amount.toLocaleString()} on {lastPaid.paidAt ? new Date(lastPaid.paidAt).toLocaleDateString() : "—"}
        </p>
      )}
    </div>
  );
}
