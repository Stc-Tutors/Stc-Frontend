"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GetMyScheduleProposalsAction } from "@/server/schedule-proposal";
import { ScheduleProposal } from "@/types/schedule-proposal";

// Class schedules an admin has proposed that are waiting for this family to accept or decline.
export default function ScheduleProposalsBanner({ area }: { area: "parent" | "student" }) {
  const [proposals, setProposals] = useState<ScheduleProposal[]>([]);

  useEffect(() => {
    GetMyScheduleProposalsAction().then(([res]) => setProposals(res?.data ?? []));
  }, []);

  if (proposals.length === 0) return null;
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
      <h3 className="font-semibold text-gray-800 mb-1">A new class schedule is waiting for your answer</h3>
      <ul className="space-y-1">
        {proposals.map((p) => (
          <li key={p.id} className="text-sm text-gray-700 flex items-center justify-between gap-3">
            <span>{p.proposedSchedule.map((s) => `${s.subject}: ${s.days.join(", ")} ${s.time}`).join(" | ")}</span>
            <Link href={`/lms-home/${area}/schedule-proposals/${p.id}`} className="text-blue-600 text-xs font-medium hover:underline shrink-0">
              Review
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
