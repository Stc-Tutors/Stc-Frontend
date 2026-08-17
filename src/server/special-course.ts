"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

// Mirrors just the fields the public registration page actually needs -
// see stcbe's ICourse / Stc-SuperAdmin's types/course.ts for the full shape.
export interface PublicSpecialCourse {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  tutor?: { firstName: string; lastName: string };
}

export async function GetSpecialCourseByTokenAction(
  token: string
): Promise<[ApiResponse<PublicSpecialCourse> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/special-courses/${token}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PublicSpecialCourse>) : null;
  return [resData, error];
}

export async function RegisterForSpecialCourseAction(
  token: string,
  data: { firstName: string; lastName: string; email: string; password: string; phone?: string }
): Promise<[ApiResponse<{ userId: string }> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/special-courses/${token}/register`,
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<{ userId: string }>) : null;
  return [resData, error];
}
