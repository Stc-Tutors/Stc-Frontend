"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

// The public Contact page's form - unauthenticated. Delivers to the admins (in-app
// and email) and stores the message; see stcbe's ContactMessageService.
export async function SendContactMessageAction(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/contact",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
