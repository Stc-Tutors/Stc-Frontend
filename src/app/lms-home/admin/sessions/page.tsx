"use client";

import { Fragment, useEffect, useState } from "react";
import { Check, X, Pencil, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GetLessonsAdminAction,
  ListRescheduleRequestsAction,
  ApproveRescheduleAction,
  RejectRescheduleAction,
  ForwardRescheduleToParentAction,
  UpdateLessonAction,
  CancelLessonAction,
  OverrideRescheduleSurchargeAction,
  GetRescheduleSurchargeSettingsAction,
  UpdateRescheduleSurchargeSettingsAction,
  GetRescheduleNoticeSettingsAction,
  UpdateRescheduleNoticeSettingsAction,
} from "@/server/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import {
  Lesson,
  LessonCourseRef,
  LessonStatus,
  RescheduleNoticeSettings,
  RescheduleRequest,
  RescheduleRequestStatus,
  RescheduleSurchargeSettings,
  RescheduleSurchargeType,
} from "@/types/lesson";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";
import { UserRole } from "@/types/user";
import JoinClassLink from "@/components/classroom/JoinClassLink";

type Filter = "upcoming" | "pending" | "cancelled";

export default function AdminSessionsPage() {
  const { user, hasPermission } = useUser();
  // HOD keeps meeting-link access unconditionally, same as the backend
  // (LessonService.assertCanSetMeetingUrl only gates STC_ADMIN/TUTOR_ADMIN
  // behind this permission - HOD and SUPER_ADMIN/ALMIGHTY_ADMIN always pass).
  const canManageMeetingLinks = user?.role === UserRole.HOD || hasPermission(AdminPermission.MANAGE_MEETING_LINKS);
  // Unlike meeting links, HOD has no direct-cancel path at all (see stcbe's
  // LessonService.cancel - only family or STC_ADMIN/TUTOR_ADMIN/SUPER_ADMIN/
  // ALMIGHTY_ADMIN qualify; a HOD gets the same 403 a tutor would and has to
  // go through reschedule() instead), so this is a plain permission check
  // with no HOD carve-out.
  const canCancelClasses = hasPermission(AdminPermission.CANCEL_CLASSES);
  // Both of these routes are SUPER_ADMIN/ALMIGHTY_ADMIN or STC_ADMIN/TUTOR_ADMIN
  // only at the backend role level (HOD isn't even in adminRoles for them), so
  // no HOD carve-out here - matches AdminAuthorizationService.hasPermission
  // returning [] (never a bypass) for a plain HOD.
  const canManageNoticeSettings = hasPermission(AdminPermission.MANAGE_SCHEDULES);
  const canManagePricing = hasPermission(AdminPermission.MANAGE_PRICING);

  const [filter, setFilter] = useState<Filter>("upcoming");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Which lesson's meeting link is currently being edited inline.
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");

  // Per reschedule-request choice: reuse the lesson's existing link, or type a new one.
  const [newLinkFor, setNewLinkFor] = useState<Record<string, string>>({});
  // Per reschedule-request override of the auto-computed late-notice surcharge.
  const [surchargeDraft, setSurchargeDraft] = useState<Record<string, string>>({});

  // Which lesson's cancellation reason prompt is currently open.
  const [cancellingLessonId, setCancellingLessonId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const load = async (f: Filter) => {
    setIsLoading(true);
    if (f === "pending") {
      const [res] = await ListRescheduleRequestsAction(RescheduleRequestStatus.PENDING);
      setRescheduleRequests(res?.data ?? []);
    } else {
      const [res] = await GetLessonsAdminAction({
        status: f === "upcoming" ? LessonStatus.SCHEDULED : LessonStatus.CANCELLED,
      });
      setLessons(res?.data ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (id: string) => {
    const meetingUrl = newLinkFor[id]?.trim() || undefined;
    const [, error] = await ApproveRescheduleAction(id, meetingUrl);
    setMessage(error || (meetingUrl ? "Reschedule approved with new link" : "Reschedule approved - link unchanged"));
    load(filter);
  };

  const handleReject = async (id: string) => {
    const [, error] = await RejectRescheduleAction(id, "Rejected by admin");
    setMessage(error || "Reschedule rejected");
    load(filter);
  };

  const handleForwardToParent = async (id: string) => {
    const [, error] = await ForwardRescheduleToParentAction(id);
    setMessage(error || "Forwarded to the parent for confirmation");
    load(filter);
  };

  const handleOverrideSurcharge = async (id: string) => {
    const raw = surchargeDraft[id];
    const amount = Number(raw);
    if (!raw || Number.isNaN(amount) || amount < 0) return;
    const [, error] = await OverrideRescheduleSurchargeAction(id, amount);
    setMessage(error || "Surcharge updated");
    if (!error) {
      setSurchargeDraft((prev) => ({ ...prev, [id]: "" }));
      load(filter);
    }
  };

  const startEditLink = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditingUrl(lesson.meetingUrl ?? "");
  };

  const saveLink = async (lessonId: string) => {
    const [, error] = await UpdateLessonAction(lessonId, { meetingUrl: editingUrl.trim() || undefined });
    setMessage(error || "Meeting link saved");
    setEditingLessonId(null);
    load(filter);
  };

  const handleCancel = async (lessonId: string) => {
    if (!cancelReason.trim()) {
      setMessage("A reason is required to cancel a class");
      return;
    }
    setIsCancelling(true);
    const [, error] = await CancelLessonAction(lessonId, cancelReason.trim());
    setIsCancelling(false);
    setMessage(error || "Class cancelled - the student/parent and tutor have been notified");
    if (!error) {
      setCancellingLessonId(null);
      setCancelReason("");
      load(filter);
    }
  };

  const courseTitle = (course: Lesson["course"]) =>
    typeof course === "string" ? course : (course as LessonCourseRef).title;

  const lessonOf = (r: RescheduleRequest) => (typeof r.lesson === "string" ? null : r.lesson);
  const courseOf = (r: RescheduleRequest) => (typeof r.course === "string" ? null : r.course);

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="upcoming">Upcoming Sessions</option>
          <option value="pending">Pending Review</option>
          <option value="cancelled">Cancelled Classes</option>
        </select>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {filter === "pending" && (
        <>
          {canManageNoticeSettings && <NoticeSettingsPanel />}
          {canManagePricing && <SurchargeSettingsPanel />}
        </>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : filter === "pending" ? (
        rescheduleRequests.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No reschedule requests pending review.</p>
        ) : (
          <div className="space-y-3">
            {rescheduleRequests.map((r) => {
              const lesson = lessonOf(r);
              const course = courseOf(r);
              return (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === "CANCEL" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                          {r.type === "CANCEL" ? "Cancellation" : r.type === "TUTOR_RESCHEDULE" ? "Tutor Reschedule" : "Reschedule"}
                        </span>
                        {r.urgent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                            Urgent · inside 24h
                          </span>
                        )}
                        {r.type === "TUTOR_RESCHEDULE" && r.stage === "AWAITING_PARENT" && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">
                            Awaiting parent confirmation
                          </span>
                        )}
                        {r.lateNotice && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-800">
                            Late notice · surcharge
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">
                        {lesson?.title ?? "Lesson"} {course?.title ? `· ${course.title}` : ""}
                      </p>
                      <p className="text-gray-500">
                        {formatScheduleDateTime(r.currentScheduledDate)} &rarr; {r.requestedScheduledDate ? formatScheduleDateTime(r.requestedScheduledDate) : "(cancellation)"}
                      </p>
                      {r.reason && <p className="text-gray-500 mt-1">Reason: {r.reason}</p>}
                      {r.surcharge && (
                        <p className="text-gray-500 mt-1">
                          Surcharge: {r.surcharge.amount} {r.surcharge.currency}
                          {r.surcharge.overriddenAt ? " (overridden)" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {r.type === "TUTOR_RESCHEDULE" ? (
                        r.stage === "AWAITING_ADMIN" && (
                          <Button size="icon" variant="ghost" onClick={() => handleForwardToParent(r.id)} title="Forward to parent">
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        )
                      ) : (
                        <Button size="icon" variant="ghost" onClick={() => handleApprove(r.id)} title="Approve">
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => handleReject(r.id)} title="Reject">
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {r.lateNotice && (
                    <div className="text-xs flex items-center gap-2 border-t pt-2 mt-3">
                      <span className="text-gray-500 whitespace-nowrap">Override surcharge amount:</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder={r.surcharge ? String(r.surcharge.amount) : "0"}
                        value={surchargeDraft[r.id] ?? ""}
                        onChange={(e) => setSurchargeDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        className="h-7 text-xs w-24"
                      />
                      <button onClick={() => handleOverrideSurcharge(r.id)} className="text-blue-600 hover:underline">
                        Save
                      </button>
                    </div>
                  )}

                  {r.type !== "TUTOR_RESCHEDULE" && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1.5">
                    <p className="text-gray-500">
                      Current link: {lesson?.meetingUrl ? (
                        <a href={lesson.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {lesson.meetingUrl}
                        </a>
                      ) : (
                        "none"
                      )}
                    </p>
                    {canManageMeetingLinks && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 whitespace-nowrap">On approval:</span>
                        <Input
                          placeholder="Leave blank to keep the existing link, or paste a new one"
                          value={newLinkFor[r.id] ?? ""}
                          onChange={(e) => setNewLinkFor((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          className="h-7 text-xs"
                        />
                      </div>
                    )}
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : lessons.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No sessions found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject/Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              {filter === "upcoming" && <TableHead>Meeting Link</TableHead>}
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <Fragment key={lesson.id}>
                <TableRow>
                  <TableCell>{courseTitle(lesson.course)}</TableCell>
                  <TableCell>{formatScheduleDateTime(lesson.scheduledDate)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${lesson.status === LessonStatus.CANCELLED ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {lesson.status}
                    </span>
                  </TableCell>
                  {filter === "upcoming" && (
                    <TableCell>
                      {editingLessonId === lesson.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingUrl}
                            onChange={(e) => setEditingUrl(e.target.value)}
                            className="h-7 text-xs w-56"
                            placeholder="Google Meet URL"
                          />
                          <Button size="sm" className="h-7 px-2 text-xs" onClick={() => saveLink(lesson.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingLessonId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 truncate max-w-[10rem]">{lesson.meetingUrl || "Not set"}</span>
                          {canManageMeetingLinks && (
                            <button onClick={() => startEditLink(lesson)} title="Edit meeting link" className="text-gray-400 hover:text-blue-600">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      {lesson.meetingUrl && lesson.status === LessonStatus.SCHEDULED && (
                        <JoinClassLink
                          lessonId={lesson.id}
                          scheduledDate={lesson.scheduledDate}
                          durationMinutes={lesson.durationMinutes}
                          className="text-blue-600 hover:underline text-xs font-medium"
                          label="Join"
                        />
                      )}
                      {canCancelClasses && lesson.status === LessonStatus.SCHEDULED && (
                        <button
                          onClick={() => {
                            setCancellingLessonId(cancellingLessonId === lesson.id ? null : lesson.id);
                            setCancelReason("");
                          }}
                          title="Cancel class"
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {cancellingLessonId === lesson.id && (
                  <TableRow>
                    <TableCell colSpan={filter === "upcoming" ? 5 : 4} className="bg-red-50">
                      <div className="flex items-center gap-2 py-1">
                        <Input
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Reason for cancelling (required - the student/parent and tutor will see this)"
                          className="h-7 text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          disabled={isCancelling || !cancelReason.trim()}
                          onClick={() => handleCancel(lesson.id)}
                        >
                          {isCancelling ? "Cancelling..." : "Confirm cancel"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => setCancellingLessonId(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// Mirrors Stc-SuperAdmin's approvals page NoticeSettingsPanel - same backend
// endpoint (PUT /lessons/admin/reschedule-notice-settings), gated here on
// MANAGE_SCHEDULES since a plain STC_ADMIN/TUTOR_ADMIN needs it explicitly
// granted (SUPER_ADMIN/ALMIGHTY_ADMIN always pass server-side).
function NoticeSettingsPanel() {
  const [settings, setSettings] = useState<RescheduleNoticeSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    GetRescheduleNoticeSettingsAction().then(([res]) => setSettings(res?.data ?? null));
  }, []);

  if (!settings) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const [res, error] = await UpdateRescheduleNoticeSettingsAction({
      studentNoticeHours: settings.studentNoticeHours,
      parentNoticeHours: settings.parentNoticeHours,
      tutorNoticeHours: settings.tutorNoticeHours,
    });
    setIsSaving(false);
    if (res?.data) setSettings(res.data);
    setMessage(error || "Saved");
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-2 mb-4">
      <p className="font-medium text-gray-900">Cancel/reschedule notice window</p>
      <p className="text-xs text-gray-500">
        How much notice each role must give before a class starts for a cancellation or reschedule to apply
        immediately. Less notice than this hard-blocks the direct action into this review queue instead.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Student (hours)</span>
          <input
            type="number"
            min={0}
            value={settings.studentNoticeHours}
            onChange={(e) => setSettings({ ...settings, studentNoticeHours: Number(e.target.value) })}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs w-24"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Parent (hours)</span>
          <input
            type="number"
            min={0}
            value={settings.parentNoticeHours}
            onChange={(e) => setSettings({ ...settings, parentNoticeHours: Number(e.target.value) })}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs w-24"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Tutor (hours)</span>
          <input
            type="number"
            min={0}
            value={settings.tutorNoticeHours}
            onChange={(e) => setSettings({ ...settings, tutorNoticeHours: Number(e.target.value) })}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs w-24"
          />
        </label>
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 px-3 text-xs">
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {message && <span className="text-xs text-gray-500">{message}</span>}
      </div>
    </div>
  );
}

// Mirrors Stc-SuperAdmin's approvals page SurchargeSettingsPanel - same
// backend endpoint (PUT /lessons/admin/reschedule-surcharge-settings), gated
// here on MANAGE_PRICING (also required server-side for a plain STC_ADMIN/
// TUTOR_ADMIN).
function SurchargeSettingsPanel() {
  const [settings, setSettings] = useState<RescheduleSurchargeSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    GetRescheduleSurchargeSettingsAction().then(([res]) => setSettings(res?.data ?? null));
  }, []);

  if (!settings) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const [res, error] = await UpdateRescheduleSurchargeSettingsAction({
      type: settings.type,
      flatAmount: settings.flatAmount,
      percentage: settings.percentage,
      currency: settings.currency,
    });
    setIsSaving(false);
    if (res?.data) setSettings(res.data);
    setMessage(error || "Saved");
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-2 mb-4">
      <p className="font-medium text-gray-900">Late tutor-reschedule surcharge</p>
      <p className="text-xs text-gray-500">
        Applied when a tutor requests a reschedule inside their configured notice window (still refused outright
        inside 2 hours). Tutors/parents/students see this rate before submitting a late request; you can still
        override the amount on a specific request when reviewing it below.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={settings.type}
          onChange={(e) => setSettings({ ...settings, type: e.target.value as RescheduleSurchargeType })}
          className="border border-gray-300 rounded-md px-2 py-1 text-xs max-w-[10rem]"
        >
          <option value={RescheduleSurchargeType.FLAT}>Flat fee</option>
          <option value={RescheduleSurchargeType.PERCENTAGE}>% of lesson rate</option>
        </select>
        {settings.type === RescheduleSurchargeType.FLAT ? (
          <>
            <input
              type="number"
              min={0}
              value={settings.flatAmount}
              onChange={(e) => setSettings({ ...settings, flatAmount: Number(e.target.value) })}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs w-28"
            />
            <input
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs w-20"
            />
          </>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={settings.percentage}
              onChange={(e) => setSettings({ ...settings, percentage: Number(e.target.value) })}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs w-20"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        )}
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 px-3 text-xs">
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {message && <span className="text-xs text-gray-500">{message}</span>}
      </div>
    </div>
  );
}
