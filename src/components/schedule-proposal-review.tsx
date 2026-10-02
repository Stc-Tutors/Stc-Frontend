"use client";

import { useEffect, useState } from "react";
import InlineLoader from "@/components/shared/InlineLoader";
import { useParams, useRouter } from "next/navigation";
import { ConfirmScheduleProposalAction, GetScheduleProposalAction, RejectScheduleProposalAction } from "@/server/schedule-proposal";
import { ScheduleProposal, ScheduleProposalStatus } from "@/types/schedule-proposal";

// A parent or a self-registered student accepting (or declining) a class schedule an admin put together. Accepting makes it the
// student's schedule and moves any upcoming classes onto it; declining leaves everything as it was and tells the admin.
export default function ScheduleProposalReview({ area }: { area: "parent" | "student" }) {
  const { id } = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<ScheduleProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [res, err] = await GetScheduleProposalAction(id as string);
      setProposal(res?.data ?? null);
      setError(err);
      setIsLoading(false);
    })();
  }, [id]);

  const handleConfirm = async () => {
    setIsSaving(true);
    const [, err] = await ConfirmScheduleProposalAction(id as string);
    setIsSaving(false);
    if (err) {
      setError(err);
      return;
    }
    router.push(`/lms-home/${area}/scheduling`);
  };

  const handleReject = async () => {
    setIsSaving(true);
    const [, err] = await RejectScheduleProposalAction(id as string, `Declined by the ${area === "parent" ? "parent" : "student"}`);
    setIsSaving(false);
    if (err) {
      setError(err);
      return;
    }
    router.push(`/lms-home/${area}/scheduling`);
  };

  if (isLoading) return <InlineLoader />;
  if (error || !proposal) return <p className="text-sm text-red-600">{error || "Proposal not found"}</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold">Proposed class schedule</h1>
      <p className="text-sm text-gray-600">
        An admin proposed the following schedule. If you accept it, it becomes the class schedule and any upcoming classes with a
        tutor are moved to these days and times. If you decline, nothing changes.
      </p>

      <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
        {proposal.proposedSchedule.map((slot, i) => (
          <div key={i} className="text-sm border-b last:border-0 py-2">
            <p className="font-medium">{slot.subject}</p>
            <p className="text-gray-600">
              {slot.days.join(", ")} at {slot.time} ({slot.duration} minutes)
            </p>
          </div>
        ))}
      </div>

      {proposal.status !== ScheduleProposalStatus.PENDING ? (
        <p className="text-sm text-gray-500">This proposal has already been {proposal.status.toLowerCase()}.</p>
      ) : (
        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={isSaving} className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? "Saving..." : "Accept"}
          </button>
          <button onClick={handleReject} disabled={isSaving} className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
