"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, CheckSquare, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AnalyticsChart from "@/components/studentDashboard/AnalyticsChart";
import DownloadReport from "@/components/studentDashboard/DownloadReport";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetStudentAttendanceAction } from "@/server/attendance";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import { LessonStatus, Lesson } from "@/types/lesson";
import { AttendanceStatus, Attendance } from "@/types/attendance";
import { Course } from "@/types/course";
import { studentAvatarUrl } from "@/types/student";

interface ProgressCard {
  title: string;
  strokeColor: string;
  percent: number;
}

interface RecordRow {
  lessonId: string;
  courseTitle: string;
  date: string;
  status?: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  totalHours?: string;
}

export default function StudentAttendancePage() {
  const router = useRouter();
  const [counts, setCounts] = useState({ enrolled: 0, active: 0, completed: 0 });
  const [progress, setProgress] = useState<ProgressCard[]>([]);
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentAvatar, setStudentAvatar] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [enrollmentsRes] = await GetEnrollmentsAction();
      const student = enrollmentsRes?.data?.[0];
      const studentId = student?.id;
      if (student) {
        setStudentName(student.fullName);
        setStudentAvatar(studentAvatarUrl(student.user));
      }

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

      const [lessonLists, [attendanceRes]] = await Promise.all([
        Promise.all(courses.map((c) => GetCourseLessonsAction(c.id))),
        GetStudentAttendanceAction(studentId),
      ]);

      const attendanceByLesson = new Map<string, Attendance>();
      (attendanceRes?.data ?? []).forEach((a) => {
        if (a.lesson) attendanceByLesson.set(a.lesson, a);
      });

      let allLessons: Lesson[] = [];
      const recordRows: RecordRow[] = [];
      lessonLists.forEach(([res], i) => {
        const course = courses[i];
        const lessons = res?.data ?? [];
        allLessons = allLessons.concat(lessons);
        lessons
          .filter((l) => l.status !== LessonStatus.CANCELLED)
          .forEach((lesson) => {
            const attendance = attendanceByLesson.get(lesson.id);
            let totalHours: string | undefined;
            if (lesson.actualStartTime && lesson.actualEndTime) {
              const ms = new Date(lesson.actualEndTime).getTime() - new Date(lesson.actualStartTime).getTime();
              totalHours = `${(ms / (1000 * 60 * 60)).toFixed(1)}hrs`;
            }
            recordRows.push({
              lessonId: lesson.id,
              courseTitle: course.title,
              date: lesson.scheduledDate,
              status: attendance?.status,
              clockIn: lesson.actualStartTime
                ? new Date(lesson.actualStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : undefined,
              clockOut: lesson.actualEndTime
                ? new Date(lesson.actualEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : undefined,
              totalHours,
            });
          });
      });
      recordRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRows(recordRows);

      const lessonsPct =
        allLessons.length === 0
          ? 0
          : Math.round((allLessons.filter((l) => l.status === LessonStatus.COMPLETED).length / allLessons.length) * 100);

      const attendanceRecords = attendanceRes?.data ?? [];
      const attendancePct =
        attendanceRecords.length === 0
          ? 0
          : Math.round(
              (attendanceRecords.filter((a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)
                .length /
                attendanceRecords.length) *
                100
            );

      setProgress([
        { title: "Lessons", strokeColor: "#3b82f6", percent: lessonsPct },
        { title: "Attendance Record", strokeColor: "#f97316", percent: attendancePct },
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

  const STATUS_COLORS: Partial<Record<AttendanceStatus, string>> = {
    [AttendanceStatus.PRESENT]: "text-green-600",
    [AttendanceStatus.LATE]: "text-orange-500",
    [AttendanceStatus.ABSENT]: "text-red-500",
    [AttendanceStatus.EXCUSED]: "text-gray-500",
  };

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => router.push("/lms-home/student/dashboard")}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-1xl font-bold">BACK</span>
      </button>

      <h2 className="text-lg font-semibold text-gray-800">Attendance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
          <div key={title} className={`flex items-center gap-4 p-4 rounded-lg shadow ${bgColor}`}>
            <div className="bg-white rounded-md p-3">
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">{isLoading ? "…" : value.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
        ))}
        <DownloadReport />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {progress.map((card) => (
            <Card key={card.title} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
              <p className="font-semibold text-gray-800 text-sm text-center">{card.title}</p>
              <p className="text-xs text-gray-500 mb-2">This Semester</p>
              <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="36%" stroke="#e5e7eb" strokeWidth="6" fill="transparent" />
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
                <span className="absolute text-lg font-semibold text-gray-800">
                  {isLoading ? "…" : `${card.percent}%`}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={studentAvatar} alt={studentName} />
            <AvatarFallback>{studentName?.[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-gray-800">Attendance Record</h3>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Course</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Clock In</th>
                  <th className="py-2 pr-4">Clock Out</th>
                  <th className="py-2 pr-4">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.lessonId} className="border-b text-sm">
                    <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{r.courseTitle}</td>
                    <td className={`py-2 pr-4 font-medium ${r.status ? STATUS_COLORS[r.status] : "text-gray-400"}`}>
                      {r.status ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{r.clockIn ?? "—"}</td>
                    <td className="py-2 pr-4">{r.clockOut ?? "—"}</td>
                    <td className="py-2 pr-4">{r.totalHours ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
