"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GetCourseCompletionReportAction } from "@/server/admin";

export default function SchoolPerformanceChart() {
  const [data, setData] = useState<{ name: string; rate: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetCourseCompletionReportAction();
      setData((res?.data ?? []).slice(0, 8).map((c) => ({ name: c.courseTitle, rate: c.rate })));
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">School Performance</h3>
      <p className="text-xs text-gray-400 mb-2">Completion rate by course</p>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">No course data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis domain={[0, 100]} tickFormatter={(t) => `${t}%`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v}%`, "Completion rate"]} />
            <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
