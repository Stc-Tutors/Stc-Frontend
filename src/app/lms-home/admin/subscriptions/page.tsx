"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetAllSubscriptionsAction, PauseSubscriptionAction, ResumeSubscriptionAction } from "@/server/subscription";
import { Subscription, SubscriptionStatus, SubscriptionUser } from "@/types/subscription";
import { PricingPlan } from "@/types/pricing-plan";

const CONSEQUENCES = ["LMS Access Paused", "Student Portal Readonly", "Course Enrollment Restricted"];

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [target, setTarget] = useState<Subscription | null>(null);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetAllSubscriptionsAction();
    setSubscriptions(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirm = async () => {
    if (!target) return;
    setIsSaving(true);
    if (target.status === SubscriptionStatus.PAUSED) {
      const [, error] = await ResumeSubscriptionAction(target.id);
      setMessage(error || "Subscription reactivated");
    } else {
      const [, error] = await PauseSubscriptionAction(target.id, reason || "Paused by admin");
      setMessage(error || "Subscription paused");
    }
    setIsSaving(false);
    setTarget(null);
    setReason("");
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : subscriptions.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No subscriptions yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Renews</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((s) => {
              const user = s.user as SubscriptionUser;
              const plan = s.plan as PricingPlan;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    {typeof s.user === "string"
                      ? s.user
                      : user.email
                        ? `${user.firstName} ${user.lastName} (${user.email})`
                        : `${user.firstName} ${user.lastName}`}
                  </TableCell>
                  <TableCell>{typeof s.plan === "string" ? s.plan : plan.name}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${s.status === SubscriptionStatus.PAUSED ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setTarget(s)}>
                      {s.status === SubscriptionStatus.PAUSED ? "Reactivate" : "Manage"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Management</DialogTitle>
          </DialogHeader>

          {target && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={typeof target.user === "string" ? undefined : (target.user as SubscriptionUser).email}
                    alt={typeof target.user === "string" ? target.user : (target.user as SubscriptionUser).firstName}
                  />
                  <AvatarFallback>
                    {typeof target.user === "string" ? "?" : (target.user as SubscriptionUser).firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {typeof target.user === "string" ? target.user : `${(target.user as SubscriptionUser).firstName} ${(target.user as SubscriptionUser).lastName}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Current status: <span className="font-medium">{target.status}</span>
                  </p>
                </div>
              </div>

              {target.status === SubscriptionStatus.PAUSED ? (
                <p className="text-sm text-gray-600">
                  This subscription is currently paused{target.pausedReason ? `: "${target.pausedReason}"` : ""}.
                  Reactivating will restore access.
                </p>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for pause</label>
                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Describe why this subscription is being paused" />
                  </div>
                  <div className="space-y-1">
                    {CONSEQUENCES.map((c) => (
                      <div key={c} className="flex items-center gap-2 text-xs text-gray-600">
                        <Check className="w-3 h-3 text-amber-500" /> {c}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? "Saving..." : target?.status === SubscriptionStatus.PAUSED ? "Confirm & Activate" : "Confirm Pause"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
