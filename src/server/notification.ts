"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Notification } from "@/types/notification";

export async function GetNotificationsAction(
  unreadOnly?: boolean
): Promise<[ApiResponse<Notification[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Notification[]>) : null;
  return [resData, error];
}

export async function MarkNotificationReadAction(id: string): Promise<[ApiResponse<Notification> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/notifications/${id}/read`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Notification>) : null;
  return [resData, error];
}

export async function MarkAllNotificationsReadAction(): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/notifications/read-all",
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
