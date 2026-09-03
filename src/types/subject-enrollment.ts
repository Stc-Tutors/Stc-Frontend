// Mirrors stcbe's src/core/interfaces/subject-enrollment.ts - one row per
// (student, subject) once that subject has been paid for, independent of the
// top-level Student.enrollmentStatus in types/student.ts.
export enum SubjectEnrollmentStatus {
  UNASSIGNED_TUTOR = "UNASSIGNED_TUTOR",
  // A tutor has been proposed but hasn't accepted/declined yet - shown to
  // the family the same as "Finding a tutor" below, since from their side
  // there's nothing to distinguish (no action for them either way).
  PENDING_TUTOR_ACCEPTANCE = "PENDING_TUTOR_ACCEPTANCE",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  ACTIVE = "ACTIVE",
}

export const SUBJECT_ENROLLMENT_STATUS_LABELS: Record<SubjectEnrollmentStatus, string> = {
  [SubjectEnrollmentStatus.UNASSIGNED_TUTOR]: "Finding a tutor",
  [SubjectEnrollmentStatus.PENDING_TUTOR_ACCEPTANCE]: "Finding a tutor",
  [SubjectEnrollmentStatus.PENDING_CONFIRMATION]: "Pending Confirmation",
  [SubjectEnrollmentStatus.ACTIVE]: "Active",
};

export interface SubjectEnrollment {
  id: string;
  student: string;
  subject: string;
  subjectNodeId?: string;
  serviceType?: string;
  payment: string;
  status: SubjectEnrollmentStatus;
  courseEnrollment?: string;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}
