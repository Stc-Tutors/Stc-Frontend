"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { IVideoCourse } from "@/types/video-course";

// Public/unauthenticated on the backend - requires at least one attachment
// filter (this is never "list every video course", just what an admin
// cross-sold under a specific Service/Subject). Powers the "Recommended"
// panel a student sees while browsing/selecting a subject - see
// recommended-video-courses.tsx.
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
