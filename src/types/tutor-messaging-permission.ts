// Explicit, per-relationship exception to the "all messaging goes through
// admin" default - an admin with MANAGE_MESSAGING_PERMISSIONS grants two
// specific users (TUTOR/PARENT/STUDENT/HOD, or SUPER_ADMIN/ALMIGHTY_ADMIN if
// the grantor is one) permission to message each other directly. Never a
// blanket role-pair toggle - one targeted allow-list entry per grant. Field
// names are a holdover from when this was tutor<->parent/student only -
// "tutor"/"counterpart" now just mean "first party"/"second party".
export interface ITutorMessagingPermission {
  id: string;
  tutor: string;
  counterpart: string;
  grantedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GrantTutorMessagingPermissionDto {
  tutorId: string;
  counterpartId: string;
}
