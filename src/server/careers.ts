"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CareerApplication, JobOpeningQuestion } from "@/types/content";

// A JobOpening's own extra apply-form questions (if any) - active only.
export async function GetJobOpeningQuestionsAction(
  jobOpeningId: string
): Promise<[ApiResponse<JobOpeningQuestion[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/job-openings/${jobOpeningId}/questions`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<JobOpeningQuestion[]>) : null;
  return [resData, error];
}

// The Careers page's application form - unauthenticated. Rejects a
// jobOpeningId flagged isTutorRole server-side (that Apply button routes to
// /auth/apply-tutor instead and never calls this). See stcbe's
// career-application.service.ts.
export async function SubmitCareerApplicationAction(data: {
  jobOpeningId: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  coverLetter?: string;
  customFieldResponses?: Record<string, string | string[] | number | boolean>;
}): Promise<[ApiResponse<CareerApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/career-applications",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CareerApplication>) : null;
  return [resData, error];
}
