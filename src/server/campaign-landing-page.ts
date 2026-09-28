"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CampaignLandingPage } from "@/types/campaign-landing-page";

export async function GetCampaignLandingPageAction(
  slug: string
): Promise<[ApiResponse<CampaignLandingPage> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/landing-pages/${slug}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CampaignLandingPage>) : null;
  return [resData, error];
}
