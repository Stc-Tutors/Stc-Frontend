"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface WeekBucket {
  name: string;
  scheduled: number;
  completed: number;
}

export default function AnalyticsChart() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

      const courseIds = new Set<string>();
      courseEnrollmentLists.forEach(([res]) => {
        (res?.data ?? []).forEach((e) => {
          if (typeof e.course !== "string") courseIds.add((e.course as Course).id);
        });
      });

      const lessonLists = await Promise.all(
        Array.from(courseIds).map((courseId) => GetCourseLessonsAction(courseId))
      );

      setLessons(lessonLists.flatMap(([res]) => res?.data ?? []));
      setIsLoading(false);
    };
    load();
  }, []);

  const weeks = useMemo<WeekBucket[]>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const buckets: WeekBucket[] = [
      { name: "Week 1", scheduled: 0, completed: 0 },
      { name: "Week 2", scheduled: 0, completed: 0 },
      { name: "Week 3", scheduled: 0, completed: 0 },
      { name: "Week 4", scheduled: 0, completed: 0 },
      { name: "Week 5", scheduled: 0, completed: 0 },
    ];

    lessons.forEach((lesson) => {
      const date = new Date(lesson.scheduledDate);
      if (date.getFullYear() !== year || date.getMonth() !== selectedMonth) return;
      const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 4);
      buckets[weekIndex].scheduled += 1;
      if (lesson.status === LessonStatus.COMPLETED) buckets[weekIndex].completed += 1;
    });

    return buckets;
  }, [lessons, selectedMonth]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Course Performance</h3>
        <div className="relative inline-block text-left">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 border px-3 py-1.5 text-sm rounded-md hover:bg-gray-100"
          >
            {MONTHS[selectedMonth]}
            <ChevronDown className="w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 right-0 mt-2 w-32 max-h-64 overflow-y-auto bg-white border rounded-md shadow-md">
              {MONTHS.map((month, idx) => (
                <div
                  key={month}
                  onClick={() => {
                    setSelectedMonth(idx);
                    setDropdownOpen(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeks}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="scheduled" name="Scheduled lessons" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Completed lessons" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
