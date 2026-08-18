"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { TutorAllocation } from "@/types/tutor-allocation";

export async function GetTutorAllocationAction(
  tutorId: string
): Promise<[ApiResponse<TutorAllocation | null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/tutor-allocations/${tutorId}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorAllocation | null>) : null;
  return [resData, error];
}

export async function ListTutorAllocationsAction(): Promise<
  [ApiResponse<TutorAllocation[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/tutor-allocations",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TutorAllocation[]>) : null;
  return [resData, error];
}
