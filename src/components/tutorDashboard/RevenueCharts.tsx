"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { GetMyEarningsTimeSeriesAction } from "@/server/payout";

interface MonthTotal {
  name: string;
  value: number;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return `${MONTH_LABELS[(m ?? 1) - 1]} '${String(year).slice(2)}`;
}

export default function RevenueChart() {
  const [data, setData] = useState<MonthTotal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetMyEarningsTimeSeriesAction(12).then(([res]) => {
      setData((res?.data ?? []).map((point) => ({ name: formatMonth(point.month), value: point.total })));
      setIsLoading(false);
    });
  }, []);

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Earnings (last 12 months)</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">No paid-out earnings yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => [`₦${value.toLocaleString()}`, "Paid"]} />
            <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
