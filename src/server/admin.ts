"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { User, UserRole, UserStatus } from "@/types/user";
import { AdminOverview, CourseCompletionStat, RevenuePoint, TutorPerformanceStat } from "@/types/admin";
import { AcademicSummary, ParentEnrollmentSummary, Student } from "@/types/student";

export async function CreateUserAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}): Promise<[ApiResponse<User> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/users",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User>) : null;
  return [resData, error];
}

export async function GetUsersAction(
  params?: { role?: string; status?: string; search?: string }
): Promise<[ApiResponse<User[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/users${query ? `?${query}` : ""}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User[]>) : null;
  return [resData, error];
}

export async function GetUserByIdAction(id: string): Promise<[ApiResponse<User> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/users/${id}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User>) : null;
  return [resData, error];
}

export async function UpdateUserStatusAction(
  id: string,
  status: UserStatus
): Promise<[ApiResponse<User> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/users/${id}/status`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User>) : null;
  return [resData, error];
}

export async function UpdateUserRoleAction(
  id: string,
  role: UserRole
): Promise<[ApiResponse<User> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/users/${id}/role`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User>) : null;
  return [resData, error];
}

export async function GetAdminOverviewAction(): Promise<[ApiResponse<AdminOverview> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/overview",
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<AdminOverview>) : null;
  return [resData, error];
}

export async function GetRevenueReportAction(): Promise<[ApiResponse<RevenuePoint[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/revenue",
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<RevenuePoint[]>) : null;
  return [resData, error];
}

export async function GetCourseCompletionReportAction(): Promise<
  [ApiResponse<CourseCompletionStat[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/course-completion",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseCompletionStat[]>) : null;
  return [resData, error];
}

export async function GetTutorPerformanceReportAction(): Promise<
  [ApiResponse<TutorPerformanceStat[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/admin/reports/tutor-performance",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorPerformanceStat[]>) : null;
  return [resData, error];
}

export async function LinkEnrollmentAction(
  id: string,
  data: { parentUserId?: string | null; studentUserId?: string | null }
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/link`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

export async function UpdateEnrollmentStatusAction(
  id: string,
  status: string
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/status`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

export async function GetEnrollmentsByStatusAction(
  status: string
): Promise<[ApiResponse<any[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/status/${status}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<any[]>) : null;
  return [resData, error];
}

export async function ListStudentsForAdminAction(
  params?: { search?: string; page?: number; limit?: number }
): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/enrollments/admin/all${query ? `?${query}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[]>) : null;
  return [resData, error];
}

export async function CreateEnrollmentByAdminAction(data: {
  fullName: string;
  parentUserId?: string;
  studentUserId?: string;
  dateOfBirth?: string;
  gender?: string;
  countryOfResidence?: string;
  primaryLanguage?: string;
  grade?: string;
  admissionDate?: string;
  photoUrl?: string;
  parentOccupation?: string;
  parentPhone?: string;
}): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments/admin",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function SuspendStudentAction(
  id: string,
  reason: string,
  durationDays?: number
): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/suspend`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, durationDays }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function ReactivateStudentAction(id: string): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/reactivate`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function RemoveStudentAction(id: string): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/remove`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function UpdateStudentAdminProfileAction(
  id: string,
  data: {
    grade?: string;
    admissionDate?: string;
    photoUrl?: string;
    studentIdCode?: string;
    nationality?: string;
    nin?: string;
    weightKg?: number;
    heightCm?: number;
    bloodGroup?: string;
    parentOccupation?: string;
    countryOfResidence?: string;
    primaryLanguage?: string;
    dateOfBirth?: string;
    gender?: string;
  }
): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/admin-profile`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;
  return [resData, error];
}

export async function GetAcademicSummaryAction(
  id: string
): Promise<[ApiResponse<AcademicSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}/academic-summary`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<AcademicSummary>) : null;
  return [resData, error];
}

export async function GetLinkedStudentsForAdminAction(
  parentUserId: string
): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/by-parent/${parentUserId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[]>) : null;
  return [resData, error];
}

export async function GetParentEnrollmentSummaryAction(
  parentUserId: string
): Promise<[ApiResponse<ParentEnrollmentSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/by-parent/${parentUserId}/summary`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ParentEnrollmentSummary>) : null;
  return [resData, error];
}

export async function DeleteCourseAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}`,
    request: {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
