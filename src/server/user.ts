"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { User } from "@/types/user";

export async function GetUserAction(
): Promise<[ApiResponse<User> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/users/me",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User>) : null;

  return [resData, error];
}

export async function UpdateUserAction(
  data: Partial<User>
): Promise<[ApiResponse<User> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/users/me",
    request: {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<User>) : null;

  return [resData, error];
}
