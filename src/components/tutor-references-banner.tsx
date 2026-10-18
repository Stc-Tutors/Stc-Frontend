"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { GetMyTutorApplicationAction } from "@/server/tutor-application";
import { pendingReferences, referenceDaysLeft } from "@/lib/tutor-references";

// Shown to an approved tutor whose referees haven't all replied yet: how long is left before the dashboard locks.
export default function TutorReferencesBanner() {
  const pathname = usePathname();
  const [state, setState] = useState<{ days: number; names: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [res] = await GetMyTutorApplicationAction();
      const pending = pendingReferences(res?.data);
      const days = referenceDaysLeft(res?.data);
      setState(pending.length > 0 && days !== null && days >= 0 ? { days, names: pending.map((p) => p.name).join(" and ") } : null);
    })();
  }, [pathname]);

  if (!state || pathname.startsWith("/lms-home/tutor/references")) return null;

  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {state.names} {state.names.includes(" and ") ? "haven't" : "hasn't"} sent a reference yet. It must be in within{" "}
        <strong>
          {state.days <= 0 ? "today" : `${state.days} day${state.days === 1 ? "" : "s"}`}
        </strong>{" "}
        or your dashboard will be locked.{" "}
        <Link href="/lms-home/tutor/references" className="font-medium underline">
          Check your references
        </Link>
      </span>
    </div>
  );
}
