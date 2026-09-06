"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  AttendanceReport,
  CategoryPopularityStat,
  PayoutTurnaroundReport,
  RescheduleRateStat,
  StudentProgressReport,
  StudentRetentionReport,
} from "@/types/admin";

export async function GetAttendanceReportAction(): Promise<[ApiResponse<AttendanceReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/attendance",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<AttendanceReport>) : null;
  return [resData, error];
}

export async function GetCategoryPopularityAction(): Promise<[ApiResponse<CategoryPopularityStat[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/category-popularity",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CategoryPopularityStat[]>) : null;
  return [resData, error];
}

export async function GetStudentRetentionReportAction(): Promise<[ApiResponse<StudentRetentionReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/student-retention",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<StudentRetentionReport>) : null;
  return [resData, error];
}

// Reschedule requests per tutor - a schedule-friction/volume signal, joined
// with cancelledSessions from GetTutorPerformanceReportAction to cover both
// "class got moved" and "class got missed entirely".
export async function GetRescheduleRateReportAction(): Promise<[ApiResponse<RescheduleRateStat[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/reschedule-rate",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RescheduleRateStat[]>) : null;
  return [resData, error];
}

export async function GetPayoutTurnaroundReportAction(): Promise<[ApiResponse<PayoutTurnaroundReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/payout-turnaround",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PayoutTurnaroundReport>) : null;
  return [resData, error];
}

// studentId is the Student enrollment record's id (AdminService.
// getStudentProgressReport -> studentRepository.findById), not a User id.
export async function GetStudentProgressReportAction(
  studentId: string
): Promise<[ApiResponse<StudentProgressReport> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/reports/students/${studentId}/progress`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<StudentProgressReport>) : null;
  return [resData, error];
}
