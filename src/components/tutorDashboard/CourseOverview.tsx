"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Week 1", converted: 300, visits: 400 },
  { name: "Week 2", converted: 450, visits: 420 },
  { name: "Week 3", converted: 350, visits: 500 },
  { name: "Week 4", converted: 500, visits: 470 },
];

export default function CourseOverviewChart() {
  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="converted" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="visits" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
