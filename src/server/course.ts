"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Course, CourseDailyActivity, CourseDemographics, CreateCoursePayload, UpdateCoursePayload } from "@/types/course";
import { CourseEnrollment } from "@/types/course-enrollment";
import { Student } from "@/types/student";
import { MyStudentsProgress } from "@/types/student-progress";

export async function GetCoursesAction(
  params?: { tutor?: string; category?: string; status?: string; serviceType?: string }
): Promise<[ApiResponse<Course[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/courses${query ? `?${query}` : ""}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course[]>) : null;
  return [resData, error];
}

export async function GetCourseAction(id: string): Promise<[ApiResponse<Course> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course>) : null;
  return [resData, error];
}

export async function GetMyCoursesAction(): Promise<[ApiResponse<Course[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/courses/mine",
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course[]>) : null;
  return [resData, error];
}

export async function GetMyCourseStudentsAction(): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/courses/mine/students",
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[]>) : null;
  return [resData, error];
}

export async function GetMyStudentsProgressAction(): Promise<[ApiResponse<MyStudentsProgress> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/courses/mine/students/progress",
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<MyStudentsProgress>) : null;
  return [resData, error];
}

export async function CreateCourseAction(
  data: CreateCoursePayload
): Promise<[ApiResponse<Course> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/courses",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course>) : null;
  return [resData, error];
}

export async function UpdateCourseAction(
  id: string,
  data: UpdateCoursePayload
): Promise<[ApiResponse<Course> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}`,
    request: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course>) : null;
  return [resData, error];
}

export async function PublishCourseAction(id: string): Promise<[ApiResponse<Course> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}/publish`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course>) : null;
  return [resData, error];
}

export async function ArchiveCourseAction(id: string): Promise<[ApiResponse<Course> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}/archive`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Course>) : null;
  return [resData, error];
}

export async function GetCourseDemographicsAction(
  id: string
): Promise<[ApiResponse<CourseDemographics> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}/demographics`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseDemographics>) : null;
  return [resData, error];
}

export async function GetCourseDailyActivityAction(
  id: string,
  days?: number
): Promise<[ApiResponse<CourseDailyActivity[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}/daily-activity${days ? `?days=${days}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseDailyActivity[]>) : null;
  return [resData, error];
}

export async function GetCourseStudentsAction(
  id: string
): Promise<[ApiResponse<CourseEnrollment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/courses/${id}/students`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseEnrollment[]>) : null;
  return [resData, error];
}
