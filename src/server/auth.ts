"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { IUserSignup, UserLogin } from "@/types/user";
import { cookies } from "next/headers";

export async function RegisterAction(
  data: IUserSignup
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/signup",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;

  return [resData, error];
}

export async function SigninAction(data: {
  email: string;
  password: string;
}): Promise<[ApiResponse<UserLogin> | null, string | null]> {
  const cookie = await cookies();

  const [res, error] = await fetchAPI({
    url: "/auth/login",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: data.email, password: data.password }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<UserLogin>) : null;

  if (resData && resData.data) {
    const exp = new Date(resData.data.expiresAt);
    cookie.set("token", resData.data.token, {
      expires: exp,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return [resData, error];
}

export async function ForgotAction(data: {
  email: string;
}): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/forgot-password",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;

  return [resData, error];
}
