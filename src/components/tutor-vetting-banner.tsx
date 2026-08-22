"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { GetMyTutorApplicationAction } from "@/server/tutor-application";
import { TutorApplicationStatus } from "@/types/tutor-application";

// Mirrors tutor-profile-incomplete-banner.tsx's pattern - shown whenever the
// tutor's application is APPROVED_PENDING_VETTING (approved, can log in, but
// hasn't confirmed the post-approval Vetting Questionnaire yet). Stronger
// styling than the profile-incomplete banner since this one actually blocks
// student allocation, not just profile visibility.
export default function TutorVettingBanner() {
  const [pendingVetting, setPendingVetting] = useState(false);

  useEffect(() => {
    (async () => {
      const [res] = await GetMyTutorApplicationAction();
      setPendingVetting(res?.data?.status === TutorApplicationStatus.APPROVED_PENDING_VETTING);
    })();
  }, []);

  if (!pendingVetting) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800 text-sm">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Your application is approved, but not yet confirmed.{" "}
        <Link href="/lms-home/tutor/vetting" className="underline font-medium">
          Complete the Vetting Questionnaire
        </Link>{" "}
        to confirm your approval - you won&apos;t be matched with students until you do.
      </span>
    </div>
  );
}
