"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ParentCalendar from "./parentCalendar";
import TodayLectures from "../studentDashboard/TodayLecture";

const data = [
  { name: "Mon", performance: 65 },
  { name: "Tue", performance: 75 },
  { name: "Wed", performance: 60 },
  { name: "Thu", performance: 80 },
  { name: "Fri", performance: 70 },
  { name: "Sat", performance: 85 },
  { name: "Sun", performance: 78 },
];

export default function ParentMiddleSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* LEFT — PERFORMANCE OVERVIEW */}
      <div className="space-y-6 lg:col-span-2">
      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Performance Overview</CardTitle>
          <p className="text-sm text-gray-500">This Month</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Today’s Lecture */}
        <TodayLectures />
      </div>

      {/* RIGHT — CALENDAR + NOTIFICATIONS + HELP */}
      <div className="space-y-6">
        {/* Calendar */}
        <ParentCalendar/>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Mathematics lesson completed successfully",
              "New payment confirmation available",
              "Upcoming class reminder for Science Track",
            ].map((n, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">{n}</p>
                  <p className="text-xs text-gray-400 mt-1">2 hrs ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="bg-gray-50 border border-gray-200">
          <CardHeader className="flex items-center gap-2">
            <HelpCircle className="text-blue-600" />
            <CardTitle className="text-gray-700">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Having trouble with your dashboard or a course?  
              Our support team is here for assistance.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Message Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
