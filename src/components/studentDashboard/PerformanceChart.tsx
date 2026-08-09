"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { Course } from "@/types/course";

interface CourseProgress {
  name: string;
  progress: number;
}

export default function PerformanceChart() {
  const [data, setData] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [enrollmentsRes] = await GetEnrollmentsAction();
      const studentId = enrollmentsRes?.data?.[0]?.id;
      if (!studentId) {
        setIsLoading(false);
        return;
      }

      const [courseEnrollmentsRes] = await GetStudentCoursesAction(studentId);
      const enrollments = courseEnrollmentsRes?.data ?? [];

      setData(
        enrollments
          .filter((e) => typeof e.course !== "string")
          .map((e) => ({
            name: (e.course as Course).title,
            progress: e.progressPercent,
          }))
      );
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <h3 className="font-semibold text-gray-800 mb-3">Course Performance</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">
          Enroll in a course to see your progress here.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
            <Tooltip formatter={(value: number) => [`${value}%`, "Progress"]} />
            <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
