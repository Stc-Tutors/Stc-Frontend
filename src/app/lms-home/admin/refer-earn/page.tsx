"use client";

import ReferAndEarn from "@/components/referral/ReferAndEarn";
import AdminReferralWithdrawals from "@/components/referral/AdminReferralWithdrawals";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

export default function AdminReferAndEarnPage() {
  const { hasPermission } = useUser();
  const canManageReferralSettings = hasPermission(AdminPermission.MANAGE_REFERRAL_SETTINGS);

  return (
    <div className="space-y-6">
      {canManageReferralSettings && <AdminReferralWithdrawals />}
      <ReferAndEarn />
    </div>
  );
}
