"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle } from "rc-progress";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import { CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetLinkedStudentsAction, GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { formatScheduleTime } from "@/lib/datetime";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetNotificationsAction } from "@/server/notification";
import { Course, CourseTutor } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";

interface Row {
  lesson: Lesson;
  course: Course;
  studentId: string;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

// Composite "Today's Lecture" widget - merges what used to be two separate
// dashboard cards (TodayLecture's list + LessonProgress's ring) into one,
// matching the Figma layout. Kept as its own component (not a rewrite of
// TodayLecture.tsx/LessonProgress.tsx) since those two are still used as-is
// on the parent dashboard.
export default function TodayLectureCard() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [progress, setProgress] = useState(0);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const byId = new Map<string, true>();
      [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])].forEach((s) => byId.set(s.id, true));
      const studentIds = Array.from(byId.keys());

      const courseEnrollmentLists = await Promise.all(studentIds.map((id) => GetStudentCoursesAction(id)));

      const courseStudent = new Map<string, { course: Course; studentId: string }>();
      courseEnrollmentLists.forEach(([res], i) => {
        (res?.data ?? []).forEach((e) => {
          if (typeof e.course !== "string") {
            courseStudent.set(e.course.id, { course: e.course as Course, studentId: studentIds[i] });
          }
        });
      });

      const courseIds = Array.from(courseStudent.keys());
      const lessonLists = await Promise.all(courseIds.map((id) => GetCourseLessonsAction(id)));

      let allLessons: Lesson[] = [];
      const todayRows: Row[] = [];
      lessonLists.forEach(([res], i) => {
        const entry = courseStudent.get(courseIds[i])!;
        const lessons = res?.data ?? [];
        allLessons = allLessons.concat(lessons);
        lessons
          .filter((l) => isToday(l.scheduledDate))
          .forEach((lesson) => todayRows.push({ lesson, course: entry.course, studentId: entry.studentId }));
      });

      todayRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
      setRows(todayRows);

      if (allLessons.length > 0) {
        setProgress(
          Math.round((allLessons.filter((l) => l.status === LessonStatus.COMPLETED).length / allLessons.length) * 100)
        );
      }

      const [notificationsRes] = await GetNotificationsAction();
      setAnnouncement(notificationsRes?.data?.[0]?.body ?? null);

      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-3">
        <h3 className="font-semibold text-gray-800">Today's Lecture</h3>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No classes scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {rows.map(({ lesson, course, studentId }) => {
              const tutor = typeof course.tutor === "string" ? null : (course.tutor as CourseTutor);
              return (
                <div key={lesson.id} className="flex items-center gap-3 border rounded-lg p-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={tutor?.avatarUrl} alt={tutor?.firstName} />
                    <AvatarFallback>
                      {tutor?.firstName?.[0] ?? <CalendarClock className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <p className="text-xs text-gray-500 truncate">{lesson.title}</p>
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {formatScheduleTime(lesson.scheduledDate)}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {lesson.meetingUrl && (
                      <JoinClassLink
                        lessonId={lesson.id}
                        scheduledDate={lesson.scheduledDate}
                        durationMinutes={lesson.durationMinutes}
                        className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md px-2 py-1"
                        label="Join"
                      />
                    )}
                    <button
                      onClick={() => router.push(`/lms-home/student/clock-in/${lesson.id}?studentId=${studentId}`)}
                      className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md px-2 py-1"
                    >
                      Clock In
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {announcement && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs font-semibold text-gray-700 mb-1">Announcement</p>
            <p className="text-xs text-gray-600">{announcement}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <div className="relative w-[100px] h-[100px]">
          <Circle percent={progress} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
            {progress}%
          </div>
        </div>
        <p className="text-xs text-gray-500">Lessons</p>
      </div>
    </div>
  );
}
