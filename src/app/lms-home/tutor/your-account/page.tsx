"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Wallet, TrendingUp, MoreVertical } from "lucide-react";
import RevenueChart from "@/components/tutorDashboard/RevenueCharts";

/* ------------------- Dashboard Page ------------------- */
export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$13,804.00"
          icon={DollarSign}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Current Balance"
          value="$16,593.00"
          icon={Wallet}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Withdrawals"
          value="$13,184.00"
          icon={TrendingUp}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Today Revenue"
          value="$162.00"
          icon={CreditCard}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Chart + Withdraw Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="col-span-2">
        <RevenueChart />
        </Card>

        {/* Withdraw */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw your money</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <span className="font-medium">Visa **** 4855</span>
              <span className="text-sm text-gray-500">04/24</span>
            </div>
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <span className="font-medium">Mastercard **** 2855</span>
              <span className="text-sm text-gray-500">04/24</span>
            </div>
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <span className="font-medium">PayPal</span>
            </div>

            <p className="text-lg font-bold">$16,593.00</p>
            <p className="text-sm font-light">Current Balance</p>
            <button className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">
              Request Withdrawal
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory />
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- Reusable Stat Card ------------------- */
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="flex items-center p-4 gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </Card>
  );
}

/* ------------------- Transaction History ------------------- */
function TransactionHistory() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRefs.current.some(ref => ref?.contains(event.target as Node))) {
        return; // clicked inside
      }
      setOpenIndex(null); // clicked outside → close
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rows = [1, 2, 3, 4, 5]; // mock data

  return (
    <div className="bg-white rounded-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="py-2 px-4">Invoice</th>
            <th className="py-2 px-4">Method</th>
            <th className="py-2 px-4">Date</th>
            <th className="py-2 px-4">Location</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i, idx) => (
            <tr key={i} className="border-b text-sm">
              <td className="py-2 px-4">1234{i}</td>
              <td className="py-2 px-4">Visa</td>
              <td className="py-2 px-4">June 12 2025</td>
              <td className="py-2 px-4 text-blue-500">STC Tutors</td>
              <td className="py-2 px-4 text-orange-500">Pending</td>
              <td className="relative py-2 px-4">
                {/* Action Button */}
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown */}
                {openIndex === idx && (
                  <div
                    ref={(el) => {
                      dropdownRefs.current[idx] = el;
                    }}
                    className="absolute right-4 mt-2 w-32 bg-white border rounded shadow-md z-10"
                  >
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      Cancel
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}