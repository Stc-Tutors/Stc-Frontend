// Mirrors stcbe's src/core/interfaces/subject-enrollment.ts - one row per
// (student, subject) once that subject has been paid for, independent of the
// top-level Student.enrollmentStatus in types/student.ts.
export enum SubjectEnrollmentStatus {
  UNASSIGNED_TUTOR = "UNASSIGNED_TUTOR",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  ACTIVE = "ACTIVE",
}

export const SUBJECT_ENROLLMENT_STATUS_LABELS: Record<SubjectEnrollmentStatus, string> = {
  [SubjectEnrollmentStatus.UNASSIGNED_TUTOR]: "Finding a tutor",
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
