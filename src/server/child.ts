"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Child, UpdateChildProfileInput } from "@/types/child";

export async function GetChildAction(id: string): Promise<[ApiResponse<Child> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/children/${id}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Child>) : null;
  return [resData, error];
}

// Propagates to every one of this child's enrollments on the backend (see
// stcbe's ChildService.updateProfile) - a photo/DOB/health-info edit here
// shows up consistently everywhere, not just on whichever enrollment you
// happened to view it from.
export async function UpdateChildProfileAction(
  id: string,
  data: UpdateChildProfileInput
): Promise<[ApiResponse<Child> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/children/${id}/profile`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Child>) : null;
  return [resData, error];
}
