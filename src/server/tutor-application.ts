"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  ApplyTutorPayload,
  StartTutorApplicationPayload,
  StartTutorApplicationResponse,
  TutorApplication,
  TutorApplicationStatus,
  TutorApplicationStep2Payload,
  TutorApplicationStep3Payload,
  TutorApplicationStep4Payload,
  TutorApplicationStep5Payload,
} from "@/types/tutor-application";

// Legacy single-shot signup - kept only until the 5-step wizard below fully
// replaces src/components/forms/apply-tutor-form.tsx (see ApplyTutorPayload).
export async function ApplyTutorAction(
  data: ApplyTutorPayload
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-applications",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

export async function GetTutorApplicationsAction(
  status?: TutorApplicationStatus
): Promise<[ApiResponse<TutorApplication[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications${status ? `?status=${status}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication[]>) : null;
  return [resData, error];
}

export async function ApproveTutorApplicationAction(
  id: string
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/approve`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

export async function RejectTutorApplicationAction(
  id: string,
  reason?: string
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

// --- 5-step tutor application wizard ---
// Steps 2-5 aren't authorized by the normal auth cookie (the applicant's
// account is PENDING_APPROVAL until step 5 submits, which AuthService.login
// rejects) - instead a standalone `draftToken` returned by StartTutorApplicationAction
// must be sent as a Bearer token on every subsequent call. Passing it
// explicitly here (rather than relying on fetchAPI's cookie-based default)
// works because fetchAPI only sets its own Authorization header when the
// caller hasn't already set one - see src/lib/fetch.ts.

export async function StartTutorApplicationAction(
  data: StartTutorApplicationPayload
): Promise<[ApiResponse<StartTutorApplicationResponse> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-applications/start",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<StartTutorApplicationResponse>) : null;
  return [resData, error];
}

export async function GetTutorApplicationDraftAction(
  id: string,
  draftToken: string
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/draft`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

export async function UpdateTutorApplicationStep2Action(
  id: string,
  draftToken: string,
  data: TutorApplicationStep2Payload
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/step2`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

export async function UpdateTutorApplicationStep3Action(
  id: string,
  draftToken: string,
  data: TutorApplicationStep3Payload
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/step3`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

export async function UpdateTutorApplicationStep4Action(
  id: string,
  draftToken: string,
  data: TutorApplicationStep4Payload
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/step4`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

export async function SubmitTutorApplicationStep5Action(
  id: string,
  draftToken: string,
  data: TutorApplicationStep5Payload
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/step5`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}
