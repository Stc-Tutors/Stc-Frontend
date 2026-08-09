"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Announcement, SendAnnouncementPayload } from "@/types/announcement";

export async function SendAnnouncementAction(
  data: SendAnnouncementPayload
): Promise<[ApiResponse<Announcement> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/announcements",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Announcement>) : null;
  return [resData, error];
}

export async function GetAnnouncementsAction(): Promise<[ApiResponse<Announcement[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/announcements",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Announcement[]>) : null;
  return [resData, error];
}
