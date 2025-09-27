"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 1200 },
  { month: "Feb", revenue: 2100 },
  { month: "Mar", revenue: 800 },
  { month: "Apr", revenue: 1600 },
  { month: "May", revenue: 2400 },
  { month: "Jun", revenue: 1900 },
];

export default function Revenue() {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Total & quick stats */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">$12,200</h2>
            <p className="text-sm text-gray-500">Total revenue this year</p>

            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="font-semibold">$2,400</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="font-semibold">$600</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="w-full lg:w-2/3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}