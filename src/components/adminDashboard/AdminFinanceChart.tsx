"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GetRevenueReportAction } from "@/server/admin";
import { RevenuePoint } from "@/types/admin";

export default function AdminFinanceChart() {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetRevenueReportAction();
      setData(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">School Finance</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">No revenue recorded yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₦${v.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="total" stroke="#22c55e" fill="#bbf7d0" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
