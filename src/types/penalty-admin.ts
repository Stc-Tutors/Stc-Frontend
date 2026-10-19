export enum TutorNoShowReportStatus {
  PENDING = "PENDING",
  TUTOR_NO_SHOW_CONFIRMED = "TUTOR_NO_SHOW_CONFIRMED",
  MUTUAL_NO_SHOW = "MUTUAL_NO_SHOW",
  DISMISSED = "DISMISSED",
}

export interface PenaltySettings {
  id: string;
  gracePeriodMinutes: number;
  studentNoShowForfeitPercent: number;
  studentLateCancelForfeitPercent: number;
  studentLateRescheduleForfeitPercent: number;
  tutorNoShowShareOfForfeitPercent: number;
  tutorLateCancelShareOfForfeitPercent: number;
  tutorNoShowPenaltyPercent: number;
  updatedBy?: string;
  updatedAt: string;
}

export type UpdatePenaltySettingsPayload = Partial<
  Omit<PenaltySettings, "id" | "updatedBy" | "updatedAt">
>;

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

// A no-show/late-cancel/late-reschedule charge against a family, and
// whatever appeal (if any) they've filed against it - see stcbe's
// IStudentPenaltyCharge/PenaltyService.fileAppeal/resolveAppeal.
export interface StudentPenaltyCharge {
  id: string;
  lesson: string;
  course: string | { id: string; title: string };
  student: string | { id: string; fullName: string };
  payer: string;
  tutor: string | { id: string; firstName: string; lastName: string };
  type: StudentPenaltyType;
  lessonValue: number;
  currency: string;
  forfeitPercentApplied: number;
  forfeitedAmount: number;
  walletCreditAmount: number;
  tutorSharePercentApplied: number;
  tutorShareAmount: number;
  platformShareAmount: number;
  status: StudentPenaltyChargeStatus;
  voidedAt?: string;
  voidReason?: string;
  appealStatus?: StudentPenaltyAppealStatus;
  appealReason?: string;
  appealedAt?: string;
  appealResolvedAt?: string;
  appealResolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorNoShowReport {
  id: string;
  // Populated by TutorNoShowReportRepository.findMany - `student` is
  // deliberately left as a raw id (not populated server-side).
  lesson: string | { id: string; title: string; scheduledDate: string; actualStartTime?: string; actualEndTime?: string };
  course: string | { id: string; title: string; tutor?: string };
  reportedBy: string | { id: string; firstName: string; lastName: string; email?: string };
  student: string;
  reason?: string;
  status: TutorNoShowReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}
