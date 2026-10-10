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
import { ExplainTutorEligibilityAction, ReassignSubjectTutorAction, SearchEligibleTutorsAction, type TutorEligibilityExplanation } from "@/server/allocation-hub";
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
  // Why a searched-for tutor is not offered - and where this student's subject sits in the curriculum.
  const [explain, setExplain] = useState<TutorEligibilityExplanation | null>(null);

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
      // Nothing eligible matched: say WHY for the tutor being looked for (and show where this subject sits), instead of an empty list.
      if ((res?.data ?? []).length === 0 || !search.trim()) {
        const [ex] = await ExplainTutorEligibilityAction(enrollment.id, search.trim() || undefined);
        if (!stale) setExplain(ex?.data ?? null);
      } else {
        const [ex] = await ExplainTutorEligibilityAction(enrollment.id);
        if (!stale) setExplain(ex?.data ? { ...ex.data, tutors: [] } : null);
      }
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

        {explain && (
          <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
            This student&apos;s {enrollment.subject} sits at: <span className="font-medium text-gray-800">{explain.subjectPath}</span>
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading eligible tutors...</p>
        ) : eligibleTutors.length === 0 ? (
          <p className="text-sm text-gray-500">
            {search.trim()
              ? "No eligible tutor matches that search."
              : `No other tutor can take "${enrollment.subject}" right now. A tutor appears here once they are active, fully approved and vetted, and allocated to this exact subject in Tutor Allocation.`}
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

        {search.trim() && explain && explain.tutors.length > 0 && eligibleTutors.length === 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            <p className="text-xs font-medium text-gray-700">Why they are not offered:</p>
            {explain.tutors.map((t) => (
              <div key={t.tutorId} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 space-y-1">
                <p className="font-medium">{t.name}</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {t.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                {t.allocatedTo.length > 0 && (
                  <p className="text-amber-800">
                    Allocated to: {t.allocatedTo.slice(0, 6).join(" | ")}
                    {t.allocatedTo.length > 6 ? ` ... (+${t.allocatedTo.length - 6} more)` : ""}
                  </p>
                )}
              </div>
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
