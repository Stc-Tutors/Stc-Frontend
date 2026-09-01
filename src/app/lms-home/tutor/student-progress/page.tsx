"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle } from "rc-progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetMyStudentsProgressAction } from "@/server/course";
import { StudentProgressSummary } from "@/types/student-progress";

const PAGE_SIZE = 8;

export default function StudentProgressPage() {
  const router = useRouter();
  const [aggregate, setAggregate] = useState(0);
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyStudentsProgressAction();
      setAggregate(res?.data?.aggregateProgressPercent ?? 0);
      setStudents(res?.data?.students ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = students.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading student progress...</p>;

  const withAttendance = students.filter((s) => s.attendanceRate != null);
  const avgAttendance =
    withAttendance.length > 0
      ? Math.round((withAttendance.reduce((sum, s) => sum + (s.attendanceRate ?? 0), 0) / withAttendance.length) * 100) / 100
      : null;
  const withScore = students.filter((s) => s.averageScorePercent != null);
  const avgScore =
    withScore.length > 0
      ? Math.round((withScore.reduce((sum, s) => sum + (s.averageScorePercent ?? 0), 0) / withScore.length) * 100) / 100
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Progress</h1>
        <p className="text-sm text-gray-500 mt-1">
          Each student's overall progress is the average of their attendance rate and their average graded
          assignment score (whichever of the two they have data for). Click a student for their full breakdown,
          including assignment completion and course progress.
        </p>
      </div>

      {/* Aggregate rings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[120px] h-[120px]">
            <Circle percent={aggregate} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
              {aggregate}%
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">Average overall progress</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[120px] h-[120px]">
            <Circle percent={avgAttendance ?? 0} strokeWidth={8} trailWidth={8} strokeColor="#10b981" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
              {avgAttendance ?? "-"}
              {avgAttendance != null && "%"}
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">Average attendance rate</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[120px] h-[120px]">
            <Circle percent={avgScore ?? 0} strokeWidth={8} trailWidth={8} strokeColor="#f59e0b" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
              {avgScore ?? "-"}
              {avgScore != null && "%"}
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">Average graded assignment score</p>
        </div>
      </div>

      {/* Per-student ring grid */}
      {students.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          No students yet. Once someone enrolls in one of your courses, their progress will show up here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {current.map((student) => (
              <button
                key={student.studentId}
                onClick={() => router.push(`/lms-home/tutor/student-list/${student.studentId}`)}
                className="bg-white rounded-2xl shadow p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer text-center"
              >
                <div className="relative w-20 h-20">
                  <Circle
                    percent={student.overallProgressPercent}
                    strokeWidth={8}
                    trailWidth={8}
                    strokeColor="#3b82f6"
                    trailColor="#e5e7eb"
                  />
                  <Avatar className="absolute inset-0 m-auto h-12 w-12">
                    <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                    <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-sm font-medium truncate w-full">{student.fullName}</p>
                <p className="text-xs text-gray-500">{student.overallProgressPercent}% overall</p>
                <p className="text-xs text-gray-400">
                  {student.attendanceRate != null ? `${student.attendanceRate}% attendance` : "No attendance yet"}
                  {" · "}
                  {student.averageScorePercent != null ? `${student.averageScorePercent}% avg score` : "No grades yet"}
                </p>
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`px-3 py-1.5 rounded border text-sm ${
                  p === page ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
