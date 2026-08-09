import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROUTES } from "./config/routes";
import { UserRole } from "./types/user";
import { ADMIN_ROLES, isSuperOrAlmighty } from "./lib/roles";

const ROLE_SECTION_PREFIX: Record<string, UserRole[]> = {
  "/lms-home/student": [UserRole.STUDENT],
  "/lms-home/tutor": [UserRole.TUTOR],
  "/lms-home/parent": [UserRole.PARENT],
  "/lms-home/admin": ADMIN_ROLES,
};

const ROLE_DASHBOARD: Record<UserRole, string> = {
  [UserRole.STUDENT]: "/lms-home/student/dashboard",
  [UserRole.TUTOR]: "/lms-home/tutor/dashboard",
  [UserRole.PARENT]: "/lms-home/parent/dashboard",
  [UserRole.HOD]: "/lms-home/admin/dashboard",
  [UserRole.STC_ADMIN]: "/lms-home/admin/dashboard",
  [UserRole.TUTOR_ADMIN]: "/lms-home/admin/dashboard",
  // Super admins (and the platform-owner Almighty Admin) manage the platform
  // from the separate Super Admin app; within this app they're treated as admins.
  [UserRole.SUPER_ADMIN]: "/lms-home/admin/dashboard",
  [UserRole.ALMIGHTY_ADMIN]: "/lms-home/admin/dashboard",
};

const publicPaths = [
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/services",
  "/program",
];

async function getRoleFromToken(token: string): Promise<UserRole | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return (payload.role as UserRole) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;

  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPage =
    pathname === "/" || publicPaths.some((publicPath) => publicPath !== "/" && pathname.startsWith(publicPath));

  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const role = token ? await getRoleFromToken(token) : null;
  const isAuthenticated = !!role;

  if (isAuthPage && isAuthenticated) {
    return Response.redirect(new URL(ROLE_DASHBOARD[role], request.url));
  }

  if (!isAuthPage && !isAuthenticated && !isPublicPage) {
    return Response.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  if (isAuthenticated && role && !isSuperOrAlmighty(role)) {
    const matchedPrefix = Object.keys(ROLE_SECTION_PREFIX).find((prefix) => pathname.startsWith(prefix));
    if (matchedPrefix && !ROLE_SECTION_PREFIX[matchedPrefix].includes(role)) {
      return Response.redirect(new URL(ROLE_DASHBOARD[role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|image|video).*)"],
};
