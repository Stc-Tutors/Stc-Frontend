"use client";

import { useEffect, useState } from "react";
import { Check, X, Pencil } from "lucide-react";
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
} from "@/server/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import { Lesson, LessonCourseRef, LessonStatus, RescheduleRequest, RescheduleRequestStatus } from "@/types/lesson";
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
                      </div>
                      <p className="font-medium text-gray-800">
                        {lesson?.title ?? "Lesson"} {course?.title ? `· ${course.title}` : ""}
                      </p>
                      <p className="text-gray-500">
                        {formatScheduleDateTime(r.currentScheduledDate)} &rarr; {r.requestedScheduledDate ? formatScheduleDateTime(r.requestedScheduledDate) : "(cancellation)"}
                      </p>
                      {r.reason && <p className="text-gray-500 mt-1">Reason: {r.reason}</p>}
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
              <TableRow key={lesson.id}>
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
                  {lesson.meetingUrl && lesson.status === LessonStatus.SCHEDULED && (
                    <JoinClassLink
                      lessonId={lesson.id}
                      scheduledDate={lesson.scheduledDate}
                      durationMinutes={lesson.durationMinutes}
                      className="text-blue-600 hover:underline text-xs font-medium"
                      label="Join"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
