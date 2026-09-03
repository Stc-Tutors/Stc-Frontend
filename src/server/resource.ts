"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CourseResource, ResourceStatus, ResourceType } from "@/types/resource";
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

// Every resource visible to the current student/parent across all three
// target modes at once (course/subject/students) - see stcbe's
// ResourceService.getForLearner. Unlike GetResourcesByCourseAction, this
// isn't scoped to one course, so it also surfaces subject-wide and
// directly-targeted resources with no course of their own.
export async function GetResourcesForMeAction(): Promise<[ApiResponse<CourseResource[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/resources/for-me`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CourseResource[]>) : null;
  return [resData, error];
}

// Exactly one of course/(subject+serviceType)/students must be set - see
// stcbe's IResource. fileUrl must be a Google Drive (or Docs/Sheets/Slides)
// share link, enforced server-side (400 otherwise).
export async function UploadResourceAction(data: {
  title: string;
  fileUrl: string;
  type: ResourceType;
  course?: string;
  subject?: string;
  serviceType?: string;
  students?: string[];
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
