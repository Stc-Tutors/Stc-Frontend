"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { GetLessonsAdminAction } from "@/server/lesson";
import { Lesson, LessonCourseRef } from "@/types/lesson";
import { formatScheduleTime } from "@/lib/datetime";

export default function AdminCalendar() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
    lessons.some((l) => new Date(l.scheduledDate).toDateString() === date.toDateString());

  useEffect(() => {
    const load = async () => {
      const [res] = await GetLessonsAdminAction();
      setLessons(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  const selectedDayLessons = selectedDate
    ? lessons.filter((l) => new Date(l.scheduledDate).toDateString() === selectedDate.toDateString())
    : [];

  const courseTitle = (course: Lesson["course"]) => (typeof course === "string" ? course : (course as LessonCourseRef).title);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded hover:bg-gray-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-sm">
        {dates.map((dateObj, idx) => (
          <div key={idx} className="flex items-center justify-center h-8">
            {dateObj ? (
              <div
                onClick={() => setSelectedDate(dateObj)}
                className={`relative w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition
                  ${isSelected(dateObj) ? "bg-blue-500 text-white" : isToday(dateObj) ? "bg-blue-100 text-blue-600" : "text-gray-800 hover:bg-gray-100"}`}
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
              {selectedDayLessons.map((lesson) => (
                <li key={lesson.id} className="text-xs text-gray-700">
                  <span className="font-medium">{courseTitle(lesson.course)}</span> — {lesson.title} (
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
