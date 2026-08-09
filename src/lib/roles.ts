import { UserRole } from "@/types/user";

// Mirrors stcbe's src/core/authorization/roles.ts - the two roles that
// replaced the old flat ADMIN role.
export const ADMIN_ROLES: UserRole[] = [UserRole.STC_ADMIN, UserRole.TUTOR_ADMIN];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isSuperOrAlmighty(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ALMIGHTY_ADMIN;
}

export function isAdminOrAbove(role: UserRole): boolean {
  return isAdminRole(role) || isSuperOrAlmighty(role);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STUDENT]: "Student",
  [UserRole.PARENT]: "Parent",
  [UserRole.TUTOR]: "Tutor",
  [UserRole.HOD]: "HOD",
  [UserRole.STC_ADMIN]: "STC Admin",
  [UserRole.TUTOR_ADMIN]: "Tutor Admin",
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ALMIGHTY_ADMIN]: "Almighty Admin",
};
