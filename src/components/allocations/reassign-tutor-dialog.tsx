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
import { ReassignSubjectTutorAction } from "@/server/allocation-hub";
import { ListTutorAllocationsAction } from "@/server/tutor-allocation";
import { GetUsersAction } from "@/server/admin";
import { SubjectEnrollment } from "@/types/allocation-hub";
import { TutorAllocation } from "@/types/tutor-allocation";
import { User, UserRole } from "@/types/user";
import { isSubjectAllocatedToTutor } from "@/lib/tutor-allocation";

interface Props {
  enrollment: SubjectEnrollment | null;
  onOpenChange: (open: boolean) => void;
  onReassigned: () => void;
}

// Subject-first "move this student to a different tutor" - the counterpart
// to UnassignedQueueDetailDialog's initial assignment, for an enrollment
// that already has one. Eligible tutors come from TutorAllocation only, the
// same rule the backend enforces (isSubjectAllocatedToTutor) - no Course is
// ever picked or shown here.
export default function ReassignTutorDialog({ enrollment, onOpenChange, onReassigned }: Props) {
  const [tutors, setTutors] = useState<User[]>([]);
  const [allocationsByTutor, setAllocationsByTutor] = useState<Map<string, TutorAllocation>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedTutorId("");
    if (!enrollment) return;
    setIsLoading(true);
    Promise.all([GetUsersAction({ role: UserRole.TUTOR, limit: 1000 }), ListTutorAllocationsAction()]).then(
      ([[usersRes], [allocationsRes]]) => {
        setTutors(usersRes?.data ?? []);
        setAllocationsByTutor(new Map((allocationsRes?.data ?? []).map((a) => [a.tutor, a])));
        setIsLoading(false);
      }
    );
  }, [enrollment]);

  if (!enrollment) return null;

  const currentCourseEnrollment = typeof enrollment.courseEnrollment === "object" ? enrollment.courseEnrollment : undefined;
  const currentCourse = currentCourseEnrollment && typeof currentCourseEnrollment.course === "object" ? currentCourseEnrollment.course : undefined;
  const currentTutorId = currentCourse ? (typeof currentCourse.tutor === "string" ? currentCourse.tutor : currentCourse.tutor?.id) : undefined;

  const eligibleTutors = tutors.filter(
    (t) => t.id !== currentTutorId && isSubjectAllocatedToTutor(allocationsByTutor.get(t.id) ?? null, enrollment)
  );

  const handleReassign = async () => {
    if (!selectedTutorId) return;
    setIsSubmitting(true);
    const [res, error] = await ReassignSubjectTutorAction(enrollment.id, selectedTutorId);
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(res?.message || "Tutor reassigned");
    onReassigned();
  };

  return (
    <Dialog open={!!enrollment} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Reassign {enrollment.student.fullName} — {enrollment.subject}
          </DialogTitle>
          <DialogDescription>
            Pick a different tutor already allocated to teach this subject. Blocked only by a real schedule clash -
            not by capacity or anything else.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading eligible tutors...</p>
        ) : eligibleTutors.length === 0 ? (
          <p className="text-sm text-gray-500">
            No other tutor is currently allocated to teach &quot;{enrollment.subject}&quot;.
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
          <Button onClick={handleReassign} disabled={!selectedTutorId || isSubmitting}>
            {isSubmitting ? "Reassigning..." : "Confirm reassignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
