"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, MinusCircle } from "lucide-react";

const data = [
  { week: "Week 1", Attendance: 65 },
  { week: "Week 2", Attendance: 70 },
  { week: "Week 3", Attendance: 60 },
  { week: "Week 4", Attendance: 100 },
  { week: "Week 5", Attendance: 85 },
  { week: "Week 6", Attendance: 78 },
];

export default function AttendanceRecord() {
  return (
    <Card className="w-full">
      {/* Header */}
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Attendance Record</CardTitle>
        <div className="flex items-center gap-3">
          <Select defaultValue="current">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Makeup
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 border rounded-lg p-4 bg-white">
          <h3 className="text-sm font-semibold mb-3">Monthly Attendance Review</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Attendance" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Section */}
        <div className="border rounded-lg p-5 bg-gray-50">
          <h3 className="text-sm font-semibold mb-3">Attendance Summary</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span>Present Session</span>
              <span className="text-green-600 font-semibold">48</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Absent Session</span>
              <span className="text-red-500 font-semibold">6</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Late Arrivals</span>
              <span className="text-yellow-500 font-semibold">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Attendance Rate</span>
              <span className="text-blue-600 font-semibold">97%</span>
            </div>
          </div>

          {/* This Week Section */}
          <h3 className="text-sm font-semibold mb-2">This Week</h3>
          <div className="flex items-center justify-between">
            {[
              { day: "Mon", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
              { day: "Tue", icon: <XCircle className="w-4 h-4 text-red-500" /> },
              { day: "Wed", icon: <Clock className="w-4 h-4 text-yellow-500" /> },
              { day: "Thu", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
              { day: "Fri", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
              { day: "Sat", icon: <MinusCircle className="w-4 h-4 text-gray-400" /> },
              { day: "Sun", icon: <MinusCircle className="w-4 h-4 text-gray-400" /> },
            ].map((item) => (
              <div key={item.day} className="flex flex-col items-center text-xs">
                {item.icon}
                <span className="text-gray-600">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
