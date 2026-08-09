"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import { GetLinkedStudentsAction, GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { formatScheduleTime } from "@/lib/datetime";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson } from "@/types/lesson";

interface Row {
  lesson: Lesson;
  course: Course;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function TodayLectures() {
  const [rows, setRows] = useState<Row[]>([]);
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

      const todayRows: Row[] = [];
      lessonLists.forEach(([res], i) => {
        const courseId = Array.from(courses.keys())[i];
        const course = courses.get(courseId)!;
        (res?.data ?? [])
          .filter((lesson) => isToday(lesson.scheduledDate))
          .forEach((lesson) => todayRows.push({ lesson, course }));
      });

      todayRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
      setRows(todayRows);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <h3 className="font-semibold text-gray-800">Today's Lectures</h3>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No classes scheduled for today.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(({ lesson, course }) => (
            <div key={lesson.id} className="flex items-center gap-3 border rounded-lg p-3">
              <CalendarClock className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{course.title}</p>
                <p className="text-xs text-gray-500">{lesson.title}</p>
              </div>
              <span className="text-xs text-gray-600">
                {formatScheduleTime(lesson.scheduledDate)}
              </span>
              {lesson.meetingUrl && (
                <JoinClassLink
                  lessonId={lesson.id}
                  scheduledDate={lesson.scheduledDate}
                  durationMinutes={lesson.durationMinutes}
                  className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md px-2 py-1"
                  label="Join"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
