"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  ApplyTutorPayload,
  StartTutorApplicationPayload,
  StartTutorApplicationResponse,
  SubmitTutorApplicationStep10Response,
  TutorApplication,
  TutorApplicationStatus,
  TutorApplicationStatusSummary,
  TutorApplicationStep2Payload,
  TutorApplicationStep3Payload,
  TutorApplicationStep4Payload,
  TutorApplicationStep5Payload,
  TutorApplicationStep6Payload,
  TutorApplicationStep7Payload,
  TutorApplicationStep8Payload,
  TutorApplicationStep9Payload,
  TutorApplicationStep10Payload,
  TutorSearchResult,
  RequestMoreInfoPayload,
} from "@/types/tutor-application";
import { Message } from "@/types/message";

// Legacy single-shot signup - kept only because nothing has confirmed the
// backend route (stcbe's POST /tutor-applications) is safe to remove. The
// frontend entry point that called this (apply-tutor-form.tsx) has been
// retired in favor of the wizard below.
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

export async function RequestMoreInfoAction(
  id: string,
  payload: RequestMoreInfoPayload
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/request-more-info`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

// --- 10-step tutor application wizard ---
// Steps 2-10 aren't authorized by the normal auth cookie (the applicant's
// account is PENDING_APPROVAL until step 10 submits, which AuthService.login
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

async function updateStep<TPayload>(
  step: number,
  id: string,
  draftToken: string,
  data: TPayload
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/step${step}`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

// "use server" files require every export to be a literal async function
// (not a value returned from a factory), so each step gets its own thin
// wrapper around the shared updateStep helper above rather than a
// dynamically-generated action.
export async function UpdateTutorApplicationStep2Action(id: string, draftToken: string, data: TutorApplicationStep2Payload) {
  return updateStep(2, id, draftToken, data);
}
export async function UpdateTutorApplicationStep3Action(id: string, draftToken: string, data: TutorApplicationStep3Payload) {
  return updateStep(3, id, draftToken, data);
}
export async function UpdateTutorApplicationStep4Action(id: string, draftToken: string, data: TutorApplicationStep4Payload) {
  return updateStep(4, id, draftToken, data);
}
export async function UpdateTutorApplicationStep5Action(id: string, draftToken: string, data: TutorApplicationStep5Payload) {
  return updateStep(5, id, draftToken, data);
}
export async function UpdateTutorApplicationStep6Action(id: string, draftToken: string, data: TutorApplicationStep6Payload) {
  return updateStep(6, id, draftToken, data);
}
export async function UpdateTutorApplicationStep7Action(id: string, draftToken: string, data: TutorApplicationStep7Payload) {
  return updateStep(7, id, draftToken, data);
}
export async function UpdateTutorApplicationStep8Action(id: string, draftToken: string, data: TutorApplicationStep8Payload) {
  return updateStep(8, id, draftToken, data);
}
export async function UpdateTutorApplicationStep9Action(id: string, draftToken: string, data: TutorApplicationStep9Payload) {
  return updateStep(9, id, draftToken, data);
}
// Saves the Agreements step's fields only - does NOT finalize submission
// (see FinalizeTutorApplicationSubmissionAction below, called from the
// wizard's actual last step, Review & Submit).
export async function UpdateTutorApplicationStep10Action(id: string, draftToken: string, data: TutorApplicationStep10Payload) {
  return updateStep(10, id, draftToken, data);
}

export async function SearchTutorsForReferralAction(
  id: string,
  draftToken: string,
  query: string
): Promise<[ApiResponse<TutorSearchResult[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/tutor-search?q=${encodeURIComponent(query)}`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorSearchResult[]>) : null;
  return [resData, error];
}

// NEEDS_MORE_INFO -> PENDING, after the applicant has edited whatever a
// reviewer flagged (via the same step2-9 update actions above, using the
// editToken - see tutor-application-context.tsx's edit mode). Distinct from
// SubmitTutorApplicationStep10Action - doesn't re-run agreements/consent.
export async function ResubmitTutorApplicationAction(
  id: string,
  editToken: string
): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/resubmit`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${editToken}` },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

// The wizard's actual final action, called from the Review & Submit step
// (schema stepId "review_submit") - no body, everything it validates
// (termsAccepted etc.) was already saved by UpdateTutorApplicationStep10Action.
export async function FinalizeTutorApplicationSubmissionAction(
  id: string,
  draftToken: string
): Promise<[ApiResponse<SubmitTutorApplicationStep10Response> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/submit`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${draftToken}` },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SubmitTutorApplicationStep10Response>) : null;
  return [resData, error];
}

// A real logged-in TUTOR's own submitted application record -
// crossCuttingRequirements.fullVisibilityPrinciple: every field captured at
// registration must also be visible on the tutor's own profile.
export async function GetMyTutorApplicationAction(): Promise<[ApiResponse<TutorApplication> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-applications/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplication>) : null;
  return [resData, error];
}

// --- Applicant-facing status + support, post-submission ---
// Gated by a separate, longer-lived `statusToken` (returned alongside the
// step10 submit response) - not the draft token, and not a normal login
// session, since PENDING_APPROVAL accounts still can't log in normally.

export async function GetTutorApplicationStatusAction(
  id: string,
  statusToken: string
): Promise<[ApiResponse<TutorApplicationStatusSummary> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/status`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${statusToken}` },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorApplicationStatusSummary>) : null;
  return [resData, error];
}

export async function GetTutorApplicationSupportMessagesAction(
  id: string,
  statusToken: string
): Promise<[ApiResponse<Message[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/support-messages`,
    request: {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${statusToken}` },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Message[]>) : null;
  return [resData, error];
}

export async function SendTutorApplicationSupportMessageAction(
  id: string,
  statusToken: string,
  body: string
): Promise<[ApiResponse<Message> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-applications/${id}/support-messages`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${statusToken}` },
      body: JSON.stringify({ body }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Message>) : null;
  return [resData, error];
}
