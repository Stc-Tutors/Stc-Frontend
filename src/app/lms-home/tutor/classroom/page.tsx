"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LibraryBig } from "lucide-react";
import { GetMyCoursesAction } from "@/server/course";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import NextClassBanner from "@/components/classroom/NextClassBanner";

interface Row {
  lesson: Lesson;
  course: Course;
}

export default function TutorClassroomPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const upcoming = rows.filter((r) => r.lesson.status === LessonStatus.SCHEDULED);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/lms-home/tutor/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-3">
        <LibraryBig className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Classroom</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading your classroom...</p>
      ) : (
        <>
          <NextClassBanner rows={rows.map((r) => ({ lesson: r.lesson, label: `${r.course.title} · ${r.lesson.title}` }))} />

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Upcoming lessons</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No upcoming lessons scheduled.</p>
            ) : (
              <ul className="divide-y">
                {upcoming.map(({ lesson, course }) => (
                  <li key={lesson.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{course.title} · {lesson.title}</p>
                      <p className="text-sm text-gray-500">{formatScheduleDateTime(lesson.scheduledDate)}</p>
                    </div>
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => router.push(`/lms-home/tutor/courses/${course.id}`)}
                    >
                      View Course
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
