"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CalendarX } from "lucide-react";
import TutorsCard from "@/components/tutorDashboard/TutorsCard";
import RevenueChart from "@/components/tutorDashboard/RevenueCharts";
import { GetMyCoursesAction } from "@/server/course";
import { GetMySessionStatsAction, GetMyTutorHoursAction } from "@/server/lesson";
import { Course, CourseStatus } from "@/types/course";
import { TutorHoursReport, TutorSessionStats } from "@/types/lesson";

export default function TutorAnalyticsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [hours, setHours] = useState<TutorHoursReport | null>(null);
  const [sessionStats, setSessionStats] = useState<TutorSessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [coursesRes] = await GetMyCoursesAction();
      const [hoursRes] = await GetMyTutorHoursAction();
      const [statsRes] = await GetMySessionStatsAction();
      // Excludes bookkeeping courses (1:1 tutoring assignments - see
      // Course.isBookkeeping) - this list is "courses you built", not every
      // Course document you happen to be attached to.
      setCourses((coursesRes?.data ?? []).filter((c) => !c.isBookkeeping));
      setHours(hoursRes?.data ?? null);
      setSessionStats(statsRes?.data ?? null);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <TutorsCard />

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Clocked Hours</h2>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !hours || hours.byCourse.length === 0 ? (
          <p className="text-sm text-gray-500">No clocked sessions yet.</p>
        ) : (
          <>
            <p className="text-2xl font-semibold text-gray-800 mb-3">{hours.totalHours} hrs total</p>
            <div className="space-y-2">
              {hours.byCourse.map((c) => (
                <div key={c.courseId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{c.courseTitle}</span>
                  <span className="font-medium">{c.hours} hrs</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarX className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Session Stats</h2>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !sessionStats || sessionStats.completed + sessionStats.cancelled + sessionStats.scheduled === 0 ? (
          <p className="text-sm text-gray-500">No sessions yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-semibold text-gray-800">{sessionStats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">{sessionStats.cancelled}</p>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">{sessionStats.scheduled}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
            <div>
              <p className={`text-2xl font-semibold ${sessionStats.cancellationRate > 15 ? "text-red-600" : "text-gray-800"}`}>
                {sessionStats.cancellationRate}%
              </p>
              <p className="text-sm text-gray-500">Cancellation rate</p>
            </div>
          </div>
        )}
      </div>

      <RevenueChart />

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500">You haven't created any courses yet.</p>
        ) : (
          <div className="divide-y">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
                onClick={() => router.push(`/lms-home/tutor/courses/${course.id}`)}
              >
                <div>
                  <p className="font-medium text-gray-800">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.category}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    course.status === CourseStatus.PUBLISHED
                      ? "bg-green-100 text-green-700"
                      : course.status === CourseStatus.DRAFT
                      ? "bg-gray-100 text-gray-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
