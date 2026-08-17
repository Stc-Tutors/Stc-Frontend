"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CourseResource, ResourceStatus } from "@/types/resource";
import { PaymentRequest } from "@/types/payment";

export async function GetResourcesByCourseAction(
  courseId: string
): Promise<[ApiResponse<CourseResource[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/course/${courseId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource[]>) : null;
  return [resData, error];
}

export async function GetMyResourcesAction(): Promise<[ApiResponse<CourseResource[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/mine`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource[]>) : null;
  return [resData, error];
}

export async function UploadResourceAction(data: {
  title: string;
  fileUrl: string;
  course: string;
}): Promise<[ApiResponse<CourseResource> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/resources",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource>) : null;
  return [resData, error];
}

export async function GetResourcesForAdminAction(
  status?: ResourceStatus
): Promise<[ApiResponse<CourseResource[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/admin/all${status ? `?status=${status}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource[]>) : null;
  return [resData, error];
}

export async function ApproveResourceAction(
  id: string
): Promise<[ApiResponse<CourseResource> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/${id}/approve`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource>) : null;
  return [resData, error];
}

export async function RejectResourceAction(
  id: string,
  reason?: string
): Promise<[ApiResponse<CourseResource> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource>) : null;
  return [resData, error];
}

// Starts a Paystack charge for a PAID resource - same
// resumeTransaction(access_code) popup pattern used for course/subject
// enrollment payments elsewhere in this app (see the marketplace page).
export async function InitiateResourceUnlockAction(id: string): Promise<[ApiResponse<PaymentRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/${id}/unlock`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PaymentRequest>) : null;
  return [resData, error];
}
