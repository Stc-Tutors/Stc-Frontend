"use client";

import { useEffect, useState } from "react";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson } from "@/types/lesson";
import { formatScheduleTime } from "@/lib/datetime";
import { WEEKDAYS_ABBREVIATED } from "@/constants/weekdays";

interface Row {
  lesson: Lesson;
  course: Course;
}

const DAY_COLORS = [
  "bg-blue-100 text-blue-600 border-l-4 border-blue-400",
  "bg-green-100 text-green-600 border-l-4 border-green-400",
  "bg-yellow-100 text-yellow-600 border-l-4 border-yellow-400",
  "bg-red-100 text-red-600 border-l-4 border-red-400",
  "bg-purple-100 text-purple-600 border-l-4 border-purple-400",
];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Timetable() {
  const days = WEEKDAYS_ABBREVIATED.slice(0, 5);
  const [rowsByDay, setRowsByDay] = useState<Record<string, Row[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const byId = new Map<string, true>();
      [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])].forEach((s) => byId.set(s.id, true));

      const courseEnrollmentLists = await Promise.all(
        Array.from(byId.keys()).map((id) => GetStudentCoursesAction(id))
      );

      const courses = new Map<string, Course>();
      courseEnrollmentLists.forEach(([res]) => {
        (res?.data ?? []).forEach((e) => {
          if (typeof e.course !== "string") courses.set(e.course.id, e.course);
        });
      });

      const lessonLists = await Promise.all(
        Array.from(courses.keys()).map((courseId) => GetCourseLessonsAction(courseId))
      );

      const weekStart = startOfWeek(new Date());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const grouped: Record<string, Row[]> = {};
      days.forEach((d) => (grouped[d] = []));

      lessonLists.forEach(([res], i) => {
        const courseId = Array.from(courses.keys())[i];
        const course = courses.get(courseId)!;
        (res?.data ?? []).forEach((lesson) => {
          const date = new Date(lesson.scheduledDate);
          if (date >= weekStart && date < weekEnd) {
            const dayLabel = days[date.getDay() - 1];
            if (dayLabel) grouped[dayLabel].push({ lesson, course });
          }
        });
      });

      Object.values(grouped).forEach((rows) =>
        rows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime())
      );

      setRowsByDay(grouped);
      setIsLoading(false);
    };
    load();
  }, []);

  const hasAnyLessons = Object.values(rowsByDay).some((rows) => rows.length > 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-gray-800 mb-4">Time Table</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : !hasAnyLessons ? (
        <p className="text-sm text-gray-500">No classes scheduled this week.</p>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {days.map((day) => (
            <div key={day} className="space-y-2">
              <div className="font-medium text-gray-500 text-center">{day}</div>
              {(rowsByDay[day] ?? []).length === 0 ? (
                <div className="h-12" />
              ) : (
                rowsByDay[day].map(({ lesson, course }, idx) => (
                  <div
                    key={lesson.id}
                    className={`${DAY_COLORS[idx % DAY_COLORS.length]} p-2 rounded-md text-sm`}
                  >
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatScheduleTime(lesson.scheduledDate)}
                    </p>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
