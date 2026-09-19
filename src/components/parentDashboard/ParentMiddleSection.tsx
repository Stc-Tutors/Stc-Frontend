"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ParentCalendar from "./parentCalendar";
import TodayLectures from "../studentDashboard/TodayLecture";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetNotificationsAction } from "@/server/notification";
import { Notification } from "@/types/notification";
import { groupStudentsByChild, matchesSelectedStudent, useSelectedStudent } from "@/contexts/selected-student-context";

interface ChildProgress {
  name: string;
  progress: number;
}

export default function ParentMiddleSection() {
  const { selectedId, isAllSelected } = useSelectedStudent();
  const [data, setData] = useState<ChildProgress[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const allStudents = [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])];
      const filtered = isAllSelected ? allStudents : allStudents.filter((s) => matchesSelectedStudent(s, selectedId));

      // Group by physical child (not by enrollment) so a child with 3 course
      // enrollments contributes ONE averaged bar, not 3 identically-named ones.
      const groups = groupStudentsByChild(filtered);
      const courseEnrollmentLists = await Promise.all(
        groups.map((g) => Promise.all(g.enrollments.map((s) => GetStudentCoursesAction(s.id))))
      );

      setData(
        groups.map((g, i) => {
          const enrollments = courseEnrollmentLists[i].flatMap(([res]) => res?.data ?? []);
          const avg =
            enrollments.length === 0
              ? 0
              : Math.round(enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrollments.length);
          return { name: g.fullName, progress: avg };
        })
      );

      const [notificationsRes] = await GetNotificationsAction();
      setNotifications((notificationsRes?.data ?? []).slice(0, 3));

      setIsLoading(false);
    };
    load();
  }, [selectedId, isAllSelected]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* LEFT — PERFORMANCE OVERVIEW */}
      <div className="space-y-6 lg:col-span-2">
      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Performance Overview</CardTitle>
          <p className="text-sm text-gray-500">
            {isAllSelected ? "Avg. course progress by child" : "Avg. course progress"}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-gray-500">No enrolled children yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Progress"]} />
                <Bar dataKey="progress" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
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
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
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
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => (window.location.href = "/lms-home/parent/messages")}
            >
              Message Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
