"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { GetMyCoursesAction } from "@/server/course";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson } from "@/types/lesson";
import { formatScheduleTime } from "@/lib/datetime";
import { WEEKDAYS_SUNDAY_FIRST_ABBREVIATED } from "@/constants/weekdays";

interface Row {
  lesson: Lesson;
  course: Course;
}

export default function CalendarPreview() {
  const days = WEEKDAYS_SUNDAY_FIRST_ABBREVIATED;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lessons, setLessons] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const dates = Array.from({ length: startDay + totalDays }, (_, index) => {
    const date = index - startDay + 1;
    return date > 0 ? new Date(year, month, date) : null;
  });

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) => selectedDate && date.toDateString() === selectedDate.toDateString();
  const hasLesson = (date: Date) =>
    lessons.some((row) => new Date(row.lesson.scheduledDate).toDateString() === date.toDateString());

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    const load = async () => {
      const [coursesRes] = await GetMyCoursesAction();
      const courses = coursesRes?.data ?? [];

      const lessonLists = await Promise.all(courses.map((c) => GetCourseLessonsAction(c.id)));

      const allRows: Row[] = [];
      lessonLists.forEach(([res], i) => {
        (res?.data ?? []).forEach((lesson) => allRows.push({ lesson, course: courses[i] }));
      });

      setLessons(allRows);
      setIsLoading(false);
    };
    load();
  }, []);

  const selectedDayLessons = selectedDate
    ? lessons.filter((row) => new Date(row.lesson.scheduledDate).toDateString() === selectedDate.toDateString())
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => handleMonthChange(-1)} className="p-1.5 rounded hover:bg-gray-100 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => handleMonthChange(1)} className="p-1.5 rounded hover:bg-gray-100 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-y-2 text-sm">
        {dates.map((dateObj, idx) => (
          <div key={idx} className="flex items-center justify-center h-8">
            {dateObj ? (
              <div
                onClick={() => setSelectedDate(dateObj)}
                className={`relative w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition
                  ${
                    isSelected(dateObj)
                      ? "bg-blue-500 text-white"
                      : isToday(dateObj)
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {dateObj.getDate()}
                {hasLesson(dateObj) && !isSelected(dateObj) && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange-500" />
                )}
              </div>
            ) : (
              <div className="w-7 h-7" />
            )}
          </div>
        ))}
      </div>

      {/* Selected Date Preview */}
      {selectedDate && (
        <div className="mt-4 border-t pt-3">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{selectedDate.toDateString()}</span>
          </p>
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
    </div>
  );
}
