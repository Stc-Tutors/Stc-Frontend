"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GetUsersAction } from "@/server/admin";
import { GetTutorAllocationAction } from "@/server/tutor-allocation";
import {
  AssignTutorToEnrollmentsAction,
  ListAllocationEnrollmentsAction,
  ListAssignedForTutorSubjectAction,
} from "@/server/allocation-hub";
import { SubjectEnrollment, SubjectEnrollmentStatus } from "@/types/allocation-hub";
import { TutorAllocation } from "@/types/tutor-allocation";
import { User, UserRole } from "@/types/user";
import { isSubjectAllocatedToTutor } from "@/lib/tutor-allocation";
import DualPaneTransferList from "./dual-pane-transfer-list";

function enrollmentToItem(e: SubjectEnrollment) {
  return { id: e.id, primary: e.student.fullName, secondary: e.subject };
}

// Workflow A: pick a tutor -> the subjects they're allocated to teach -> which
// unassigned (paid, no tutor) enrollments to hand them for that subject.
//
// fixedTutorId: renders this scoped to one tutor (no picker, no other-tutor
// fetch) for embedding on that tutor's own management page - same component,
// same backend calls.
export default function TeachingRosterTab({
  jumpToken = 0,
  fixedTutorId,
}: {
  jumpToken?: number;
  fixedTutorId?: string;
}) {
  const [tutors, setTutors] = useState<User[]>([]);
  const [tutorId, setTutorId] = useState(fixedTutorId ?? "");
  const [allocation, setAllocation] = useState<TutorAllocation | null>(null);
  const [allUnassigned, setAllUnassigned] = useState<SubjectEnrollment[]>([]);
  const [subject, setSubject] = useState("");
  const [assigned, setAssigned] = useState<SubjectEnrollment[]>([]);
  const [isLoadingLeft, setIsLoadingLeft] = useState(false);
  const [isLoadingRight, setIsLoadingRight] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (fixedTutorId) return;
    GetUsersAction({ role: UserRole.TUTOR, limit: 1000 }).then(([res]) => setTutors(res?.data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadForTutor() {
    if (!tutorId) {
      setAllocation(null);
      setAllUnassigned([]);
      return;
    }
    GetTutorAllocationAction(tutorId).then(([res]) => setAllocation(res?.data ?? null));
    setIsLoadingLeft(true);
    ListAllocationEnrollmentsAction({ status: SubjectEnrollmentStatus.UNASSIGNED_TUTOR }).then(([res]) => {
      setAllUnassigned(res?.data ?? []);
      setIsLoadingLeft(false);
    });
  }

  useEffect(() => {
    setSubject("");
    setAssigned([]);
    loadForTutor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  // A super-admin clicking the "Action Required" widget just wants this tab
  // focused - re-fetch whatever's currently selected rather than deep-link a
  // specific tutor, since the orphan pool spans every tutor.
  useEffect(() => {
    if (jumpToken > 0) loadForTutor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken]);

  // Every unassigned enrollment this tutor is actually eligible for -
  // subjects come out of this, never out of a Course list.
  const eligible = useMemo(
    () => allUnassigned.filter((e) => isSubjectAllocatedToTutor(allocation, e)),
    [allUnassigned, allocation]
  );

  const subjects = useMemo(() => {
    const set = new Set(eligible.map((e) => e.subject));
    return Array.from(set).sort();
  }, [eligible]);

  const unassigned = useMemo(() => eligible.filter((e) => e.subject === subject), [eligible, subject]);

  function refreshRight() {
    if (!subject || !tutorId) {
      setAssigned([]);
      return;
    }
    setIsLoadingRight(true);
    ListAssignedForTutorSubjectAction(tutorId, subject).then(([res]) => {
      setAssigned(res?.data ?? []);
      setIsLoadingRight(false);
    });
  }

  useEffect(() => {
    refreshRight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, tutorId]);

  const handleTransfer = async (ids: string[]) => {
    setIsAssigning(true);
    const [res, error] = await AssignTutorToEnrollmentsAction(ids, tutorId);
    setIsAssigning(false);
    if (error || !res?.data) {
      toast.error(error || "Failed to assign tutor");
      return;
    }
    const failed = res.data.filter((r) => !r.success);
    if (failed.length > 0) {
      toast.warning(`${res.data.length - failed.length}/${res.data.length} assigned - ${failed[0].message}`);
    } else {
      toast.success(res.message);
    }
    loadForTutor();
    refreshRight();
  };

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-1 gap-3 ${fixedTutorId ? "" : "md:grid-cols-2"}`}>
        {!fixedTutorId && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tutor</label>
            <select
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">Select a tutor...</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Subject/Course this tutor is allocated to teach</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!tutorId}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-50"
          >
            <option value="">
              {tutorId && subjects.length === 0 ? "No allocated subjects/courses have waiting students" : "Select a subject/course..."}
            </option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tutorId && !allocation && (
        <p className="text-xs text-amber-600">
          This tutor has no allocation yet - nothing will show here until one is set.
        </p>
      )}

      {!subject ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg p-6 text-center">
          Pick a tutor and subject to see paid-but-unassigned enrollments for that subject.
        </p>
      ) : (
        <DualPaneTransferList
          leftTitle="Unassigned enrollments"
          rightTitle="Assigned to this tutor"
          leftItems={unassigned.map(enrollmentToItem)}
          rightItems={assigned.map(enrollmentToItem)}
          isLoading={isLoadingLeft || isLoadingRight}
          isTransferring={isAssigning}
          transferLabel="Assign tutor"
          onTransfer={handleTransfer}
          searchPlaceholder="Search student..."
        />
      )}
    </div>
  );
}
