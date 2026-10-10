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
import { ReassignSubjectTutorAction, SearchEligibleTutorsAction } from "@/server/allocation-hub";
import { SubjectEnrollment } from "@/types/allocation-hub";
import { User } from "@/types/user";

interface Props {
  enrollment: SubjectEnrollment | null;
  onOpenChange: (open: boolean) => void;
  onReassigned: () => void;
}

// Subject-first "move this student to a different tutor" - the counterpart to UnassignedQueueDetailDialog's initial assignment, for an
// enrollment that already has one. Who is eligible is worked out ON THE SERVER (active, approved and vetted, and allocated to this subject -
// including when the allocation was made on a parent category of the subject). This dialog used to guess in the browser from a simplified
// copy of that rule, which left out the category case, so a tutor who really was allocated (Grace Afolabi for Physics) never appeared.
export default function ReassignTutorDialog({ enrollment, onOpenChange, onReassigned }: Props) {
  const [tutors, setTutors] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedTutorId("");
    setSearch("");
  }, [enrollment]);

  useEffect(() => {
    if (!enrollment) return;
    let stale = false;
    setIsLoading(true);
    const timer = setTimeout(async () => {
      const [res, error] = await SearchEligibleTutorsAction(enrollment.id, search.trim() || undefined);
      if (stale) return;
      if (error) toast.error(error);
      setTutors(res?.data ?? []);
      setIsLoading(false);
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [enrollment, search]);

  if (!enrollment) return null;

  const currentCourseEnrollment = typeof enrollment.courseEnrollment === "object" ? enrollment.courseEnrollment : undefined;
  const currentCourse = currentCourseEnrollment && typeof currentCourseEnrollment.course === "object" ? currentCourseEnrollment.course : undefined;
  const currentTutorId = currentCourse ? (typeof currentCourse.tutor === "string" ? currentCourse.tutor : (currentCourse.tutor as { id?: string } | undefined)?.id) : undefined;

  const eligibleTutors = tutors.filter((t) => t.id !== currentTutorId);

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
            Reassign {enrollment.student?.fullName ?? "Removed student"} - {enrollment.subject}
          </DialogTitle>
          <DialogDescription>
            Pick a different tutor allocated to teach this subject. Blocked only by a real schedule clash - not by capacity or anything else.
          </DialogDescription>
        </DialogHeader>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading eligible tutors...</p>
        ) : eligibleTutors.length === 0 ? (
          <p className="text-sm text-gray-500">
            {search.trim()
              ? "No eligible tutor matches that search."
              : `No other tutor can take "${enrollment.subject}" right now. A tutor appears here once they are active, fully approved and vetted, and allocated to this subject in Tutor Allocation.`}
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
