"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { TutorProfile, TutorSummary } from "@/types/tutor-profile";
import { TeachingCombination } from "@/types/curriculum";

export async function GetMyTutorProfileAction(): Promise<[ApiResponse<TutorProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/me",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfile>) : null;
  return [resData, error];
}

// Every editable field on the tutor's own profile - matches TutorProfile
// minus the server-managed id/tutor/profileCompleted/createdAt/updatedAt.
export type UpdateTutorProfileInput = Partial<
  Omit<TutorProfile, "id" | "tutor" | "profileCompleted" | "createdAt" | "updatedAt">
>;

// A submitted edit no longer applies straight to the live profile - it
// lands as a PENDING request an admin must approve (see stcbe's
// TutorProfileService.updateMine/approveEdit). `changes` mirrors whatever
// was submitted, applied over the live profile once approved. `tutor` is a
// plain id from /me/pending-edit (the tutor already knows who they are) but
// populated (name/avatar) from the admin review list below.
export interface TutorProfileEditRequest {
  id: string;
  tutor: string | TutorSummary;
  changes: UpdateTutorProfileInput;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export async function UpdateMyTutorProfileAction(
  data: UpdateTutorProfileInput
): Promise<[ApiResponse<TutorProfileEditRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/me",
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfileEditRequest>) : null;
  return [resData, error];
}

export async function GetMyPendingTutorProfileEditAction(): Promise<
  [ApiResponse<TutorProfileEditRequest | null> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/me/pending-edit",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfileEditRequest | null>) : null;
  return [resData, error];
}

export async function UpdateMyTutorPreferencesAction(data: {
  teachingCombinations: TeachingCombination[];
  ageLevelsTaught: string[];
}): Promise<[ApiResponse<TutorProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/me/preferences",
    request: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfile>) : null;
  return [resData, error];
}

// Admin review queue - see stcbe's TutorProfileService.listPendingEdits.
// Gated on AdminPermission.APPROVE_TUTOR_PROFILE_EDITS (HOD/SUPER_ADMIN/
// ALMIGHTY_ADMIN always pass).
export async function ListPendingTutorProfileEditsAction(): Promise<
  [ApiResponse<TutorProfileEditRequest[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/admin/edits",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfileEditRequest[]>) : null;
  return [resData, error];
}

export async function ApproveTutorProfileEditAction(
  id: string
): Promise<[ApiResponse<TutorProfileEditRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-profile/admin/edits/${id}/approve`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfileEditRequest>) : null;
  return [resData, error];
}

export async function RejectTutorProfileEditAction(
  id: string,
  reason?: string
): Promise<[ApiResponse<TutorProfileEditRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-profile/admin/edits/${id}/reject`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfileEditRequest>) : null;
  return [resData, error];
}

export async function GetTutorProfileAction(tutorId: string): Promise<[ApiResponse<TutorProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-profile/${tutorId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfile>) : null;
  return [resData, error];
}
