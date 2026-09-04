"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GetRevenueReportAction, ListStudentsForAdminAction } from "@/server/admin";
import { ListAllPayoutRequestsAction } from "@/server/payout";
import { RevenuePoint } from "@/types/admin";
import { PayoutRequest, PayoutRequestStatus } from "@/types/payout";
import { EnrollmentStatus, Student } from "@/types/student";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

function quarterLabel(dateStr: string) {
  const d = new Date(dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()} Q${q}`;
}

export default function AdminFinancePage() {
  const { hasPermission } = useUser();
  const canViewFinancialReports = hasPermission(AdminPermission.VIEW_FINANCIAL_REPORTS);

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canViewFinancialReports) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      const [revenueRes] = await GetRevenueReportAction();
      setRevenue(revenueRes?.data ?? []);

      const [payoutsRes] = await ListAllPayoutRequestsAction(PayoutRequestStatus.PAID);
      setPayouts(payoutsRes?.data ?? []);

      const [studentsRes] = await ListStudentsForAdminAction({ limit: 100 });
      setPendingStudents(
        (studentsRes?.data ?? []).filter(
          (s) =>
            s.enrollmentStatus === EnrollmentStatus.PENDING ||
            s.enrollmentStatus === EnrollmentStatus.PENDING_PARENT_CONFIRMATION
        )
      );

      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewFinancialReports]);

  const quarterlyProfit = (() => {
    const buckets = new Map<string, { revenue: number; expenses: number }>();
    const ensure = (key: string) => {
      if (!buckets.has(key)) buckets.set(key, { revenue: 0, expenses: 0 });
      return buckets.get(key)!;
    };
    for (const point of revenue) ensure(quarterLabel(point.date)).revenue += point.total;
    for (const p of payouts) {
      if (p.paidAt) ensure(quarterLabel(p.paidAt)).expenses += p.amount;
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-4)
      .map(([label, b]) => ({ label, profit: b.revenue - b.expenses }));
  })();

  const totalExpenses = payouts.reduce((sum, p) => sum + p.amount, 0);

  if (!canViewFinancialReports) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-sm text-gray-500">
          You don&apos;t have permission to view financial reports. Contact a Super Admin if you need access.
        </p>
      </div>
    );
  }

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading finance data...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold mb-1">Balance Analytics</h1>
        <p className="text-sm text-gray-500 mb-4">Revenue collected over time</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₦${v.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">Pending / Unconfirmed Enrollments</h2>
          {pendingStudents.length === 0 ? (
            <p className="text-sm text-gray-500">None pending.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b">
                  <th className="py-2">Student</th>
                  <th>Parent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.slice(0, 8).map((s) => (
                  <tr key={s.id} className="border-b last:border-none">
                    <td className="py-2">{s.fullName}</td>
                    <td>{s.parentName || "—"}</td>
                    <td className="text-amber-600">{s.enrollmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">School Expenses (Tutor Payouts)</h2>
          <p className="text-2xl font-bold mb-3">₦{totalExpenses.toLocaleString()}</p>
          {payouts.length === 0 ? (
            <p className="text-sm text-gray-500">No payouts made yet.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b">
                  <th className="py-2">Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payouts.slice(0, 8).map((p) => (
                  <tr key={p.id} className="border-b last:border-none">
                    <td className="py-2">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</td>
                    <td>₦{p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Quarterly Profit Report</h2>
        {quarterlyProfit.length === 0 ? (
          <p className="text-sm text-gray-500">Not enough data yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quarterlyProfit.map((q) => (
              <div key={q.label} className="border rounded-lg p-4 text-center">
                <p className="text-xl font-bold text-gray-900">₦{q.profit.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{q.label} Net Profit</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
