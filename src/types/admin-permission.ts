export enum AdminPermission {
  MANAGE_USERS = "MANAGE_USERS",
  CANCEL_CLASSES = "CANCEL_CLASSES",
  APPROVE_RESCHEDULES = "APPROVE_RESCHEDULES",
  ASSIGN_STUDENTS_TO_TUTORS = "ASSIGN_STUDENTS_TO_TUTORS",
  MANAGE_PRICING = "MANAGE_PRICING",
  REVIEW_TUTOR_APPLICATIONS = "REVIEW_TUTOR_APPLICATIONS",
  VIEW_ALL_SCHEDULES = "VIEW_ALL_SCHEDULES",
  MANAGE_TAXONOMY = "MANAGE_TAXONOMY",
  MANAGE_STUDENTS = "MANAGE_STUDENTS",
  APPROVE_RESOURCES = "APPROVE_RESOURCES",
  MANAGE_SCHEDULES = "MANAGE_SCHEDULES",
  MANAGE_ANNOUNCEMENTS = "MANAGE_ANNOUNCEMENTS",
  MANAGE_COMPLAINTS = "MANAGE_COMPLAINTS",
  VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
  VIEW_CONTACT_INFO = "VIEW_CONTACT_INFO",
  MANAGE_REFERRAL_SETTINGS = "MANAGE_REFERRAL_SETTINGS",
  // Revenue/finance/payout-turnaround/expenses/profit reports - gated
  // separately from the operational reports (enrollments, attendance,
  // tutor-performance, ...), which stay open to any assigned admin.
  VIEW_FINANCIAL_REPORTS = "VIEW_FINANCIAL_REPORTS",
  // Set/edit a Lesson's meetingUrl - TUTOR can never do this regardless of
  // this toggle; only controls whether a plain STC_ADMIN/TUTOR_ADMIN can.
  MANAGE_MEETING_LINKS = "MANAGE_MEETING_LINKS",
}

// The GET /users/me/permissions response shape: '*' means unrestricted
// (SUPER_ADMIN/ALMIGHTY_ADMIN, or an admin with an unrestricted assignment);
// an array is the granted permission list; empty means none.
export type MyPermissions = AdminPermission[] | "*";
