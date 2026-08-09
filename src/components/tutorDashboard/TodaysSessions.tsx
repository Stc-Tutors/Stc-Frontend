"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Play, Square, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetMyCoursesAction, GetCourseStudentsAction } from "@/server/course";
import { GetCourseLessonsAction, ClockInLessonAction, ClockOutLessonAction, AddLessonCommentAction } from "@/server/lesson";
import { MarkAttendanceAction } from "@/server/attendance";
import { formatScheduleTime } from "@/lib/datetime";
import { Course } from "@/types/course";
import { Lesson } from "@/types/lesson";
import { CourseEnrollment } from "@/types/course-enrollment";
import { Student } from "@/types/student";
import { AttendanceStatus } from "@/types/attendance";

interface Row {
  lesson: Lesson;
  course: Course;
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function TodaysSessions() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [attendanceLessonId, setAttendanceLessonId] = useState<string | null>(null);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [markedStudentIds, setMarkedStudentIds] = useState<Set<string>>(new Set());

  const load = async () => {
    const [coursesRes] = await GetMyCoursesAction();
    const courses = coursesRes?.data ?? [];

    const lessonLists = await Promise.all(courses.map((c) => GetCourseLessonsAction(c.id)));

    const todayRows: Row[] = [];
    lessonLists.forEach(([res], i) => {
      (res?.data ?? [])
        .filter((lesson) => isToday(lesson.scheduledDate))
        .forEach((lesson) => todayRows.push({ lesson, course: courses[i] }));
    });

    todayRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
    setRows(todayRows);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleClockIn = async (id: string) => {
    const [, error] = await ClockInLessonAction(id);
    setMessage(error);
    load();
  };

  const handleClockOut = async (id: string) => {
    const [, error] = await ClockOutLessonAction(id);
    setMessage(error);
    load();
  };

  const handleSaveComment = async (id: string) => {
    const [, error] = await AddLessonCommentAction(id, comments[id] ?? "");
    setMessage(error || "Comment saved");
    load();
  };

  const toggleAttendance = async (row: Row) => {
    if (attendanceLessonId === row.lesson.id) {
      setAttendanceLessonId(null);
      return;
    }
    setAttendanceLessonId(row.lesson.id);
    setMarkedStudentIds(new Set());
    const [res] = await GetCourseStudentsAction(row.course.id);
    const enrollments = (res?.data ?? []) as CourseEnrollment[];
    setCourseStudents(
      enrollments
        .map((e) => (typeof e.student === "string" ? null : e.student))
        .filter((s): s is Student => !!s)
    );
  };

  const handleMarkAttendance = async (row: Row, studentId: string, status: AttendanceStatus) => {
    const [, error] = await MarkAttendanceAction({
      course: row.course.id,
      lesson: row.lesson.id,
      student: studentId,
      date: row.lesson.scheduledDate,
      status,
    });
    if (!error) {
      setMarkedStudentIds((prev) => new Set(prev).add(studentId));
    } else {
      setMessage(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <h3 className="font-semibold text-gray-800">Today's Sessions</h3>
      {message && <p className="text-sm text-blue-600">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No sessions scheduled for today.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const { lesson, course } = row;
            return (
              <div key={lesson.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      {lesson.title} ·{" "}
                      {formatScheduleTime(lesson.scheduledDate)}
                    </p>
                  </div>

                  {!lesson.actualStartTime ? (
                    <Button size="sm" onClick={() => handleClockIn(lesson.id)}>
                      <Play className="w-3.5 h-3.5 mr-1" /> Clock In
                    </Button>
                  ) : !lesson.actualEndTime ? (
                    <Button size="sm" variant="destructive" onClick={() => handleClockOut(lesson.id)}>
                      <Square className="w-3.5 h-3.5 mr-1" /> Clock Out
                    </Button>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                  )}
                </div>

                {lesson.actualStartTime && (
                  <>
                    <div className="flex gap-2 items-center pl-8">
                      <Input
                        placeholder="Add a comment about this session..."
                        defaultValue={lesson.tutorComments ?? ""}
                        onChange={(e) => setComments((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                        className="text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={() => handleSaveComment(lesson.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/lms-home/tutor/courses/${course.id}`)}>
                        Set Assignment
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleAttendance(row)}>
                        Attendance <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>

                    {attendanceLessonId === lesson.id && (
                      <div className="pl-8 space-y-2">
                        {courseStudents.length === 0 ? (
                          <p className="text-xs text-gray-500">No students enrolled in this course.</p>
                        ) : (
                          courseStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between text-sm border rounded-md p-2">
                              <span>{student.fullName}</span>
                              {markedStudentIds.has(student.id) ? (
                                <span className="text-xs text-green-600">Marked</span>
                              ) : (
                                <div className="flex gap-1">
                                  {Object.values(AttendanceStatus).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleMarkAttendance(row, student.id, status)}
                                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
