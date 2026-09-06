"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetRevenueReportAction, GetAdminOverviewAction, GetCourseCompletionReportAction, GetTutorPerformanceReportAction, ListStudentsForAdminAction } from "@/server/admin";
import {
  GetAttendanceReportAction,
  GetCategoryPopularityAction,
  GetPayoutTurnaroundReportAction,
  GetRescheduleRateReportAction,
  GetStudentProgressReportAction,
  GetStudentRetentionReportAction,
} from "@/server/report";
import {
  AdminOverview,
  AttendanceReport,
  CategoryPopularityStat,
  CourseCompletionStat,
  PayoutTurnaroundReport,
  RescheduleRateStat,
  RevenuePoint,
  StudentProgressReport,
  StudentRetentionReport,
  TutorPerformanceStat,
} from "@/types/admin";
import { Student } from "@/types/student";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

export default function AdminReportsPage() {
  const { hasPermission } = useUser();
  // Revenue and payout turnaround are financial reports - gated behind
  // VIEW_FINANCIAL_REPORTS on the backend. Everything else here is an
  // operational report open to any assigned admin.
  const canViewFinancialReports = hasPermission(AdminPermission.VIEW_FINANCIAL_REPORTS);

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null);
  const [categories, setCategories] = useState<CategoryPopularityStat[]>([]);
  const [tutorPerformance, setTutorPerformance] = useState<TutorPerformanceStat[]>([]);
  const [retention, setRetention] = useState<StudentRetentionReport | null>(null);
  const [completion, setCompletion] = useState<CourseCompletionStat[]>([]);
  const [rescheduleRate, setRescheduleRate] = useState<RescheduleRateStat[]>([]);
  const [payoutTurnaround, setPayoutTurnaround] = useState<PayoutTurnaroundReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const calls: Promise<unknown>[] = [
        GetAdminOverviewAction().then(([res]) => setOverview(res?.data ?? null)),
        GetAttendanceReportAction().then(([res]) => setAttendance(res?.data ?? null)),
        GetCategoryPopularityAction().then(([res]) => setCategories(res?.data ?? [])),
        GetTutorPerformanceReportAction().then(([res]) => setTutorPerformance(res?.data ?? [])),
        GetStudentRetentionReportAction().then(([res]) => setRetention(res?.data ?? null)),
        GetCourseCompletionReportAction().then(([res]) => setCompletion(res?.data ?? [])),
        GetRescheduleRateReportAction().then(([res]) => setRescheduleRate(res?.data ?? [])),
      ];
      if (canViewFinancialReports) {
        calls.push(GetRevenueReportAction().then(([res]) => setRevenue(res?.data ?? [])));
        calls.push(GetPayoutTurnaroundReportAction().then(([res]) => setPayoutTurnaround(res?.data ?? null)));
      }
      await Promise.all(calls);
      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewFinancialReports]);

  const missedClasses = tutorPerformance.reduce((sum, t) => sum + t.cancelledSessions, 0);

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Attendance, missed classes, schedules, and tutor/student performance across the platform.</p>
      </div>

      {canViewFinancialReports && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Over Time (Completed Payments)</h2>
          {revenue.length === 0 ? (
            <p className="text-sm text-gray-500">No completed payments recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Attendance</h2>
          {!attendance ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <>
              <div className="flex items-baseline gap-4 mb-1">
                <p className="text-2xl font-semibold text-gray-900">{attendance.overall.rate}%</p>
                <p className="text-sm text-gray-500">
                  {attendance.overall.present}/{attendance.overall.total} present, {attendance.overall.total - attendance.overall.present} missed
                </p>
              </div>
              <div className="space-y-2 mt-4">
                {attendance.byCourse.map((c) => (
                  <div key={c.courseId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{c.courseTitle}</span>
                    <span className="font-medium">
                      {c.rate}% ({c.total - c.present} missed)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Missed & rescheduled classes</h2>
          <p className="text-xs text-gray-400 mb-3">Cancelled sessions and reschedule requests, per tutor</p>
          {rescheduleRate.length === 0 && missedClasses === 0 ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <>
              <p className="text-2xl font-semibold text-gray-900 mb-3">{missedClasses} cancelled sessions</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rescheduleRate.map((r) => (
                  <div key={r.tutorId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{r.name}</span>
                    <span className="font-medium">{r.rescheduleCount} reschedule(s)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {overview && (
          <>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Courses by Status</h2>
              <div className="space-y-2">
                {Object.entries(overview.coursesByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Enrollments by Status</h2>
              <div className="space-y-2">
                {Object.entries(overview.enrollmentsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Category Popularity</h2>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              categories.map((c) => (
                <div key={c.category} className="flex justify-between text-sm">
                  <span className="text-gray-600">{c.category}</span>
                  <span className="font-medium">
                    {c.courseCount} courses · {c.enrollmentCount} enrolled
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tutor Performance</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {tutorPerformance.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              tutorPerformance.map((t) => (
                <div key={t.tutorId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.name}</span>
                  <span className="font-medium">
                    {t.totalHours}h · {t.averageRating ? t.averageRating.toFixed(1) : "-"}★ · {t.cancelledSessions} missed
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Student Retention</h2>
          <p className="text-xs text-gray-400 mb-3">% of students enrolled 30+ days ago still active</p>
          {!retention ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <>
              <p className="text-2xl font-semibold text-gray-900 mb-1">{retention.rate ?? "-"}%</p>
              <p className="text-sm text-gray-500">
                {retention.retained} of {retention.eligible} eligible students retained
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Course Completion Rate</h2>
          <p className="text-xs text-gray-400 mb-3">Completed vs total course enrollments</p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {completion.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              completion.map((c) => (
                <div key={c.courseId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{c.courseTitle}</span>
                  <span className="font-medium">
                    {c.rate}% ({c.completed}/{c.total})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {canViewFinancialReports && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Payout Turnaround</h2>
            <p className="text-xs text-gray-400 mb-3">Average time from payout request to payment</p>
            <p className="text-2xl font-semibold text-gray-900">
              {payoutTurnaround?.averageHours != null ? `${payoutTurnaround.averageHours}h` : "-"}
            </p>
          </div>
        )}
      </div>

      <StudentProgressLookup />
    </div>
  );
}

// Individual student performance - search by name, then pull their
// attendance/assignment progress (AdminService.getStudentProgressReport).
function StudentProgressLookup() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [progress, setProgress] = useState<StudentProgressReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }
      const [res] = await ListStudentsForAdminAction({ search: search.trim(), limit: 8 });
      setResults(res?.data ?? []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSelect = async (student: Student) => {
    setSelected(student);
    setResults([]);
    setSearch(student.fullName);
    const [res, err] = await GetStudentProgressReportAction(student.id);
    setProgress(res?.data ?? null);
    setError(err);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-1">Student Progress Lookup</h2>
      <p className="text-xs text-gray-400 mb-4">Search a student to see their individual attendance and assignment performance.</p>
      <div className="relative max-w-md mb-4">
        <Input
          placeholder="Search students by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(null);
            setProgress(null);
          }}
        />
        {results.length > 0 && !selected && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
            {results.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {s.fullName}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-gray-500">{error}</p>}
      {progress && selected && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-3">{selected.fullName}</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xl font-semibold text-gray-900">{progress.attendance.rate ?? "-"}%</p>
              <p className="text-sm text-gray-500">Attendance</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{progress.assignments.totalSubmitted}</p>
              <p className="text-sm text-gray-500">Submitted</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{progress.assignments.averageScorePercent ?? "-"}%</p>
              <p className="text-sm text-gray-500">Avg score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
