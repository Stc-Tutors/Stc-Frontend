"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Aug 1", value: 8000 },
  { name: "Aug 8", value: 12000 },
  { name: "Aug 15", value: 9000 },
  { name: "Aug 22", value: 15000 },
];

export default function RevenueChart() {
  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
