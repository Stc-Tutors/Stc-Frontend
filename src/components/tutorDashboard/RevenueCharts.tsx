"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { GetMyPayoutRequestsAction } from "@/server/payout";
import { PayoutRequestStatus } from "@/types/payout";

interface MonthTotal {
  name: string;
  value: number;
}

export default function RevenueChart() {
  const [data, setData] = useState<MonthTotal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyPayoutRequestsAction();
      const requests = res?.data ?? [];
      const paid = requests.filter((r) => r.status === PayoutRequestStatus.PAID && r.paidAt);

      const now = new Date();
      const buckets = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { name: d.toLocaleString("default", { month: "short" }), value: 0, key: `${d.getFullYear()}-${d.getMonth()}` };
      });

      paid.forEach((r) => {
        const d = new Date(r.paidAt!);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const bucket = buckets.find((b) => b.key === key);
        if (bucket) bucket.value += r.amount;
      });

      setData(buckets.map(({ name, value }) => ({ name, value })));
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue (last 6 months)</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
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
