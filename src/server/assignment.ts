"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { UploadedFile } from "@/lib/cloudinary-upload";
import { Assignment } from "@/types/assignment";

export async function GetCourseAssignmentsAction(
  courseId: string
): Promise<[ApiResponse<Assignment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/assignments/course/${courseId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Assignment[]>) : null;
  return [resData, error];
}

export async function GetAssignmentAction(id: string): Promise<[ApiResponse<Assignment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/assignments/${id}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Assignment>) : null;
  return [resData, error];
}

export async function CreateAssignmentAction(data: {
  course: string;
  lesson?: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  attachmentUrl?: string;
  attachment?: UploadedFile;
}): Promise<[ApiResponse<Assignment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/assignments",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Assignment>) : null;
  return [resData, error];
}

export async function GetPendingAssignmentsForAdminAction(): Promise<[ApiResponse<Assignment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/assignments/admin/pending",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Assignment[]>) : null;
  return [resData, error];
}

export async function ApproveAssignmentAction(id: string): Promise<[ApiResponse<Assignment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/assignments/${id}/approve`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Assignment>) : null;
  return [resData, error];
}

export async function RejectAssignmentAction(
  id: string,
  reason?: string
): Promise<[ApiResponse<Assignment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/assignments/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Assignment>) : null;
  return [resData, error];
}
