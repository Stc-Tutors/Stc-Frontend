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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AssignTutorToEnrollmentsAction,
  GetSuggestedTutorsAction,
  SetMeetingLinkAction,
} from "@/server/allocation-hub";
import { GetTutorAllocationAction } from "@/server/tutor-allocation";
import { GetUsersAction } from "@/server/admin";
import { SUBJECT_ENROLLMENT_STATUS_LABELS, SubjectEnrollment, SubjectEnrollmentStatus, SuggestedTutor } from "@/types/allocation-hub";
import { User, UserRole } from "@/types/user";
import { isSubjectAllocatedToTutor } from "@/lib/tutor-allocation";

interface Props {
  enrollment: SubjectEnrollment | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

// Per-row workflow: pick a tutor (from the Smart Suggestion list, already
// filtered to tutors actually allocated to this subject, or a manual roster
// search) and assign directly - then, once the enrollment is Pending
// Confirmation, enter the Google Meet link that flips it to Active.
export default function UnassignedQueueDetailDialog({ enrollment, onOpenChange, onChanged }: Props) {
  const [suggestions, setSuggestions] = useState<SuggestedTutor[] | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const [manualSearch, setManualSearch] = useState("");
  const [manualResults, setManualResults] = useState<User[] | null>(null);
  const [isSearchingManually, setIsSearchingManually] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);

  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [meetingUrl, setMeetingUrl] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

  useEffect(() => {
    if (!enrollment || enrollment.status !== SubjectEnrollmentStatus.UNASSIGNED_TUTOR) return;
    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    GetSuggestedTutorsAction(enrollment.id).then(([res, error]) => {
      setSuggestions(res?.data ?? []);
      if (error) setSuggestionsError(error);
      setIsLoadingSuggestions(false);
    });
  }, [enrollment]);

  useEffect(() => {
    setSuggestions(null);
    setShowManualSearch(false);
    setManualSearch("");
    setManualResults(null);
    setSelectedTutorId("");
    setMeetingUrl(enrollment?.meetingUrl ?? "");
  }, [enrollment]);

  if (!enrollment) return null;

  // Same eligibility rule the Smart Suggestion list and the backend's
  // assignTutor both enforce - a tutor not approved for this exact
  // subject/course must never be selectable here either, even though this
  // is just a manual name/email search.
  const handleManualSearch = async () => {
    setIsSearchingManually(true);
    const [res, error] = await GetUsersAction({ role: UserRole.TUTOR, search: manualSearch || undefined, limit: 20 });
    if (error) {
      toast.error(error);
      setManualResults(null);
      setIsSearchingManually(false);
      return;
    }
    const candidates = res?.data ?? [];
    const eligible = await Promise.all(
      candidates.map(async (u) => {
        const [allocationRes] = await GetTutorAllocationAction(u.id);
        return isSubjectAllocatedToTutor(allocationRes?.data ?? null, enrollment) ? u : null;
      })
    );
    setManualResults(eligible.filter((u): u is User => u !== null));
    setIsSearchingManually(false);
  };

  const handleAssign = async () => {
    if (!selectedTutorId) return;
    setIsAssigning(true);
    const [res, error] = await AssignTutorToEnrollmentsAction([enrollment.id], selectedTutorId);
    setIsAssigning(false);
    const failed = res?.data?.find((r) => !r.success);
    if (error || failed) {
      toast.error(error || failed?.message || "Failed to assign tutor");
      return;
    }
    toast.success("Tutor assigned - now Pending Confirmation until a meeting link is set");
    onChanged();
  };

  const handleSaveMeetingLink = async () => {
    if (!meetingUrl.trim()) return;
    setIsSavingLink(true);
    const [, error] = await SetMeetingLinkAction(enrollment.id, meetingUrl.trim());
    setIsSavingLink(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Meeting link saved - class is now Active");
    onChanged();
  };

  return (
    <Dialog open={!!enrollment} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {enrollment.student.fullName} - {enrollment.subject}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="outline">{SUBJECT_ENROLLMENT_STATUS_LABELS[enrollment.status]}</Badge>
          </DialogDescription>
        </DialogHeader>

        {enrollment.status === SubjectEnrollmentStatus.UNASSIGNED_TUTOR && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Suggested tutors</h3>
              {isLoadingSuggestions && <p className="text-xs text-gray-500">Finding tutors free at this student&apos;s requested time...</p>}
              {suggestionsError && <p className="text-xs text-red-600">{suggestionsError}</p>}
              {!isLoadingSuggestions && !suggestionsError && suggestions?.length === 0 && (
                <p className="text-xs text-gray-500">
                  No tutor approved for this subject with matching declared availability - try a manual search below.
                </p>
              )}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {(suggestions ?? []).map((s) => (
                  <button
                    key={s.tutorProfileId}
                    type="button"
                    onClick={() => setSelectedTutorId(s.tutor.id)}
                    className={`w-full text-left border rounded-md px-3 py-2 text-sm flex items-center justify-between ${
                      selectedTutorId === s.tutor.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-gray-900">
                      {s.tutor.firstName} {s.tutor.lastName}
                    </span>
                    {s.hasConflict ? (
                      <Badge variant="destructive">Busy at this time</Badge>
                    ) : (
                      <Badge variant="success">Free</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowManualSearch((v) => !v)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {showManualSearch ? "Hide manual roster search" : "Or search the full tutor roster manually"}
              </button>
              {showManualSearch && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={manualSearch}
                      onChange={(e) => setManualSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                      placeholder="Search tutor by name or email..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={handleManualSearch} disabled={isSearchingManually}>
                      {isSearchingManually ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  {!isSearchingManually && manualResults?.length === 0 && (
                    <p className="text-xs text-gray-500">
                      No tutor approved for &quot;{enrollment.subject}&quot; matches that search - only tutors with
                      this exact subject/course in their Approved Subjects are shown.
                    </p>
                  )}
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {(manualResults ?? []).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedTutorId(u.id)}
                        className={`w-full text-left border rounded-md px-3 py-2 text-sm ${
                          selectedTutorId === u.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {u.firstName} {u.lastName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {enrollment.status !== SubjectEnrollmentStatus.UNASSIGNED_TUTOR && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Google Meet URL</label>
            <input
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              disabled={enrollment.status === SubjectEnrollmentStatus.ACTIVE}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              {enrollment.status === SubjectEnrollmentStatus.ACTIVE
                ? "Saved - the parent/student has been notified this class is confirmed."
                : "Saving this link is what flips this enrollment to Active and notifies the parent/student."}
            </p>
          </div>
        )}

        <DialogFooter>
          {enrollment.status === SubjectEnrollmentStatus.UNASSIGNED_TUTOR && (
            <Button onClick={handleAssign} disabled={!selectedTutorId || isAssigning}>
              {isAssigning ? "Assigning..." : "Assign tutor"}
            </Button>
          )}
          {enrollment.status === SubjectEnrollmentStatus.PENDING_CONFIRMATION && (
            <Button onClick={handleSaveMeetingLink} disabled={!meetingUrl.trim() || isSavingLink}>
              {isSavingLink ? "Saving..." : "Save meeting link & activate"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
