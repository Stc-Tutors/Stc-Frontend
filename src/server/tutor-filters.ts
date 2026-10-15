"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface TutorFilterOptions {
  services: string[];
  subjects: string[];
  curricula: string[];
  gradeLevels: string[];
  examBoards: string[];
  ageRanges: string[];
  countries: string[];
  languages: string[];
  qualifications: string[];
}

// Dropdown choices for the tutor filters, gathered by the backend from what tutors actually entered.
export async function GetTutorFilterOptionsAction(): Promise<[ApiResponse<TutorFilterOptions> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/users/tutor-filter-options",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<TutorFilterOptions>) : null;
  return [resData, error];
}
