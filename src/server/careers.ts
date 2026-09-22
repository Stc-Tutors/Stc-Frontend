"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CareerApplication } from "@/types/content";

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
}): Promise<[ApiResponse<CareerApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/career-applications",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CareerApplication>) : null;
  return [resData, error];
}
