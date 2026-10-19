"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApproveTutorChangeRequestAction } from "@/server/admin-review";
import { ListTutorAllocationsAction } from "@/server/tutor-allocation";
import { GetTutorsForChangeAction } from "@/server/admin-review";
import { TutorChangeRequest } from "@/types/tutor-change-request";
import { TutorAllocation } from "@/types/tutor-allocation";
import { User, UserRole } from "@/types/user";
import { isSubjectAllocatedToTutor } from "@/lib/tutor-allocation";

interface Props {
  request: TutorChangeRequest | null;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
}

// Same eligibility rule as ReassignTutorDialog (isSubjectAllocatedToTutor) so
// an admin can never pick a tutor the backend would reject - approving here
// delegates to the same AllocationHubService.reassignTutor mechanism.
export default function ApproveTutorChangeDialog({ request, onOpenChange, onApproved }: Props) {
  const [tutors, setTutors] = useState<User[]>([]);
  const [allocationsByTutor, setAllocationsByTutor] = useState<Map<string, TutorAllocation>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedTutorId("");
    if (!request) return;
    setIsLoading(true);
    Promise.all([GetTutorsForChangeAction(), ListTutorAllocationsAction()]).then(
      ([[usersRes], [allocationsRes]]) => {
        setTutors(usersRes?.data ?? []);
        setAllocationsByTutor(new Map((allocationsRes?.data ?? []).map((a) => [a.tutor, a])));
        setIsLoading(false);
      }
    );
  }, [request]);

  if (!request) return null;

  const currentTutorId = request.currentTutor?.id;
  const eligibleTutors = tutors.filter(
    (t) => t.id !== currentTutorId && isSubjectAllocatedToTutor(allocationsByTutor.get(t.id) ?? null, request)
  );

  const handleApprove = async () => {
    if (!selectedTutorId) return;
    setIsSubmitting(true);
    const [res, error] = await ApproveTutorChangeRequestAction(request.id, selectedTutorId);
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(res?.message || "Tutor changed");
    onApproved();
  };

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Approve — {(request.student?.fullName ?? "Removed student")} · {request.subject}
          </DialogTitle>
          <DialogDescription>
            Pick the tutor already allocated to teach this subject to switch this family to. Reason given:{" "}
            &quot;{request.reason}&quot;
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading eligible tutors...</p>
        ) : eligibleTutors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No other tutor is currently allocated to teach &quot;{request.subject}&quot; - allocate one first from
            Tutor Allocation.
          </p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {eligibleTutors.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTutorId(t.id)}
                className={`w-full text-left border rounded-md px-3 py-2 text-sm ${
                  selectedTutorId === t.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {t.firstName} {t.lastName}
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={!selectedTutorId || isSubmitting}>
            {isSubmitting ? "Approving..." : "Confirm approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
