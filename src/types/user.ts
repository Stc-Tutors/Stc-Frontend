export enum UserRole {
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  TUTOR = "TUTOR",
  HOD = "HOD",
  STC_ADMIN = "STC_ADMIN",
  TUTOR_ADMIN = "TUTOR_ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  ALMIGHTY_ADMIN = "ALMIGHTY_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  // Omitted entirely by the backend for viewers who aren't authorized to see
  // it (TUTOR/TUTOR_ADMIN, or STC_ADMIN without VIEW_CONTACT_INFO), and for
  // student-ID (email-less child) accounts - never assume presence.
  email?: string;
  role: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  phone?: string;
  address?: string;
  profilePicture?: string;
  avatarUrl?: string;
  joinedDate: string;
  // Set for parent-created child accounts (e.g. "STC-2026-0041") - the login
  // identifier used in place of email.
  studentId?: string;
  // Whether this user has accepted the current Terms & Conditions version -
  // only present on GET /users/me; drives the mandatory T&C modal.
  termsAccepted?: boolean;
}

// A tutor applicant who's still PENDING_APPROVAL (drafting or flagged for
// more info) logs in successfully but gets no normal session `token` - see
// AuthService.loginPendingTutor. `draftToken` resumes the wizard
// (tutor-application-context.tsx), `statusToken` unlocks the status/support
// page (tutor-application-status.tsx) - only one of the two is ever present,
// matching whichever tutorApplicationStatus came back.
export interface UserLogin {
  token?: string;
  user: User;
  tutorApplicationStatus?: "DRAFT" | "NEEDS_MORE_INFO";
  tutorApplicationId?: string;
  tutorApplicationCurrentStep?: number;
  draftToken?: string;
  statusToken?: string;
}

export interface IUserLogin {
  email: string;
  role: UserRole;
  password: string;
}

export interface IUserSignup {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  // Referrer's User id, carried over from the `ref` query param on a
  // referral link (e.g. /auth/register?ref=<referrer id>).
  ref?: string;
}