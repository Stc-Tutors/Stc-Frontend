"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const data = [
  { name: "Sun", views: 100000, comments: 50000 },
  { name: "Mon", views: 95000, comments: 20000 },
  { name: "Tue", views: 80000, comments: 60000 },
  { name: "Wed", views: 70000, comments: 10000 },
  { name: "Thu", views: 50000, comments: 70000 },
  { name: "Fri", views: 45000, comments: 30000 },
  { name: "Sat", views: 110000, comments: 15000 },
];

export default function PerformanceChart() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <h3 className="font-semibold text-gray-800 mb-3">Course Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(tick) => `${tick / 1000}k`} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="comments"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
