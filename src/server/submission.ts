"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Submission } from "@/types/submission";

export async function SubmitAssignmentAction(data: {
  assignmentId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
}): Promise<[ApiResponse<Submission> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/submissions",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Submission>) : null;
  return [resData, error];
}

export async function GetSubmissionsForAssignmentAction(
  assignmentId: string
): Promise<[ApiResponse<Submission[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/submissions/assignment/${assignmentId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Submission[]>) : null;
  return [resData, error];
}

export async function GetMySubmissionsAction(): Promise<[ApiResponse<Submission[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/submissions/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Submission[]>) : null;
  return [resData, error];
}

export async function GradeSubmissionAction(
  id: string,
  score: number,
  feedback?: string
): Promise<[ApiResponse<Submission> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/submissions/${id}/grade`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, feedback }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Submission>) : null;
  return [resData, error];
}
