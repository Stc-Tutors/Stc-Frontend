"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";

interface CourseProgressChartProps {
  studentId?: string;
}

interface Row {
  title: string;
  progress: number;
  status: CourseEnrollmentStatus;
}

export default function CourseProgressChart({ studentId }: CourseProgressChartProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setRows([]);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      const [res] = await GetStudentCoursesAction(studentId);
      const enrollments = res?.data ?? [];
      setRows(
        enrollments.map((e) => ({
          title: typeof e.course === "string" ? "Course" : e.course.title,
          progress: e.progressPercent,
          status: e.status,
        }))
      );
      setIsLoading(false);
    };
    load();
  }, [studentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
        <p className="text-gray-500 text-sm mt-1">How far along the selected child is in each enrolled course</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view course progress.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No enrolled courses yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 50)}>
            <BarChart data={rows} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(t) => `${t}%`} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="title" width={160} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Progress"]} />
              <Bar dataKey="progress" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
