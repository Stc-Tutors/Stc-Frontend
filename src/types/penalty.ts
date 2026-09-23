export enum TutorNoShowReportStatus {
  PENDING = "PENDING",
  TUTOR_NO_SHOW_CONFIRMED = "TUTOR_NO_SHOW_CONFIRMED",
  MUTUAL_NO_SHOW = "MUTUAL_NO_SHOW",
  DISMISSED = "DISMISSED",
}

export interface TutorNoShowReport {
  id: string;
  lesson: string;
  course: string;
  reportedBy: string;
  student: string;
  reason?: string;
  status: TutorNoShowReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum StudentPenaltyType {
  NO_SHOW = "NO_SHOW",
  LATE_CANCEL = "LATE_CANCEL",
  LATE_RESCHEDULE = "LATE_RESCHEDULE",
}

export enum StudentPenaltyChargeStatus {
  APPLIED = "APPLIED",
  VOIDED = "VOIDED",
}

export enum StudentPenaltyAppealStatus {
  PENDING = "PENDING",
  UPHELD = "UPHELD",
  GRANTED = "GRANTED",
}

export const STUDENT_PENALTY_TYPE_LABELS: Record<StudentPenaltyType, string> = {
  [StudentPenaltyType.NO_SHOW]: "No-show",
  [StudentPenaltyType.LATE_CANCEL]: "Late cancellation",
  [StudentPenaltyType.LATE_RESCHEDULE]: "Late reschedule",
};

// A charge against this family - see stcbe's IStudentPenaltyCharge. `course`/
// `student` are left as raw ids (not populated server-side for this route).
export interface StudentPenaltyCharge {
  id: string;
  lesson: string;
  course: string;
  student: string;
  type: StudentPenaltyType;
  lessonValue: number;
  currency: string;
  forfeitedAmount: number;
  walletCreditAmount: number;
  status: StudentPenaltyChargeStatus;
  appealStatus?: StudentPenaltyAppealStatus;
  appealReason?: string;
  appealedAt?: string;
  appealResolvedAt?: string;
  appealResolutionNote?: string;
  createdAt: string;
}

// GET /penalty/admin/settings is admin-only, so the family-facing scheduling
// UI can't read the real (super-admin-configurable) grace period to decide
// when "Report tutor no-show" should appear. This mirrors the backend's own
// default (see stcbe's PenaltySettingsModel) purely for client-side button
// visibility - the server is the actual source of truth and will reject a
// too-early report with a clear error regardless of this guess.
export const DEFAULT_NO_SHOW_GRACE_PERIOD_MINUTES = 20;
