"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export interface SiteContent {
  id: string;
  key: string;
  section: string;
  label: string;
  value: string;
  updatedAt: string;
}

// Public, unauthenticated CMS lookup - safe to call before the T&C gate is
// cleared, unlike almost everything else behind authMiddleware.
export async function GetSiteContentAction(): Promise<[ApiResponse<SiteContent[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/site-content",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<SiteContent[]>) : null;
  return [resData, error];
}

export interface HomepageSlide {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  caption?: string;
  order: number;
  isActive: boolean;
}

// Public, unauthenticated - the homepage's top-of-page carousel. Already
// filtered to active-only and sorted by order server-side.
export async function GetHomepageSlidesAction(): Promise<[ApiResponse<HomepageSlide[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/homepage-slides",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<HomepageSlide[]>) : null;
  return [resData, error];
}
