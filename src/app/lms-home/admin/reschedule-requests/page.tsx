"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import {
  ListRescheduleRequestsAction,
  ApproveRescheduleAction,
  RejectRescheduleAction,
  ForwardRescheduleToParentAction,
} from "@/server/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import { LessonCourseRef, RescheduleRequest, RescheduleRequestStatus } from "@/types/lesson";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

export default function AdminRescheduleRequestsPage() {
  const { hasPermission } = useUser();
  const canApproveReschedules = hasPermission(AdminPermission.APPROVE_RESCHEDULES);

  const [statusFilter, setStatusFilter] = useState<RescheduleRequestStatus | "">(RescheduleRequestStatus.PENDING);
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [res] = await ListRescheduleRequestsAction(statusFilter || undefined);
    // Urgent (filed inside the 24h notice window) requests surface first.
    const sorted = [...(res?.data ?? [])].sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setRequests(sorted);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveRescheduleAction(id);
    if (error) ToastError(error);
    else ToastSuccess("Request approved");
    load();
  };

  const handleForwardToParent = async (id: string) => {
    const [, error] = await ForwardRescheduleToParentAction(id);
    if (error) ToastError(error);
    else ToastSuccess("Forwarded to the parent for confirmation");
    load();
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      ToastError("Enter a rejection reason");
      return;
    }
    const [, error] = await RejectRescheduleAction(id, rejectReason.trim());
    if (error) ToastError(error);
    else ToastSuccess("Request rejected");
    setRejectingId(null);
    setRejectReason("");
    load();
  };

  const courseTitle = (course: RescheduleRequest["course"]) =>
    typeof course === "string" ? course : (course as LessonCourseRef).title;
  const requesterName = (r: RescheduleRequest) =>
    typeof r.requestedBy === "string" ? r.requestedBy : `${r.requestedBy.firstName} ${r.requestedBy.lastName}`;
  const lessonTitle = (r: RescheduleRequest) => (typeof r.lesson === "string" ? "Lesson" : r.lesson.title);

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reschedule &amp; Cancellation Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RescheduleRequestStatus | "")}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value={RescheduleRequestStatus.PENDING}>Pending</option>
          <option value={RescheduleRequestStatus.APPROVED}>Approved</option>
          <option value={RescheduleRequestStatus.REJECTED}>Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {!canApproveReschedules && (
        <p className="text-xs text-amber-600 mb-4">
          You can view this queue, but you don&apos;t have permission to approve or reject requests.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.type === "CANCEL" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {r.type === "CANCEL" ? "Cancellation" : r.type === "TUTOR_RESCHEDULE" ? "Tutor Reschedule" : "Reschedule"}
                    </span>
                    {r.urgent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                        Urgent &middot; inside 24h
                      </span>
                    )}
                    {r.type === "TUTOR_RESCHEDULE" && r.stage === "AWAITING_PARENT" && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">
                        Awaiting parent confirmation
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === RescheduleRequestStatus.PENDING
                          ? "bg-gray-100 text-gray-700"
                          : r.status === RescheduleRequestStatus.APPROVED
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {lessonTitle(r)} &middot; {courseTitle(r.course)}
                  </p>
                  <p className="text-gray-500">Requested by {requesterName(r)}</p>
                  <p className="text-gray-500">
                    {formatScheduleDateTime(r.currentScheduledDate)} &rarr;{" "}
                    {r.requestedScheduledDate ? formatScheduleDateTime(r.requestedScheduledDate) : "(cancellation)"}
                  </p>
                  {r.reason && <p className="text-gray-500 mt-1">Reason: {r.reason}</p>}
                  {r.rejectionReason && (
                    <p className="text-red-500 mt-1">Rejection reason: {r.rejectionReason}</p>
                  )}
                </div>

                {canApproveReschedules && r.status === RescheduleRequestStatus.PENDING && (
                  <div className="shrink-0">
                    {rejectingId === r.id ? (
                      <div className="flex flex-col gap-2 items-end">
                        <input
                          placeholder="Rejection reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="border rounded-md px-2 py-1 text-xs w-48"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleReject(r.id)}>
                            Confirm reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(r.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectingId(r.id)}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
