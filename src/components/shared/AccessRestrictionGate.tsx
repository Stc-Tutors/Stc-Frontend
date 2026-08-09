"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import Image from "next/image";
import { GetMyRestrictionsAction } from "@/server/subscription";
import { SubscriptionRestrictions } from "@/types/subscription";

// Real enforcement for the admin "Subscription Management" pause modal:
// blocks the entire LMS UI for this role when a relevant subscription
// (the account's own, or - for a STUDENT - whichever parent account pays)
// is paused with the matching restriction flag. Checked client-side on every
// layout mount; every data-fetching action underneath still requires a valid
// JWT, so this is a real UX block, not just a suggestion, though it isn't a
// substitute for server-side gating of individual endpoints.
export default function AccessRestrictionGate({
  role,
  children,
}: {
  role: "STUDENT" | "PARENT";
  children: React.ReactNode;
}) {
  const [restrictions, setRestrictions] = useState<SubscriptionRestrictions | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    GetMyRestrictionsAction().then(([res]) => {
      setRestrictions(res?.data ?? null);
      setIsChecking(false);
    });
  }, []);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="size-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const blocked = restrictions?.lmsAccessPaused || (role === "STUDENT" && restrictions?.studentPortalRestricted);

  if (blocked) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 px-6 text-center">
        <Image src="/image/logo_black.png" alt="STC Logo" width={120} height={40} className="object-contain mb-8" />
        <div className="bg-white rounded-2xl shadow p-8 max-w-md space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Lock className="size-6" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Access Paused</h1>
          <p className="text-sm text-gray-600">
            {role === "STUDENT" && restrictions?.studentPortalRestricted && !restrictions?.lmsAccessPaused
              ? "Your student portal access has been restricted by an administrator."
              : "Access to the platform has been paused by an administrator."}
            {restrictions?.reason ? ` Reason: ${restrictions.reason}` : ""}
          </p>
          <p className="text-xs text-gray-400">Please contact support or your account admin to resolve this.</p>
          <a
            href="/api/auth/logout"
            className="inline-block bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Logout
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
