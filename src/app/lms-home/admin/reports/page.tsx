"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetRevenueReportAction, GetAdminOverviewAction } from "@/server/admin";
import { RevenuePoint, AdminOverview } from "@/types/admin";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

export default function AdminReportsPage() {
  const { hasPermission } = useUser();
  // Revenue is a financial report - gated behind VIEW_FINANCIAL_REPORTS on the
  // backend (GET /admin/reports/revenue). Courses-by-status below is an
  // operational report open to any assigned admin, so it stays ungated.
  const canViewFinancialReports = hasPermission(AdminPermission.VIEW_FINANCIAL_REPORTS);

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (canViewFinancialReports) {
        const [revenueRes] = await GetRevenueReportAction();
        setRevenue(revenueRes?.data ?? []);
      }
      const [overviewRes] = await GetAdminOverviewAction();
      setOverview(overviewRes?.data ?? null);
      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewFinancialReports]);

  return (
    <div className="space-y-6">
      {canViewFinancialReports && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Over Time (Completed Payments)</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : revenue.length === 0 ? (
            <p className="text-sm text-gray-500">No completed payments recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {overview && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Courses by Status</h2>
          <div className="space-y-2">
            {Object.entries(overview.coursesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-gray-600">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
