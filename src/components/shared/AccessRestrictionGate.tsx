"use client";

import { useEffect, useState } from "react";
import { Lock, WifiOff } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import LogoutButton from "@/components/shared/LogoutButton";
import { useUser } from "@/contexts/user-context";

// After this long without an answer the gate stops waiting and lets the page
// render. The restrictions come from the same request as the session, so this is
// only ever reached on a very slow or stalled connection - and a blank spinner
// forever is worse than showing the app: the server still rejects anything an
// account isn't allowed to do.
const GIVE_UP_WAITING_MS = 4000;

// Real enforcement for the admin "Subscription Management" pause modal:
// blocks the entire LMS UI for this role when a relevant subscription
// (the account's own, or - for a STUDENT - whichever parent account pays)
// is paused with the matching restriction flag. The restrictions arrive with the
// session in a single request (see SessionBootstrap); every data-fetching action
// underneath still requires a valid JWT, so this is a real UX block, not just a
// suggestion, though it isn't a substitute for server-side gating of individual
// endpoints.
//
// It used to make its own request and render nothing but a spinner until that
// one resolved, with no failure handling - so on a phone, a slow or dropped
// request left the whole dashboard permanently blank behind a spinner.
export default function AccessRestrictionGate({
  role,
  children,
}: {
  role: "STUDENT" | "PARENT";
  children: React.ReactNode;
}) {
  const { user, isLoading, restrictions, sessionError, retrySession } = useUser();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setGaveUp(true), GIVE_UP_WAITING_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Nothing cached and the session request failed (offline, API waking up):
  // say so and offer a retry instead of showing an empty page.
  if (!user && sessionError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-100 px-6 text-center">
        <BrandLogo width={120} height={40} className="object-contain mb-8" />
        <div className="bg-white rounded-2xl shadow p-8 max-w-md space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <WifiOff className="size-6" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Can&apos;t reach the server</h1>
          <p className="text-sm text-gray-600">Check your connection - we&apos;ll keep trying. You can also try again now.</p>
          <button
            type="button"
            onClick={retrySession}
            className="inline-block bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !gaveUp) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-100" role="status" aria-label="Loading">
        <div className="size-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const blocked = restrictions?.lmsAccessPaused || (role === "STUDENT" && restrictions?.studentPortalRestricted);

  if (blocked) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-100 px-6 text-center">
        <BrandLogo width={120} height={40} className="object-contain mb-8" />
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
          <LogoutButton className="inline-block bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800">
            Logout
          </LogoutButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
