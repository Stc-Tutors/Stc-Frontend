"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { TutorProfile } from "@/types/tutor-profile";
import { TeachingCombination } from "@/types/curriculum";

export async function GetMyTutorProfileAction(): Promise<[ApiResponse<TutorProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/me",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfile>) : null;
  return [resData, error];
}

export async function UpdateMyTutorProfileAction(data: {
  bio?: string;
  teachingCombinations?: TeachingCombination[];
  availability?: { subject: string; days: string[]; time: string; duration: number }[];
  // IANA timezone the `availability` times above were entered in.
  timezone?: string;
  yearsOfExperience?: number;
  qualifications?: string;
  education?: { degree: string; institution?: string; year?: number }[];
}): Promise<[ApiResponse<TutorProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/tutor-profile/me",
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfile>) : null;
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

export async function GetTutorProfileAction(tutorId: string): Promise<[ApiResponse<TutorProfile> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-profile/${tutorId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorProfile>) : null;
  return [resData, error];
}
