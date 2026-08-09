"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  ListAllReferralWithdrawalsAction,
  ApproveReferralWithdrawalAction,
  RejectReferralWithdrawalAction,
  GetReferralSettingsAction,
  UpdateReferralSettingsAction,
} from "@/server/referral";
import { ReferralPayoutRequest, ReferralPayoutRequestStatus, ReferralSettings } from "@/types/referral";

const STATUS_COLORS: Record<ReferralPayoutRequestStatus, string> = {
  [ReferralPayoutRequestStatus.PENDING]: "text-orange-500",
  [ReferralPayoutRequestStatus.PROCESSING]: "text-blue-500",
  [ReferralPayoutRequestStatus.PAID]: "text-green-600",
  [ReferralPayoutRequestStatus.REJECTED]: "text-red-500",
  [ReferralPayoutRequestStatus.FAILED]: "text-red-500",
};

const userLabel = (u: ReferralPayoutRequest["user"]) =>
  typeof u === "string" ? u : `${u.firstName} ${u.lastName}${u.email ? ` (${u.email})` : ""}`;

// Admin-only referral commission settings + withdrawal approval queue - both
// gated by AdminPermission.MANAGE_REFERRAL_SETTINGS by the parent page.
export default function AdminReferralWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<ReferralPayoutRequest[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [percentage, setPercentage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [withdrawalsRes] = await ListAllReferralWithdrawalsAction();
    setWithdrawals(withdrawalsRes?.data ?? []);
    const [settingsRes] = await GetReferralSettingsAction();
    setSettings(settingsRes?.data ?? null);
    if (settingsRes?.data) setPercentage(String(settingsRes.data.percentage));
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveReferralWithdrawalAction(id);
    if (error) ToastError(error);
    else ToastSuccess("Withdrawal approved");
    load();
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      ToastError("Enter a rejection reason");
      return;
    }
    const [, error] = await RejectReferralWithdrawalAction(id, rejectReason.trim());
    if (error) ToastError(error);
    else ToastSuccess("Withdrawal rejected");
    setRejectingId(null);
    setRejectReason("");
    load();
  };

  const handleSaveSettings = async () => {
    const value = Number(percentage);
    if (!percentage || Number.isNaN(value) || value < 0 || value > 100) {
      ToastError("Enter a valid percentage between 0 and 100");
      return;
    }
    setIsSavingSettings(true);
    const [, error] = await UpdateReferralSettingsAction(value);
    setIsSavingSettings(false);
    if (error) ToastError(error);
    else {
      ToastSuccess("Referral commission percentage updated");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral Commission Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Commission percentage</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
            {isSavingSettings ? "Saving..." : "Save"}
          </Button>
          {settings?.updatedAt && (
            <p className="text-xs text-gray-400 mb-2">
              Last updated {new Date(settings.updatedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500 py-4">Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No referral withdrawal requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{userLabel(w.user)}</TableCell>
                    <TableCell>₦{w.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className={`font-medium ${STATUS_COLORS[w.status]}`}>{w.status}</TableCell>
                    <TableCell className="text-right">
                      {w.status === ReferralPayoutRequestStatus.PENDING ? (
                        rejectingId === w.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Input
                              placeholder="Rejection reason"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="h-8 text-xs w-48"
                            />
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleReject(w.id)}>
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => handleApprove(w.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRejectingId(w.id)}>
                              Reject
                            </Button>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">
                          {w.rejectionReason ? `Reason: ${w.rejectionReason}` : "—"}
                        </span>
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
