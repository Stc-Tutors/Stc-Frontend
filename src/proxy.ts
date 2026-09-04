import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROUTES } from "./config/routes";
import { UserRole } from "./types/user";
import { ADMIN_ROLES, isSuperOrAlmighty } from "./lib/roles";

// HOD status is additive (see stcbe's HodService.assign) - a Tutor or Admin
// keeps their own role and simply gains hodScopes on top, so these shared
// pages (all under /lms-home/admin, self-gated by hodAssignment/permission)
// need to stay reachable for UserRole.TUTOR too, not just ADMIN_ROLES.
// Checked before the general "/lms-home/admin" entry below since
// Object.keys(...).find() takes the first (most specific) match.
const HOD_SHARED_PAGE_ROLES = [...ADMIN_ROLES, UserRole.HOD, UserRole.TUTOR];

const ROLE_SECTION_PREFIX: Record<string, UserRole[]> = {
  "/lms-home/admin/tutor-applications": HOD_SHARED_PAGE_ROLES,
  "/lms-home/admin/hod-reports": HOD_SHARED_PAGE_ROLES,
  "/lms-home/admin/hod-unassigned-queue": HOD_SHARED_PAGE_ROLES,
  "/lms-home/admin/hod-tutors": HOD_SHARED_PAGE_ROLES,
  "/lms-home/student": [UserRole.STUDENT],
  "/lms-home/tutor": [UserRole.TUTOR],
  "/lms-home/parent": [UserRole.PARENT],
  // UserRole.HOD included so a legacy dedicated-HOD account (no Tutor/Admin
  // base role) can reach its own ROLE_DASHBOARD target below instead of
  // redirect-looping against this very prefix.
  "/lms-home/admin": [...ADMIN_ROLES, UserRole.HOD],
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

// role's section base, e.g. "/lms-home/student" - every ROLE_DASHBOARD entry
// is "<section base>/dashboard", so this just strips that suffix instead of
// hand-maintaining a second role map.
function roleSectionBase(role: UserRole): string {
  return ROLE_DASHBOARD[role].replace(/\/dashboard$/, "");
}

// Role-agnostic shortcuts - Stc-Mobile's native bottom nav bar links here
// (it has no way to know the signed-in user's role, since that only lives
// in the WebView's own JS/cookie state) and relies on this proxy to resolve
// them to the actual role-specific page. Bare "/lms-home" used to just fall
// through to Next's 404 (no page.tsx there) for anyone already authenticated -
// the unauthenticated case was already covered by the isPublicPage redirect
// below.
const ROLE_HOME_SHORTCUTS: Record<string, (role: UserRole) => string> = {
  "/lms-home": (role) => ROLE_DASHBOARD[role],
  "/lms-home/": (role) => ROLE_DASHBOARD[role],
  "/lms-home/messages": (role) => `${roleSectionBase(role)}/messages`,
  "/lms-home/notification": (role) => `${roleSectionBase(role)}/notification`,
  "/lms-home/profile": (role) => `${roleSectionBase(role)}/profile`,
};

const publicPaths = [
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/services",
  "/program",
  "/blog",
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

export async function proxy(request: Request) {
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

  if (isAuthenticated && role) {
    const shortcut = ROLE_HOME_SHORTCUTS[pathname];
    if (shortcut) return Response.redirect(new URL(shortcut(role), request.url));
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
