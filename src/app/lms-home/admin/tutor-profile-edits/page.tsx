"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";
import {
  ApproveTutorProfileEditAction,
  ListPendingTutorProfileEditsAction,
  RejectTutorProfileEditAction,
} from "@/server/tutor-profile";
import { TutorProfileEditRequest } from "@/server/tutor-profile";

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length === 0 ? "(empty)" : JSON.stringify(value);
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

  if (isLoadingUser) return <p className="text-sm text-gray-500">Loading...</p>;

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
                  <span className="text-xs text-gray-400">{new Date(req.submittedAt).toLocaleDateString()}</span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  {Object.entries(req.changes).map(([field, value]) => (
                    <p key={field}>
                      <span className="font-medium">{field}:</span> {formatFieldValue(value)}
                    </p>
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
