"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson } from "@/types/lesson";
import { formatScheduleTime } from "@/lib/datetime";

interface Row {
  lesson: Lesson;
  course: Course;
}

export default function ParentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lessons, setLessons] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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

      const allRows: Row[] = [];
      lessonLists.forEach(([res], i) => {
        const courseId = Array.from(courses.keys())[i];
        const course = courses.get(courseId)!;
        (res?.data ?? []).forEach((lesson) => allRows.push({ lesson, course }));
      });

      setLessons(allRows);
      setIsLoading(false);
    };
    load();
  }, []);

  const hasLesson = (date: Date) =>
    lessons.some((row) => new Date(row.lesson.scheduledDate).toDateString() === date.toDateString());

  const selectedDayLessons = selectedDate
    ? lessons.filter((row) => new Date(row.lesson.scheduledDate).toDateString() === selectedDate.toDateString())
    : [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-blue-500" />
          <CardTitle>
            {monthNames[month]} {year}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-200">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNextMonth} className="p-1 rounded hover:bg-gray-200">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d} className="text-gray-500 py-2">
              {d}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isToday = isCurrentMonth && day === today.getDate();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`relative py-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold"
                    : isToday
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day}
                {hasLesson(date) && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 border-t pt-3">
            <p className="text-sm text-gray-600 mb-2 font-medium">{selectedDate.toDateString()}</p>
            {isLoading ? (
              <p className="text-xs text-gray-400">Loading...</p>
            ) : selectedDayLessons.length === 0 ? (
              <p className="text-xs text-gray-400">No classes on this day.</p>
            ) : (
              <ul className="space-y-1">
                {selectedDayLessons.map(({ lesson, course }) => (
                  <li key={lesson.id} className="text-xs text-gray-700">
                    <span className="font-medium">{course.title}</span> — {lesson.title} (
                    {formatScheduleTime(lesson.scheduledDate)})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
