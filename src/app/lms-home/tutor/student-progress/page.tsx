"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle } from "rc-progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetMyStudentsProgressAction } from "@/server/course";
import { StudentCourseProgress } from "@/types/student-progress";
import { SERVICE_TYPE_LABELS } from "@/constants/taxonomy";

const PAGE_SIZE = 10;
const ALL = "__all__";

function average(values: (number | null)[]): number | null {
  const known = values.filter((v): v is number => v != null);
  return known.length > 0 ? Math.round((known.reduce((sum, v) => sum + v, 0) / known.length) * 100) / 100 : null;
}

export default function StudentProgressPage() {
  const router = useRouter();
  const [rows, setRows] = useState<StudentCourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [studentFilter, setStudentFilter] = useState(ALL);
  const [serviceFilter, setServiceFilter] = useState(ALL);
  const [subjectFilter, setSubjectFilter] = useState(ALL);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyStudentsProgressAction();
      setRows(res?.data?.rows ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  const students = useMemo(() => {
    const seen = new Map<string, string>();
    rows.forEach((r) => seen.set(r.studentId, r.fullName));
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [rows]);

  const services = useMemo(
    () => Array.from(new Set(rows.map((r) => r.serviceType).filter((s): s is string => !!s))),
    [rows]
  );

  // "Subject" here is the course itself (e.g. a specific Mathematics course)
  // rather than a raw curriculum node - matches what's actually attached to
  // each row (course.category via ICourse), and is the one dimension that
  // makes a filter meaningful for both Academic Tutoring (per-subject
  // courses) and every other service (one course per offering).
  const subjects = useMemo(
    () => Array.from(new Set(rows.map((r) => r.subject).filter((s): s is string => !!s))),
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (studentFilter === ALL || r.studentId === studentFilter) &&
          (serviceFilter === ALL || r.serviceType === serviceFilter) &&
          (subjectFilter === ALL || r.subject === subjectFilter)
      ),
    [rows, studentFilter, serviceFilter, subjectFilter]
  );

  useEffect(() => setPage(1), [studentFilter, serviceFilter, subjectFilter]);

  const aggregate = average(filtered.map((r) => r.overallProgressPercent)) ?? 0;
  const avgAttendance = average(filtered.map((r) => r.attendanceRate));
  const avgScore = average(filtered.map((r) => r.averageScorePercent));
  const avgCourseProgress = average(filtered.map((r) => r.courseProgressPercent));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading student progress...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Progress</h1>
        <p className="text-sm text-gray-500 mt-1">
          One row per student per course - each course's overall progress averages attendance rate and average
          graded assignment score (whichever of the two it has data for). Filter below, or click a row for that
          student's full breakdown.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All students</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All services</SelectItem>
            {services.map((s) => (
              <SelectItem key={s} value={s}>{SERVICE_TYPE_LABELS[s] ?? s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Aggregate rings - recomputed from whatever the filters above match */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[100px] h-[100px]">
            <Circle percent={aggregate} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">{aggregate}%</div>
          </div>
          <p className="text-xs text-gray-500 text-center">Average overall progress</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[100px] h-[100px]">
            <Circle percent={avgAttendance ?? 0} strokeWidth={8} trailWidth={8} strokeColor="#10b981" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {avgAttendance ?? "-"}{avgAttendance != null && "%"}
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Average attendance rate</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[100px] h-[100px]">
            <Circle percent={avgScore ?? 0} strokeWidth={8} trailWidth={8} strokeColor="#f59e0b" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {avgScore ?? "-"}{avgScore != null && "%"}
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Average graded assignment score</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-2">
          <div className="relative w-[100px] h-[100px]">
            <Circle percent={avgCourseProgress ?? 0} strokeWidth={8} trailWidth={8} strokeColor="#8b5cf6" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {avgCourseProgress ?? "-"}{avgCourseProgress != null && "%"}
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Average course progress</p>
        </div>
      </div>

      {/* Per (student, course) table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          {rows.length === 0
            ? "No students yet. Once someone enrolls in one of your courses, their progress will show up here."
            : "No students match these filters."}
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="p-3">Student</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Course progress</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Avg score</th>
                  <th className="p-3">Assignments</th>
                  <th className="p-3">Overall</th>
                </tr>
              </thead>
              <tbody>
                {current.map((row) => (
                  <tr
                    key={`${row.studentId}-${row.courseId}`}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/lms-home/tutor/student-list/${row.studentId}`)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={row.avatarUrl} alt={row.fullName} />
                          <AvatarFallback>{row.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-800">{row.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{row.courseTitle}</td>
                    <td className="p-3 text-gray-600">
                      {row.serviceType ? SERVICE_TYPE_LABELS[row.serviceType] ?? row.serviceType : "-"}
                    </td>
                    <td className="p-3 text-gray-600">{row.courseProgressPercent}%</td>
                    <td className="p-3 text-gray-600">{row.attendanceRate != null ? `${row.attendanceRate}%` : "-"}</td>
                    <td className="p-3 text-gray-600">{row.averageScorePercent != null ? `${row.averageScorePercent}%` : "-"}</td>
                    <td className="p-3 text-gray-600">
                      {row.assignmentsCompleted}/{row.assignmentsTotal}
                    </td>
                    <td className="p-3 font-medium text-gray-900">{row.overallProgressPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
          )}
        </>
      )}
    </div>
  );
}
