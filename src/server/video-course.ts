"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { PaymentRequest } from "@/types/payment";
import { CatalogVideoCourse, IVideoCourse, WatchableVideoCourse } from "@/types/video-course";

// Public/unauthenticated on the backend - requires at least one attachment
// filter (this is never "list every video course", just what an admin
// cross-sold under a specific Service/Subject). Powers the "Recommended"
// panel a student sees while browsing/selecting a subject - see
// recommended-video-courses.tsx. Never includes the video link.
export async function GetVideoCoursesForAttachmentAction(filters: {
  attachedServiceId?: string;
  attachedTaxonomyNodeId?: string;
}): Promise<[ApiResponse<IVideoCourse[]> | null, string | null]> {
  const params = new URLSearchParams();
  if (filters.attachedServiceId) params.set("attachedServiceId", filters.attachedServiceId);
  if (filters.attachedTaxonomyNodeId) params.set("attachedTaxonomyNodeId", filters.attachedTaxonomyNodeId);
  const qs = params.toString();

  const [res, error] = await fetchAPI({
    url: `/public/video-courses${qs ? `?${qs}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IVideoCourse[]>) : null;
  return [resData, error];
}

// Signed-in student/parent: the video courses their family has unlocked.
export async function GetMyVideoCoursesAction(): Promise<[ApiResponse<IVideoCourse[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/video-courses/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<IVideoCourse[]>) : null;
  return [resData, error];
}

// Just the ids - lets a catalog card show "Watch" instead of "Unlock".
export async function GetMyUnlockedVideoCourseIdsAction(): Promise<[ApiResponse<string[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/video-courses/unlocked-ids",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<string[]>) : null;
  return [resData, error];
}

// The video link + lessons - 403 unless unlocked (or free).
export async function GetVideoCourseToWatchAction(
  id: string
): Promise<[ApiResponse<WatchableVideoCourse> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/video-courses/${id}/watch`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<WatchableVideoCourse>) : null;
  return [resData, error];
}

// Starts a Paystack charge for a paid video course - same
// resumeTransaction(access_code) popup pattern as InitiateResourceUnlockAction.
export async function InitiateVideoCourseUnlockAction(
  id: string
): Promise<[ApiResponse<PaymentRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/video-courses/${id}/unlock`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<PaymentRequest>) : null;
  return [resData, error];
}

// Signed-in student/parent: every published video course, with whether their
// family can already watch it. Never includes the video link.
export async function GetVideoCourseCatalogAction(): Promise<[ApiResponse<CatalogVideoCourse[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/video-courses/catalog",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  const resData = res ? ((await res.json()) as ApiResponse<CatalogVideoCourse[]>) : null;
  return [resData, error];
}
