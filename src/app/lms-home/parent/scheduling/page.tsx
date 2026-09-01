"use client";

import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, CalendarSync } from "lucide-react";
import { useRouter } from "next/navigation";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import {
  GetCourseLessonsAction,
  RescheduleLessonAction,
  CancelLessonAction,
  GetMyPendingRescheduleConfirmationsAction,
  ConfirmTutorRescheduleAction,
} from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson, LessonStatus, RescheduleRequest } from "@/types/lesson";
import { ScheduleReviewStatus, Student } from "@/types/student";
import { formatScheduleDateTime } from "@/lib/datetime";
import { isInsideRescheduleGate, isWithinTutorAvailability, formatAvailability, AvailabilityBlock } from "@/lib/schedule-gate";
import { GetTutorProfileAction } from "@/server/tutor-profile";
import { ChildSwitcherDropdown } from "@/components/child-switcher-dropdown";
import { useSelectedStudent } from "@/contexts/selected-student-context";

interface Row {
  lesson: Lesson;
  course: Course;
  childId: string;
  childName: string;
}

export default function ParentSchedulePage() {
  const router = useRouter();
  const { selectedId, isAllSelected } = useSelectedStudent();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rescheduleLessonId, setRescheduleLessonId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [tutorAvailability, setTutorAvailability] = useState<AvailabilityBlock[] | undefined>(undefined);
  const [tutorTimezone, setTutorTimezone] = useState<string | undefined>(undefined);
  const [cancelLessonId, setCancelLessonId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState<RescheduleRequest[]>([]);
  const [pendingSchedules, setPendingSchedules] = useState<Student[]>([]);
  const [rejectingConfirmationId, setRejectingConfirmationId] = useState<string | null>(null);
  const [confirmationRejectReason, setConfirmationRejectReason] = useState("");

  const loadConfirmations = async () => {
    const [res] = await GetMyPendingRescheduleConfirmationsAction();
    setConfirmations(res?.data ?? []);
  };

  const handleConfirmTutorReschedule = async (id: string, accept: boolean, reason?: string) => {
    if (!accept && !reason?.trim()) {
      setMessage("Enter a reason for rejecting");
      return;
    }
    const [, error] = await ConfirmTutorRescheduleAction(id, accept, reason);
    setMessage(error || (accept ? "Reschedule confirmed" : "Reschedule rejected"));
    if (!error) {
      setRejectingConfirmationId(null);
      setConfirmationRejectReason("");
      loadConfirmations();
      load();
    }
  };

  const load = async () => {
    const [childrenRes] = await GetLinkedStudentsAction();
    const children = childrenRes?.data ?? [];
    setPendingSchedules(children.filter((c) => c.scheduleReviewStatus === ScheduleReviewStatus.PENDING));

    const allRows: Row[] = [];
    for (const child of children) {
      const [courseEnrollmentsRes] = await GetStudentCoursesAction(child.id);
      const courses = (courseEnrollmentsRes?.data ?? [])
        .map((e) => (typeof e.course === "string" ? null : e.course))
        .filter((c): c is Course => !!c);

      const lessonLists = await Promise.all(courses.map((c) => GetCourseLessonsAction(c.id)));
      lessonLists.forEach(([res], i) => {
        (res?.data ?? []).forEach((lesson) =>
          allRows.push({ lesson, course: courses[i], childId: child.id, childName: child.fullName })
        );
      });
    }

    allRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
    setRows(allRows);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    loadConfirmations();
  }, []);

  const visibleRows = isAllSelected ? rows : rows.filter((r) => r.childId === selectedId);

  const openReschedule = async (lesson: Lesson, course: Course) => {
    setCancelLessonId(null);
    setRescheduleLessonId(rescheduleLessonId === lesson.id ? null : lesson.id);
    setNewDate("");
    setTutorAvailability(undefined);
    setTutorTimezone(undefined);
    const tutorId = typeof course.tutor === "string" ? course.tutor : course.tutor?.id;
    if (tutorId) {
      const [res] = await GetTutorProfileAction(tutorId);
      setTutorAvailability(res?.data?.availability);
      // Availability blocks are stored in the tutor's own local time - see
      // stcbe's LessonService.isWithinAvailability, which this mirrors.
      setTutorTimezone(res?.data?.timezone);
    }
  };

  const handleRequestReschedule = async (lessonId: string, scheduledDate: string, durationMinutes: number) => {
    if (!newDate) {
      setMessage("Pick a new date and time first");
      return;
    }
    if (!rescheduleReason.trim()) {
      setMessage("A reason is required - it's what the tutor/admin use to decide whether to grant it");
      return;
    }
    if (!isWithinTutorAvailability(tutorAvailability, newDate, durationMinutes, tutorTimezone)) {
      setMessage(`That time is outside your tutor's available hours. Available: ${formatAvailability(tutorAvailability)}`);
      return;
    }
    const [res, error] = await RescheduleLessonAction(lessonId, new Date(newDate).toISOString(), rescheduleReason);
    setMessage(
      error ||
        (res?.data?.applied
          ? "Class rescheduled"
          : "Reschedule request submitted - awaiting admin approval")
    );
    if (!error) {
      setRescheduleLessonId(null);
      setNewDate("");
      setRescheduleReason("");
      load();
    }
  };

  const handleCancel = async (lessonId: string, scheduledDate: string) => {
    if (!cancelReason.trim()) {
      setMessage("A reason is required to cancel a class");
      return;
    }
    const [res, error] = await CancelLessonAction(lessonId, cancelReason);
    setMessage(
      error ||
        (res?.data?.applied ? "Class cancelled" : "Cancellation requested - awaiting admin approval")
    );
    if (!error) {
      setCancelLessonId(null);
      setCancelReason("");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/lms-home/parent/dashboard")}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-1xl font-bold">BACK</span>
      </button>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarSync className="text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-800">Schedule</h1>
        </div>
        <ChildSwitcherDropdown />
      </div>

      {pendingSchedules.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-400">
          <h3 className="font-semibold text-gray-800 mb-1">Requested schedule pending admin approval</h3>
          <p className="text-xs text-gray-500">
            {pendingSchedules.map((s) => s.fullName).join(", ")} - we&apos;ll notify you once an admin approves the
            schedule or proposes a different time.
          </p>
        </div>
      )}

      {confirmations.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-400">
          <h3 className="font-semibold text-gray-800 mb-1">Tutor reschedule requests needing your confirmation</h3>
          <p className="text-xs text-gray-500 mb-4">
            Your tutor proposed a new time for these classes and an admin has reviewed the request. Confirm or
            reject the new time below.
          </p>
          <div className="space-y-3">
            {confirmations.map((c) => (
              <div key={c.id} className="border rounded-lg p-3">
                <p className="font-medium text-gray-800 text-sm">
                  {typeof c.lesson === "string" ? "Lesson" : c.lesson.title}
                </p>
                <p className="text-sm text-gray-600">
                  {formatScheduleDateTime(c.currentScheduledDate)} &rarr;{" "}
                  {c.requestedScheduledDate ? formatScheduleDateTime(c.requestedScheduledDate) : "-"}
                </p>
                {c.reason && <p className="text-xs text-gray-500 mt-1">Tutor's note: {c.reason}</p>}
                {rejectingConfirmationId === c.id ? (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <input
                      placeholder="Reason for rejecting"
                      value={confirmationRejectReason}
                      onChange={(e) => setConfirmationRejectReason(e.target.value)}
                      className="border rounded-md px-2 py-1 text-xs flex-1 min-w-[10rem]"
                    />
                    <button
                      onClick={() => handleConfirmTutorReschedule(c.id, false, confirmationRejectReason)}
                      className="bg-red-600 text-white rounded-md px-3 py-1 text-xs hover:bg-red-700"
                    >
                      Confirm reject
                    </button>
                    <button
                      onClick={() => setRejectingConfirmationId(null)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Back
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirmTutorReschedule(c.id, true)}
                      className="bg-green-600 text-white rounded-md px-3 py-1 text-xs hover:bg-green-700"
                    >
                      Confirm new time
                    </button>
                    <button
                      onClick={() => setRejectingConfirmationId(c.id)}
                      className="border border-red-300 text-red-600 rounded-md px-3 py-1 text-xs hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Your Children's Classes</h3>
        {message && <p className="text-sm text-blue-600 mb-3">{message}</p>}

        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading schedule...</p>
        ) : visibleRows.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            {rows.length === 0
              ? "No classes scheduled yet. Once a child is enrolled in a course and their tutor schedules a session, it will show up here."
              : "No classes scheduled for this child yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  {isAllSelected && <th className="py-2 text-left">Child</th>}
                  <th className="py-2 text-left">Course</th>
                  <th className="py-2 text-left">Lesson</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ lesson, course, childName }) => (
                  <Fragment key={lesson.id}>
                    <tr className="border-b">
                      {isAllSelected && <td className="py-3">{childName}</td>}
                      <td className="py-3">{course.title}</td>
                      <td className="py-3">{lesson.title}</td>
                      <td className="py-3">{formatScheduleDateTime(lesson.scheduledDate)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lesson.status === LessonStatus.COMPLETED
                              ? "bg-green-100 text-green-600"
                              : lesson.status === LessonStatus.CANCELLED
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {lesson.status}
                        </span>
                      </td>
                      <td className="py-3 space-x-3">
                        {lesson.status === LessonStatus.SCHEDULED && (
                          <JoinClassLink
                            lessonId={lesson.id}
                            scheduledDate={lesson.scheduledDate}
                            durationMinutes={lesson.durationMinutes}
                            className="text-green-600 hover:underline font-medium"
                            label="Join Class"
                          />
                        )}
                        {lesson.status === LessonStatus.SCHEDULED && (
                          <>
                            <button
                              className="text-gray-600 hover:underline"
                              onClick={() => openReschedule(lesson, course)}
                            >
                              Reschedule
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => {
                                setRescheduleLessonId(null);
                                setCancelLessonId(cancelLessonId === lesson.id ? null : lesson.id);
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {rescheduleLessonId === lesson.id && (
                      <tr className="border-b bg-gray-50">
                        <td colSpan={isAllSelected ? 6 : 5} className="py-3 px-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="datetime-local"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Reason (required)"
                              value={rescheduleReason}
                              onChange={(e) => setRescheduleReason(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm flex-1 min-w-[12rem]"
                            />
                            <button
                              onClick={() => handleRequestReschedule(lesson.id, lesson.scheduledDate, lesson.durationMinutes)}
                              disabled={!rescheduleReason.trim()}
                              className="bg-blue-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                              Submit request
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            The new time always needs admin confirmation with the tutor.
                            {isInsideRescheduleGate(lesson.scheduledDate) &&
                              " This class starts within 24 hours, so it will be flagged urgent."}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tutor&apos;s available times: {formatAvailability(tutorAvailability)}
                          </p>
                        </td>
                      </tr>
                    )}
                    {cancelLessonId === lesson.id && (
                      <tr className="border-b bg-gray-50">
                        <td colSpan={isAllSelected ? 6 : 5} className="py-3 px-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder="Reason (required)"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm flex-1 min-w-[12rem]"
                            />
                            <button
                              onClick={() => handleCancel(lesson.id, lesson.scheduledDate)}
                              disabled={!cancelReason.trim()}
                              className="bg-red-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm cancellation
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isInsideRescheduleGate(lesson.scheduledDate)
                              ? "This class starts within 24 hours, so cancelling now needs admin approval before it's final."
                              : "24 hours or more out, so this cancels immediately."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
