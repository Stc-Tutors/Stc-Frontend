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

// Accepts either an email or a studentId as the login identifier - exactly
// one should be present, matching the backend's LoginDto.
export async function SigninAction(data: {
  email?: string;
  studentId?: string;
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
      body: JSON.stringify(
        data.studentId
          ? { studentId: data.studentId, password: data.password }
          : { email: data.email, password: data.password }
      ),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<UserLogin>) : null;

  // A still-PENDING_APPROVAL tutor (drafting or flagged for more info) logs
  // in successfully but gets no normal session token at all - only a
  // narrowly-scoped draftToken/statusToken (see AuthService.loginPendingTutor
  // and UserLogin). Nothing to set as a session cookie in that case; the
  // caller (login-form.tsx) handles those tokens itself.
  if (resData?.data?.token) {
    // The backend issues a 24h JWT and doesn't return a separate expiry timestamp,
    // so the cookie's lifetime is set to match it directly.
    // `secure: true` unconditionally rather than gating on NODE_ENV - the
    // live site is always HTTPS, and browsers treat localhost as a secure
    // context too, so this is safe for local dev as well. Removes any
    // dependency on NODE_ENV actually resolving to "production" at runtime
    // on the hosting platform.
    cookie.set("token", resData.data.token, {
      maxAge: 60 * 60 * 24,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }

  return [resData, error];
}

// Parent-authenticated: creates a login-enabled child (STUDENT-role) account
// with no email. Returns the server-generated studentId - the parent must
// hand it to the child, since it isn't retrievable again from this action.
export async function RegisterChildAction(data: {
  firstName: string;
  lastName: string;
  password: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  countryOfResidence?: string;
  primaryLanguage?: string;
}): Promise<[ApiResponse<{ user: UserLogin["user"]; studentId: string }> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/children",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  });

  const resData = res
    ? ((await res.json()) as ApiResponse<{ user: UserLogin["user"]; studentId: string }>)
    : null;

  return [resData, error];
}

// Authenticated self-service password change (requires the current password),
// as opposed to ForgotAction/ResetPasswordAction's logged-out email-token flow.
export async function ChangePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/change-password",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;

  return [resData, error];
}

// Records acceptance of the current Terms & Conditions for the logged-in
// user - see the mandatory T&C modal in RootLayout.
export async function AcceptTermsAction(): Promise<[ApiResponse<{ version: string }> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/terms/accept",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<{ version: string }>) : null;
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

export async function ResetPasswordAction(data: {
  token: string;
  password: string;
}): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/reset-password",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;

  return [resData, error];
}

export async function VerifyEmailAction(
  token: string
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/verify-email",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;

  return [resData, error];
}

export async function ResendVerificationAction(
  email: string
): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/auth/resend-verification",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;

  return [resData, error];
}
