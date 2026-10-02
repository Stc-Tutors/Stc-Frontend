"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CourseEnrollment } from "@/types/course-enrollment";
import { Lesson } from "@/types/lesson";

export interface AllocateTutorResult {
  enrollment: CourseEnrollment;
  created: Lesson[];
  skipped: { scheduledDate: string; reason: string }[];
}

export async function EnrollInCourseAction(
  courseId: string,
  studentId: string
): Promise<[ApiResponse<CourseEnrollment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/course-enrollments",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseEnrollment>) : null;
  return [resData, error];
}

// Admin: allocate a tutor (one of their existing Courses) to a student whose
// one-on-one schedule has already been approved - generates the recurring
// Lesson batch for the paid weeks server-side.
export async function AllocateTutorAction(
  studentId: string,
  courseId: string,
  subject: string,
  meetingUrl?: string
): Promise<[ApiResponse<AllocateTutorResult> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/course-enrollments/allocate",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId, subject, meetingUrl: meetingUrl?.trim() || undefined }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<AllocateTutorResult>) : null;
  return [resData, error];
}

// A course's enrolled roster - tutor/HOD/admin who manages the course only.
export async function GetCourseEnrollmentsAction(
  courseId: string
): Promise<[ApiResponse<CourseEnrollment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/course-enrollments/course/${courseId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseEnrollment[]>) : null;
  return [resData, error];
}

export async function GetStudentCoursesAction(
  studentId: string
): Promise<[ApiResponse<CourseEnrollment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/course-enrollments/student/${studentId}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseEnrollment[]>) : null;
  return [resData, error];
}

// Special Course shareable-link registration for a visitor who's already
// logged in - see stcbe's CourseEnrollmentService.enrollViaShareToken.
// `studentId` lets a parent with more than one child specify which one;
// omit it to let the backend auto-resolve (a student's own record, or a
// parent's only child).
export async function EnrollViaShareTokenAction(
  token: string,
  studentId?: string
): Promise<[ApiResponse<CourseEnrollment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/course-enrollments/via-link/${token}`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentId ? { studentId } : {}),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseEnrollment>) : null;
  return [resData, error];
}

export async function DropCourseAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/course-enrollments/${id}`,
    request: {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

export interface ExtensionQuote {
  weeks: number;
  subject: string;
  amount: number;
  currency: string;
  lessonsPerWeek: number;
  firstNewLesson?: string;
}

export interface ExtensionResult {
  applied: boolean;
  message: string;
  created?: number;
  payment?: { authorization_url: string; access_code: string; reference: string; fullyCoveredByWallet?: boolean };
}

// What N more weeks of an existing one-on-one service would cost.
export async function GetExtensionQuoteAction(
  studentId: string,
  courseId: string,
  weeks: number
): Promise<[ApiResponse<ExtensionQuote> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/course-enrollments/extension-quote?studentId=${encodeURIComponent(studentId)}&courseId=${encodeURIComponent(courseId)}&weeks=${weeks}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<ExtensionQuote>) : null;
  return [resData, error];
}

// Starts payment for N more weeks - the classes are added once the payment is verified.
export async function ExtendScheduleAction(
  studentId: string,
  courseId: string,
  weeks: number
): Promise<[ApiResponse<ExtensionResult> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/course-enrollments/extend",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId, weeks }),
    },
  });
  const resData = res ? ((await res.json()) as ApiResponse<ExtensionResult>) : null;
  return [resData, error];
}
