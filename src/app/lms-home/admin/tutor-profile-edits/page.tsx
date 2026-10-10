"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/datetime";
import InlineLoader from "@/components/shared/InlineLoader";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";
import {
  ApproveTutorProfileEditAction,
  ListPendingTutorProfileEditsAction,
  RejectTutorProfileEditAction,
} from "@/server/tutor-profile";
import { TutorProfileEditRequest } from "@/server/tutor-profile";

// Reviewing a diff sight-unseen is the one place an admin most needs a
// readable value, not a JSON blob - mirrors how each of these same
// TutorProfile fields is already rendered on the live profile (see
// users/[id]/page.tsx's teachingCombinations formatting).
const STRUCTURED_FIELD_FORMATTERS: Record<string, (value: unknown) => string> = {
  teachingCombinations: (value) =>
    (value as { country: string; curriculum: string; gradeLevel: string; subjectsTaught: string[] }[])
      .map((c) => `${c.country} · ${c.curriculum} · ${c.gradeLevel}: ${c.subjectsTaught.join(", ")}`)
      .join("; "),
  education: (value) =>
    (value as { degree: string; institution?: string; year?: number }[])
      .map((e) => `${e.degree}${e.institution ? ` - ${e.institution}` : ""}${e.year ? ` (${e.year})` : ""}`)
      .join("; "),
  availability: (value) =>
    (value as { dayOfWeek: string; startTime: string; endTime: string }[])
      .map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`)
      .join("; "),
  teachingExperienceHistory: (value) =>
    (value as { institution: string; role: string; startDate: string; endDate?: string; currentlyWorkHere: boolean }[])
      .map((e) => `${e.role} at ${e.institution} (${e.startDate} - ${e.currentlyWorkHere ? "present" : e.endDate ?? "?"})`)
      .join("; "),
  certificationProofs: (value) =>
    (value as { certification: string }[]).map((c) => c.certification).join(", "),
  govIdFile: (value) => (value as { fileName: string }).fileName,
  cvFile: (value) => (value as { fileName: string }).fileName,
  supportingDocumentsFile: (value) => (value as { fileName: string }).fileName,
};

function formatFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value) && value.length === 0) return "(empty)";
  const formatter = STRUCTURED_FIELD_FORMATTERS[field];
  if (formatter) {
    try {
      return formatter(value);
    } catch {
      // Falls through to the generic handling below if the diff's shape
      // doesn't match what's expected (e.g. a partial/legacy edit).
    }
  }
  if (Array.isArray(value)) return value.every((v) => typeof v !== "object") ? value.join(", ") : JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Review queue for a tutor's self-service profile edits - see stcbe's
// TutorProfileService.listPendingEdits/approveEdit/rejectEdit. A submitted
// edit never applies straight to the live profile; it sits here until an
// admin/HOD/super-admin approves or rejects it.
export default function TutorProfileEditsPage() {
  const { hasPermission, isLoading: isLoadingUser } = useUser();
  const canReview = hasPermission(AdminPermission.APPROVE_TUTOR_PROFILE_EDITS);

  const [requests, setRequests] = useState<TutorProfileEditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await ListPendingTutorProfileEditsAction();
    if (error) setMessage(error);
    setRequests(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (canReview) load();
    else setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReview]);

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveTutorProfileEditAction(id);
    setMessage(error || "Profile edit approved - now live");
    load();
  };

  const handleReject = async (id: string) => {
    const [, error] = await RejectTutorProfileEditAction(id, rejectReasons[id]);
    setMessage(error || "Profile edit rejected");
    load();
  };

  if (isLoadingUser) return <InlineLoader />;

  if (!canReview) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Tutor Profile Edits</h1>
        <p className="text-sm text-gray-500">You need Approve Tutor Profile Edits permission to see this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tutor Profile Edits</h1>
        <p className="text-sm text-gray-500 mt-1">
          A tutor&apos;s self-service profile changes wait here until approved - nothing goes live automatically.
        </p>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No profile edits awaiting review.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const tutor = req.tutor;
            return (
              <div key={req.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    {typeof tutor === "string" ? tutor : `${tutor.firstName} ${tutor.lastName}`}
                  </p>
                  <span className="text-xs text-gray-400">{formatDate(req.submittedAt)}</span>
                </div>

                {/* Only the fields that actually differ from the live profile are listed, each as before -> after. */}
                <div className="text-sm text-gray-700 space-y-2">
                  {Object.keys(req.changes).length === 0 && <p className="text-gray-500">Nothing differs from the current profile.</p>}
                  {Object.entries(req.changes).map(([field, value]) => (
                    <div key={field} className="rounded-md border p-2">
                      <p className="font-medium">{field}</p>
                      <p className="text-red-700 break-words">
                        <span className="text-xs uppercase tracking-wide text-gray-500">Before </span>
                        {formatFieldValue(field, req.current?.[field])}
                      </p>
                      <p className="text-green-700 break-words">
                        <span className="text-xs uppercase tracking-wide text-gray-500">After </span>
                        {formatFieldValue(field, value)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 items-center pt-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="bg-green-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <input
                    placeholder="Rejection reason (optional)"
                    value={rejectReasons[req.id] ?? ""}
                    onChange={(e) => setRejectReasons((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="border rounded-md px-2 py-1.5 text-xs flex-1"
                  />
                  <button
                    onClick={() => handleReject(req.id)}
                    className="border border-red-300 text-red-600 rounded-md px-3 py-1.5 text-xs hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
