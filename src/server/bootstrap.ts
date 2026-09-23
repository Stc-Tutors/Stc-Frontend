"use server";

import { GetUserAction, GetMyPermissionsAction } from "@/server/user";
import { GetMyHodAssignmentAction } from "@/server/hod";
import { GetMyRestrictionsAction } from "@/server/subscription";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { User, UserRole } from "@/types/user";
import { MyPermissions } from "@/types/admin-permission";
import { HodAssignment } from "@/types/hod";
import { SubscriptionRestrictions } from "@/types/subscription";
import { Student } from "@/types/student";

// Everything the signed-in shell needs before it can draw, fetched here in ONE
// Server Action instead of one action per piece. The client dispatches Server
// Actions strictly one at a time, so the previous layout of three actions in
// the user provider, one in the access gate, two in the student provider and
// one in the role layout meant seven serial round trips (each a phone -> Next ->
// API hop) before anything but a spinner was on screen. Here the pieces are
// fetched in parallel server-side, where the hop to the API is short.

export interface SessionBootstrap {
  user: User;
  permissions: MyPermissions;
  hodAssignment: HodAssignment | null;
  // Only for the two roles that live behind the access gate / child switcher.
  restrictions: SubscriptionRestrictions | null;
  students: Student[] | null;
}

export interface SessionBootstrapResult {
  data: SessionBootstrap | null;
  error: string | null;
  // True only for a definite "this session is not valid" (401, or the account/
  // tenant itself no longer being usable), as opposed to a network hiccup or a
  // slow API - the former must log out, the latter must not.
  unauthorized: boolean;
}

// A live session's own next request can now come back 403 with one of these
// (authMiddleware checks the account's/tenant's current status on every
// request, not just at login) - without this, a user suspended/deactivated/
// whose tenant went inactive while still signed in was stuck on the
// generic "couldn't load your session, retry" screen forever instead of
// being sent back to login. SESSION_EXPIRED (401) is the same idea for a
// password change/reset - see stcbe's ITokenPayload.tokenVersion/
// authMiddleware, which invalidates every other outstanding token the
// moment either happens.
const TERMINAL_SESSION_ERRORS = new Set([
  'Unauthorized',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_DEACTIVATED',
  'TENANT_INACTIVE',
  'SESSION_EXPIRED',
]);

// A parent sees the children linked to them; a self-registered adult student
// has no parent, so their own enrollments come back from the other endpoint.
// Merging both lets one child-switcher serve both (see SelectedStudentProvider).
export async function GetMyStudentsAction(): Promise<[Student[] | null, string | null]> {
  const [[linkedRes, linkedError], [ownRes, ownError]] = await Promise.all([GetLinkedStudentsAction(), GetEnrollmentsAction()]);
  // Both failing is an error (don't overwrite good cached data with "no
  // children"); one failing just means that half is empty.
  if (linkedError && ownError) return [null, linkedError];
  const byId = new Map<string, Student>();
  [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])].forEach((s) => byId.set(s.id, s));
  return [Array.from(byId.values()), null];
}

export async function GetSessionBootstrapAction(): Promise<SessionBootstrapResult> {
  const [userRes, userError] = await GetUserAction();
  if (userError || !userRes?.data) {
    return { data: null, error: userError ?? "Couldn't load your session", unauthorized: TERMINAL_SESSION_ERRORS.has(userError ?? "") };
  }
  const user = userRes.data;
  const isLmsRole = user.role === UserRole.STUDENT || user.role === UserRole.PARENT;

  const [permissions, hod, restrictions, students] = await Promise.all([
    GetMyPermissionsAction(),
    // A 404 (no assignment) is the normal case, not an error.
    GetMyHodAssignmentAction(),
    isLmsRole ? GetMyRestrictionsAction() : Promise.resolve(null),
    isLmsRole ? GetMyStudentsAction() : Promise.resolve(null),
  ]);

  return {
    data: {
      user,
      permissions: permissions[0]?.data ?? [],
      hodAssignment: hod[0]?.data ?? null,
      restrictions: restrictions?.[0]?.data ?? null,
      students: students?.[0] ?? null,
    },
    error: null,
    unauthorized: false,
  };
}
