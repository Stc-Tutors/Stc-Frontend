"use client";

import { useEffect, useState } from "react";
import { PlayCircle, CheckSquare, Trophy, ArrowLeft } from "lucide-react";
import DownloadReport from "@/components/studentDashboard/DownloadReport";
import AnalyticsChart from "@/components/studentDashboard/AnalyticsChart";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetCourseAssignmentsAction } from "@/server/assignment";
import { GetStudentAttendanceAction } from "@/server/attendance";
import { GetMySubmissionsAction } from "@/server/submission";
import { GetNotificationsAction } from "@/server/notification";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import { LessonStatus } from "@/types/lesson";
import { AttendanceStatus } from "@/types/attendance";
import { Assignment } from "@/types/assignment";
import { Course } from "@/types/course";
import { Notification } from "@/types/notification";

interface ProgressCard {
  title: string;
  color: string;
  strokeColor: string;
  percent: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [counts, setCounts] = useState({ enrolled: 0, active: 0, completed: 0 });
  const [progress, setProgress] = useState<ProgressCard[]>([]);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [enrollmentsRes] = await GetEnrollmentsAction();
      const studentId = enrollmentsRes?.data?.[0]?.id;

      const [notificationsRes] = await GetNotificationsAction();
      setAnnouncements((notificationsRes?.data ?? []).slice(0, 3));

      if (!studentId) {
        setIsLoading(false);
        return;
      }

      const [courseEnrollmentsRes] = await GetStudentCoursesAction(studentId);
      const enrollments = courseEnrollmentsRes?.data ?? [];
      const courses = enrollments
        .map((e) => (typeof e.course === "string" ? null : (e.course as Course)))
        .filter((c): c is Course => !!c);

      setCounts({
        enrolled: enrollments.length,
        active: enrollments.filter((e) => e.status === CourseEnrollmentStatus.ACTIVE).length,
        completed: enrollments.filter((e) => e.status === CourseEnrollmentStatus.COMPLETED).length,
      });

      const [lessonLists, assignmentLists, [attendanceRes], [submissionsRes]] = await Promise.all([
        Promise.all(courses.map((c) => GetCourseLessonsAction(c.id))),
        Promise.all(courses.map((c) => GetCourseAssignmentsAction(c.id))),
        GetStudentAttendanceAction(studentId),
        GetMySubmissionsAction(),
      ]);

      const allLessons = lessonLists.flatMap(([res]) => res?.data ?? []);
      const allAssignments: Assignment[] = assignmentLists.flatMap(([res]) => res?.data ?? []);
      const attendance = attendanceRes?.data ?? [];
      const submissions = submissionsRes?.data ?? [];

      const lessonsPct =
        allLessons.length === 0
          ? 0
          : Math.round((allLessons.filter((l) => l.status === LessonStatus.COMPLETED).length / allLessons.length) * 100);

      const attendancePct =
        attendance.length === 0
          ? 0
          : Math.round(
              (attendance.filter((a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length /
                attendance.length) *
                100
            );

      const gradedSubmissions = submissions.filter((s) => typeof s.score === "number");
      const testPerformancePct =
        gradedSubmissions.length === 0
          ? 0
          : Math.round(
              gradedSubmissions.reduce((sum, s) => {
                const maxScore = typeof s.assignment === "string" ? 100 : s.assignment.maxScore || 100;
                return sum + ((s.score ?? 0) / maxScore) * 100;
              }, 0) / gradedSubmissions.length
            );

      const assignmentCompletionPct =
        allAssignments.length === 0 ? 0 : Math.round((submissions.length / allAssignments.length) * 100);

      setProgress([
        { title: "Lessons", color: "text-blue-500", strokeColor: "#3b82f6", percent: lessonsPct },
        { title: "Attendance Record", color: "text-orange-500", strokeColor: "#f97316", percent: attendancePct },
        { title: "Test Performance", color: "text-purple-500", strokeColor: "#a855f7", percent: testPerformancePct },
        { title: "Assignment Completion", color: "text-green-500", strokeColor: "#22c55e", percent: assignmentCompletionPct },
      ]);

      setIsLoading(false);
    };
    load();
  }, []);

  const cards = [
    { title: "Enrolled Courses", value: counts.enrolled, icon: PlayCircle, iconColor: "text-blue-500", bgColor: "bg-blue-100" },
    { title: "Active Courses", value: counts.active, icon: CheckSquare, iconColor: "text-purple-500", bgColor: "bg-purple-100" },
    { title: "Completed Courses", value: counts.completed, icon: Trophy, iconColor: "text-green-500", bgColor: "bg-green-100" },
  ];

  const handleBack = () => {
    router.push(`/lms-home/student/dashboard`);
  };

  return (
    <div className="p-6 space-y-6">
      {/**************************BACK**************************/}
      <button
        onClick={handleBack}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-1xl font-bold">BACK</span>
      </button>

      {/* Page Header */}
      <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>

      {/* All cards in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
          <div
            key={title}
            className={`flex items-center gap-4 p-4 rounded-lg shadow ${bgColor}`}
          >
            <div className="bg-white rounded-md p-3">
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">
                {isLoading ? "…" : value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
        ))}

        {/* Attendance Report Card */}
        <DownloadReport />
      </div>
      {/* ====== MIDDLE SECTION: Chart + Announcement ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart takes 2/3 width */}
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>

        {/* Announcement panel */}
        <Card className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Announcement</h3>
            <button
              onClick={() => router.push("/lms-home/student/notification")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements yet.</p>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {/* Date block */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { weekday: "short" })}
                    </p>
                    <p className="text-lg font-bold text-gray-800">{new Date(item.createdAt).getDate()}</p>
                  </div>

                  {/* Content */}
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ====== BOTTOM SECTION: Circular Progress Cards ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {progress.map((card) => (
          <Card key={card.title} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <p className="font-semibold text-gray-800">{card.title}</p>
            <p className="text-sm text-gray-500 mb-2">This Semester</p>

            <div className="relative w-20 h-20 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="36%"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="36%"
                  stroke={card.strokeColor}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 36}%`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - card.percent / 100)}%`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-semibold text-gray-800">{isLoading ? "…" : `${card.percent}%`}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
