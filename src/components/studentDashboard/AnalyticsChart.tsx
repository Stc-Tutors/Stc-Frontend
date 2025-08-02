"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const monthlyData = {
  July: [
    { name: "Sun", views: 100000, comments: 50000 },
    { name: "Mon", views: 95000, comments: 20000 },
    { name: "Tue", views: 80000, comments: 60000 },
    { name: "Wed", views: 70000, comments: 10000 },
    { name: "Thu", views: 50000, comments: 70000 },
    { name: "Fri", views: 45000, comments: 30000 },
    { name: "Sat", views: 110000, comments: 15000 },
  ],
  June: [
    { name: "Sun", views: 70000, comments: 30000 },
    { name: "Mon", views: 80000, comments: 40000 },
    { name: "Tue", views: 65000, comments: 35000 },
    { name: "Wed", views: 60000, comments: 20000 },
    { name: "Thu", views: 50000, comments: 25000 },
    { name: "Fri", views: 40000, comments: 10000 },
    { name: "Sat", views: 90000, comments: 22000 },
  ],
};

export default function AnalyticsChart() {
  const [dataKey, setDataKey] = useState<"views" | "comments">("views");
  const [showMonths, setShowMonths] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<"July" | "June">("July");

  const toggleDropdown = () => setShowMonths(!showMonths);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      {/* Tabs and Dropdown */}
      <div className="flex justify-between items-center mb-4">
        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setDataKey("comments")}
            className={`text-sm px-3 py-1 rounded-full ${
              dataKey === "comments" ? "bg-orange-500 text-white" : "text-gray-500"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setDataKey("views")}
            className={`text-sm px-3 py-1 rounded-full ${
              dataKey === "views" ? "bg-blue-500 text-white" : "text-gray-500"
            }`}
          >
            Views
          </button>
        </div>

        {/* Month dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center text-sm text-gray-600 border px-3 py-1 rounded-md"
          >
            {selectedMonth}
            {showMonths ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
          </button>
          {showMonths && (
            <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-10">
              {Object.keys(monthlyData).map((month) => (
                <div
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month as "July" | "June");
                    setShowMonths(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData[selectedMonth]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(tick) => `${tick / 1000}k`} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={dataKey === "comments" ? "#f97316" : "#3b82f6"}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
