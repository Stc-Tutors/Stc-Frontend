"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetMySpendingSummaryAction } from "@/server/payment";
import { SpendingSummary } from "@/types/payment";

interface BillingSummaryPanelProps {
  studentId?: string;
}

export default function BillingSummaryPanel({ studentId }: BillingSummaryPanelProps) {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMySpendingSummaryAction();
      setSummary(res?.data ?? null);
      setIsLoading(false);
    };
    load();
  }, []);

  const chartData = (summary?.byMonth ?? []).map((m) => ({ month: m.month, total: m.total }));
  const selectedChildSpend = summary?.byChild.find((c) => c.studentId === studentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Spending</CardTitle>
        <p className="text-gray-500 text-sm mt-1">What you've paid across all your children, over time</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !summary || summary.totalSpent === 0 ? (
          <p className="text-sm text-gray-500">No payments recorded yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-2xl font-semibold text-gray-800">
                  {summary.currency} {summary.totalSpent.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total spent, all-time</p>
              </div>
              {selectedChildSpend && (
                <div>
                  <p className="text-2xl font-semibold text-gray-800">
                    {summary.currency} {selectedChildSpend.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Spent on {selectedChildSpend.studentName}</p>
                </div>
              )}
            </div>

            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${summary.currency} ${value.toLocaleString()}`, "Spent"]} />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {summary.byChild.length > 1 && (
              <div className="divide-y">
                {summary.byChild.map((c) => (
                  <div
                    key={c.studentId ?? c.studentName}
                    className={`flex justify-between py-2 text-sm ${c.studentId === studentId ? "font-semibold text-blue-700" : "text-gray-700"}`}
                  >
                    <span>{c.studentName}</span>
                    <span>
                      {summary.currency} {c.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
