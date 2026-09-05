"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetStudentAttendanceAction } from "@/server/attendance";
import { Attendance, AttendanceStatus } from "@/types/attendance";

interface AttendanceTrendChartProps {
  studentId?: string;
}

// ISO 8601 week key (Mon-Sun), so trend buckets line up regardless of which
// day of the week a session fell on.
function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default function AttendanceTrendChart({ studentId }: AttendanceTrendChartProps) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setRecords([]);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      const [res] = await GetStudentAttendanceAction(studentId);
      setRecords(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, [studentId]);

  const byWeek = new Map<string, { present: number; total: number }>();
  records.forEach((r) => {
    const key = weekKey(new Date(r.date));
    const bucket = byWeek.get(key) ?? { present: 0, total: 0 };
    bucket.total += 1;
    if (r.status === AttendanceStatus.PRESENT) bucket.present += 1;
    byWeek.set(key, bucket);
  });
  const chartData = Array.from(byWeek.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-10)
    .map(([week, { present, total }]) => ({ week: week.slice(6), rate: Math.round((present / total) * 100) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trend</CardTitle>
        <p className="text-gray-500 text-sm mt-1">Weekly attendance rate over the last few months</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view their attendance trend.</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Not enough attendance data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} label={{ value: "Week", position: "insideBottom", offset: -5, fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(t) => `${t}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Attendance rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
