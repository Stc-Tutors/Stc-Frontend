"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const chartData = {
    January: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  February: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  March: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  April: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  May: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  June: [
    { name: "Sun", views: 100000, comments: 50000 },
    { name: "Mon", views: 95000, comments: 20000 },
    { name: "Tue", views: 80000, comments: 60000 },
    { name: "Wed", views: 70000, comments: 10000 },
    { name: "Thu", views: 50000, comments: 70000 },
    { name: "Fri", views: 45000, comments: 30000 },
    { name: "Sat", views: 110000, comments: 15000 },
  ],
  July: [
    { name: "Sun", views: 120000, comments: 65000 },
    { name: "Mon", views: 90000, comments: 30000 },
    { name: "Tue", views: 70000, comments: 50000 },
    { name: "Wed", views: 80000, comments: 20000 },
    { name: "Thu", views: 60000, comments: 40000 },
    { name: "Fri", views: 75000, comments: 35000 },
    { name: "Sat", views: 105000, comments: 25000 },
  ],
  August: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  September: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  October: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  November: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
  December: [
    { name: "Sun", views: 80000, comments: 30000 },
    { name: "Mon", views: 72000, comments: 25000 },
    { name: "Tue", views: 68000, comments: 20000 },
    { name: "Wed", views: 76000, comments: 22000 },
    { name: "Thu", views: 82000, comments: 27000 },
    { name: "Fri", views: 79000, comments: 21000 },
    { name: "Sat", views: 91000, comments: 24000 },
  ],
};

type MonthKey = keyof typeof chartData;

export default function AnalyticsChart() {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>("July");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const months = Object.keys(chartData) as MonthKey[];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Course Performance</h3>
        <div className="relative inline-block text-left">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 border px-3 py-1.5 text-sm rounded-md hover:bg-gray-100"
          >
            This Month: {selectedMonth}
            <ChevronDown className="w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 right-0 mt-2 w-32 bg-white border rounded-md shadow-md">
              {months.map((month) => (
                <div
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month);
                    setDropdownOpen(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData[selectedMonth]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(tick) => `${tick / 1000}k`} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="comments"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
