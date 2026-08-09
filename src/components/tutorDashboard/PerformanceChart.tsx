"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { GetMyPerformanceAction } from "@/server/lesson";
import { TutorPerformanceWeek } from "@/types/lesson";

export default function PerformanceChart() {
  const [data, setData] = useState<TutorPerformanceWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyPerformanceAction(8);
      setData(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <h3 className="font-semibold text-gray-800 mb-3">Performance</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">Once you start teaching, your weekly performance will show up here.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="weekStart" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="count" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis yAxisId="percent" orientation="right" domain={[0, 100]} tickFormatter={(t) => `${t}%`} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="count" type="monotone" dataKey="completed" name="Completed sessions" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line yAxisId="count" type="monotone" dataKey="cancelled" name="Cancelled sessions" stroke="#f97316" strokeWidth={2} dot={false} />
            <Line yAxisId="count" type="monotone" dataKey="hours" name="Hours taught" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line yAxisId="percent" type="monotone" dataKey="attendanceRate" name="Attendance %" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
