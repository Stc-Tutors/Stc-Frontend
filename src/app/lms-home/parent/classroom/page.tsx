"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LibraryBig } from "lucide-react";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";
import { formatScheduleDateTime } from "@/lib/datetime";
import NextClassBanner from "@/components/classroom/NextClassBanner";

interface Row {
  lesson: Lesson;
  course: Course;
  childName: string;
}

export default function ParentClassroomPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [childrenRes] = await GetLinkedStudentsAction();
      const children = childrenRes?.data ?? [];

      const allRows: Row[] = [];
      for (const child of children) {
        const [courseEnrollmentsRes] = await GetStudentCoursesAction(child.id);
        const courses = (courseEnrollmentsRes?.data ?? [])
          .map((e) => (typeof e.course === "string" ? null : e.course))
          .filter((c): c is Course => !!c);

        const lessonLists = await Promise.all(courses.map((c) => GetCourseLessonsAction(c.id)));
        lessonLists.forEach(([res], i) => {
          (res?.data ?? []).forEach((lesson) => allRows.push({ lesson, course: courses[i], childName: child.fullName }));
        });
      }

      allRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
      setRows(allRows);
      setIsLoading(false);
    })();
  }, []);

  const upcoming = rows.filter((r) => r.lesson.status === LessonStatus.SCHEDULED);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/lms-home/parent/dashboard")}
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
          <NextClassBanner
            rows={rows.map((r) => ({ lesson: r.lesson, label: `${r.childName} · ${r.course.title} · ${r.lesson.title}` }))}
          />

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Upcoming lessons</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No upcoming lessons scheduled.</p>
            ) : (
              <ul className="divide-y">
                {upcoming.map(({ lesson, course, childName }) => (
                  <li key={lesson.id} className="py-3">
                    <p className="font-medium text-gray-800">{childName} · {course.title} · {lesson.title}</p>
                    <p className="text-sm text-gray-500">{formatScheduleDateTime(lesson.scheduledDate)}</p>
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
