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
  if (!res) return [null, error];

  // A malformed/non-JSON body here (e.g. an intermediary error page slipping
  // through with a 2xx status) used to throw uncaught out of this Server
  // Component, which Next has no boundary for and turns into its bare
  // generic 500 instead of a normal not-found. Degrade to that instead.
  try {
    return [(await res.json()) as ApiResponse<CampaignLandingPage>, null];
  } catch {
    return [null, "Could not read the server response"];
  }
}
