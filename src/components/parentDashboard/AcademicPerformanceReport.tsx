"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

const subjectData = [
  { subject: "English", Parent: 78, Student: 85 },
  { subject: "Math", Parent: 82, Student: 88 },
  { subject: "Science", Parent: 76, Student: 80 },
  { subject: "History", Parent: 90, Student: 92 },
  { subject: "Arts", Parent: 70, Student: 75 },
];

const gradeTrendData = [
  { month: "Jan", Parent: 80, Student: 84 },
  { month: "Feb", Parent: 82, Student: 85 },
  { month: "Mar", Parent: 76, Student: 83 },
  { month: "Apr", Parent: 79, Student: 86 },
  { month: "May", Parent: 83, Student: 88 },
];

export default function AcademicPerformanceReport() {
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <CardTitle>Academic Performance Report</CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Overview of student academic progress this semester
          </p>
        </div>

        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <select className="border rounded-md px-3 py-2 text-sm focus:outline-none">
            <option>Current Semester</option>
            <option>Previous Semester</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4">
            Export Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Chart */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Parent"
                stroke="#8884d8"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Student"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Trend Chart */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Grade Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={gradeTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Parent"
                stroke="#FF7B00"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Student"
                stroke="#00B5FF"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
