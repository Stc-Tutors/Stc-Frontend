import { UserRole } from "@/types/user";

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    LOGOUT: "/api/auth/logout"
  },
  DASHBOARD: {
    HOME: "/dashboard",
    ENROLLMENTS: "/dashboard/enrollments",
    SETTINGS: "/dashboard/settings",
    PROFILE: "/dashboard/profile",
    NOTIFICATIONS: "/dashboard/notifications",
    PAYMENT_HISTORY: "/dashboard/payment-history",
  },
  LMS: {
    STUDENT: {
      DASHBOARD: "/lms-home/student/dashboard",
      ENROLLMENT: "/lms-home/student/enrollment",
      // Was "/subscription" (recurring billing plans - a different page
      // entirely) - post-payment redirects need the actual one-time-payment
      // list, where a just-completed enrollment charge actually shows up.
      PAYMENT_HISTORY: "/lms-home/student/payments",
    },
    PARENT: {
      DASHBOARD: "/lms-home/parent/dashboard",
      ENROLLMENT: "/lms-home/parent/enrollment",
      PAYMENT_HISTORY: "/lms-home/parent/payments",
      ADD_CHILD: "/lms-home/parent/add-child",
    },
  },
};

// Used by the /dashboard/enroll(+enrollments) redirect shims to send an
// authenticated user into their role's LMS enrollment area.
export function lmsEnrollmentBasePath(role?: UserRole | null): string {
  if (role === UserRole.STUDENT) return ROUTES.LMS.STUDENT.ENROLLMENT;
  if (role === UserRole.PARENT) return ROUTES.LMS.PARENT.ENROLLMENT;
  // Admins/super admins already have their own review area.
  return "/lms-home/admin/enrollments";
}

// Mirrors proxy.ts's ROLE_DASHBOARD map - the "Dashboard" link in the
// account dropdown (public Navbar + DashboardHeader) needs the same
// role -> path resolution the auth proxy already uses, so it never sends
// someone to a dashboard proxy.ts would immediately bounce them out of.
export function lmsDashboardPath(role?: UserRole | null): string {
  switch (role) {
    case UserRole.STUDENT:
      return "/lms-home/student/dashboard";
    case UserRole.TUTOR:
      return "/lms-home/tutor/dashboard";
    case UserRole.PARENT:
      return "/lms-home/parent/dashboard";
    default:
      // HOD/STC_ADMIN/TUTOR_ADMIN/SUPER_ADMIN/ALMIGHTY_ADMIN all land here.
      return "/lms-home/admin/dashboard";
  }
}
