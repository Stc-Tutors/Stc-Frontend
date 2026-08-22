// HOD status is additive, not an exclusive role (see stcbe's HodService.assign)
// - a Tutor or Admin keeps their own role/capabilities in full and simply
// gains whatever their hodScopes grant on top. Mirrors stcbe's
// src/core/interfaces/hod-assignment.ts.
export enum HodPermission {
  MANAGE_COURSES = "MANAGE_COURSES",
  VIEW_REPORTS = "VIEW_REPORTS",
  REVIEW_TUTOR_APPLICATIONS = "REVIEW_TUTOR_APPLICATIONS",
  MANAGE_UNASSIGNED_QUEUE = "MANAGE_UNASSIGNED_QUEUE",
}

export const HOD_PERMISSION_LABELS: Record<HodPermission, string> = {
  [HodPermission.MANAGE_COURSES]: "Manage courses",
  [HodPermission.VIEW_REPORTS]: "View reports",
  [HodPermission.REVIEW_TUTOR_APPLICATIONS]: "Review tutor applications",
  [HodPermission.MANAGE_UNASSIGNED_QUEUE]: "Manage the Unassigned Enrollments queue",
};

// The free-text tutor-application vocabulary - only meaningful for
// REVIEW_TUTOR_APPLICATIONS (matched against ITeachingCycle, which predates/
// doesn't carry Service Catalog taxonomyNodeIds).
export interface HodScopeContext {
  curriculum?: string[];
  gradeLevel?: string[];
  examBoard?: string[];
  ageRange?: string[];
}

// One independently-narrowable HOD scope - `service` alone scopes an entire
// service; `taxonomyNodeIds`/`courseIds` narrow MANAGE_COURSES/VIEW_REPORTS/
// MANAGE_UNASSIGNED_QUEUE against real Service Catalog data; `context`/
// `subjects` narrow REVIEW_TUTOR_APPLICATIONS against the tutor-application
// vocabulary instead. `permissions` belongs to this scope alone.
export interface HodScopeAssignment {
  service: string;
  taxonomyNodeIds?: string[];
  courseIds?: string[];
  context?: HodScopeContext;
  subjects?: string[];
  permissions: HodPermission[];
}

export interface HodAssignment {
  id: string;
  user: string;
  hodScopes: HodScopeAssignment[];
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

export function hodHasPermission(assignment: HodAssignment | null | undefined, permission: HodPermission): boolean {
  return !!assignment?.hodScopes.some((scope) => scope.permissions.includes(permission));
}
