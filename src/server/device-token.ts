"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

export type DeviceTokenPlatform = "ANDROID" | "DESKTOP" | "WEB";

export async function RegisterDeviceTokenAction(
  token: string,
  platform: DeviceTokenPlatform
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/device-tokens",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

// The public half of the browser-push key; null until the server has browser push configured.
export async function GetWebPushKeyAction(): Promise<[ApiResponse<{ publicKey: string | null }> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/device-tokens/web-push-key",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  return [res ? ((await res.json()) as ApiResponse<{ publicKey: string | null }>) : null, error];
}

export async function UnregisterDeviceTokenAction(token: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/device-tokens/${token}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
