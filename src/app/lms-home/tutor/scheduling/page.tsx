"use client";

import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, CalendarSync } from "lucide-react";
import { useRouter } from "next/navigation";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import TutorsCard from "@/components/tutorDashboard/TutorsCard";
import { GetMyCoursesAction } from "@/server/course";
import { GetCourseLessonsAction, RescheduleLessonAction, CancelLessonAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import { isInsideRescheduleGate, isInsideTutorRescheduleGate } from "@/lib/schedule-gate";

interface Row {
  lesson: Lesson;
  course: Course;
}

export default function TutorSchedulePage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rescheduleLessonId, setRescheduleLessonId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelLessonId, setCancelLessonId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [coursesRes] = await GetMyCoursesAction();
    const courses = coursesRes?.data ?? [];

    const lessonLists = await Promise.all(courses.map((c) => GetCourseLessonsAction(c.id)));

    const allRows: Row[] = [];
    lessonLists.forEach(([res], i) => {
      (res?.data ?? []).forEach((lesson) => allRows.push({ lesson, course: courses[i] }));
    });

    allRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
    setRows(allRows);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleBack = () => {
    router.push(`/lms-home/tutor/dashboard`);
  };

  const handleReschedule = async (lessonId: string, scheduledDate: string) => {
    if (!newDate) {
      setMessage("Pick a new date and time first");
      return;
    }
    if (isInsideTutorRescheduleGate(scheduledDate)) {
      setMessage("Reschedule requests must be made at least 48 hours before the class");
      return;
    }
    const [, error] = await RescheduleLessonAction(lessonId, new Date(newDate).toISOString(), rescheduleReason || undefined);
    setMessage(error || "Reschedule request sent to admin - the parent will need to confirm the new time");
    if (!error) {
      setRescheduleLessonId(null);
      setNewDate("");
      setRescheduleReason("");
      load();
    }
  };

  const handleCancel = async (lessonId: string, scheduledDate: string) => {
    if (isInsideRescheduleGate(scheduledDate) && !cancelReason.trim()) {
      setMessage("A reason is required to cancel inside 24 hours of the class");
      return;
    }
    const [res, error] = await CancelLessonAction(lessonId, cancelReason || undefined);
    setMessage(
      error ||
        (res?.data?.applied ? "Lesson cancelled" : "Cancellation sent for admin review (inside 24 hours)")
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
        onClick={handleBack}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-1xl font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-3">
        <CalendarSync className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Schedule</h1>
      </div>

      <TutorsCard />

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Your Lessons</h3>
        {message && <p className="text-sm text-blue-600 mb-3">{message}</p>}

        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading your schedule...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No lessons scheduled yet. Once students enroll in your courses and you schedule lessons, they will show up here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="py-2 text-left">Course</th>
                  <th className="py-2 text-left">Lesson</th>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ lesson, course }) => (
                  <Fragment key={lesson.id}>
                    <tr className="border-b">
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
                        {lesson.meetingUrl && lesson.status === LessonStatus.SCHEDULED && (
                          <JoinClassLink
                            lessonId={lesson.id}
                            scheduledDate={lesson.scheduledDate}
                            durationMinutes={lesson.durationMinutes}
                            className="text-green-600 hover:underline font-medium"
                            label="Start Class"
                          />
                        )}
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => router.push(`/lms-home/tutor/courses/${course.id}`)}
                        >
                          View Course
                        </button>
                        {lesson.status === LessonStatus.SCHEDULED && (
                          <>
                            <button
                              className="text-gray-600 hover:underline"
                              onClick={() => {
                                setCancelLessonId(null);
                                setRescheduleLessonId(rescheduleLessonId === lesson.id ? null : lesson.id);
                              }}
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
                        <td colSpan={5} className="py-3 px-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="datetime-local"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Note for admin/parent (optional)"
                              value={rescheduleReason}
                              onChange={(e) => setRescheduleReason(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm flex-1 min-w-[12rem]"
                              disabled={isInsideTutorRescheduleGate(lesson.scheduledDate)}
                            />
                            <button
                              onClick={() => handleReschedule(lesson.id, lesson.scheduledDate)}
                              disabled={isInsideTutorRescheduleGate(lesson.scheduledDate)}
                              className="bg-blue-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                              Request reschedule
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isInsideTutorRescheduleGate(lesson.scheduledDate)
                              ? "This class starts within 48 hours - reschedule requests can't be made this close to the class."
                              : "Sent to admin for review, then to the parent to confirm - it only applies once the parent agrees."}
                          </p>
                        </td>
                      </tr>
                    )}
                    {cancelLessonId === lesson.id && (
                      <tr className="border-b bg-gray-50">
                        <td colSpan={5} className="py-3 px-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder={
                                isInsideRescheduleGate(lesson.scheduledDate)
                                  ? "Reason (required - inside 24 hours)"
                                  : "Reason (optional)"
                              }
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm flex-1 min-w-[12rem]"
                            />
                            <button
                              onClick={() => handleCancel(lesson.id, lesson.scheduledDate)}
                              className="bg-red-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-red-700"
                            >
                              Confirm cancellation
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isInsideRescheduleGate(lesson.scheduledDate)
                              ? "This class starts within 24 hours, so a reason is required and it goes to admin for review."
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
