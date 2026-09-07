// Mirrors stcbe's src/core/interfaces/subject-enrollment.ts - one row per
// (student, subject) once that subject has been paid for, independent of the
// top-level Student.enrollmentStatus in types/student.ts.
export enum SubjectEnrollmentStatus {
  UNASSIGNED_TUTOR = "UNASSIGNED_TUTOR",
  // A tutor has been proposed but hasn't accepted/declined yet - shown to
  // the family the same as "Finding a tutor" below, since from their side
  // there's nothing to distinguish (no action for them either way).
  PENDING_TUTOR_ACCEPTANCE = "PENDING_TUTOR_ACCEPTANCE",
  // Group Class only: an admin/HOD proposed a tutor AND a day/time matrix -
  // unlike every other status here, this is one the family actually has to
  // act on (see GroupScheduleConfirmationBanner) - confirm or decline the
  // proposed schedule.
  PENDING_STUDENT_CONFIRMATION = "PENDING_STUDENT_CONFIRMATION",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  ACTIVE = "ACTIVE",
}

export const SUBJECT_ENROLLMENT_STATUS_LABELS: Record<SubjectEnrollmentStatus, string> = {
  [SubjectEnrollmentStatus.UNASSIGNED_TUTOR]: "Finding a tutor",
  [SubjectEnrollmentStatus.PENDING_TUTOR_ACCEPTANCE]: "Finding a tutor",
  [SubjectEnrollmentStatus.PENDING_STUDENT_CONFIRMATION]: "Confirm your class schedule",
  [SubjectEnrollmentStatus.PENDING_CONFIRMATION]: "Pending Confirmation",
  [SubjectEnrollmentStatus.ACTIVE]: "Active",
};

// A Group Class's definitive day/time matrix, proposed alongside the tutor.
export interface SubjectEnrollmentSchedule {
  days: string[];
  time: string;
  durationMinutes: number;
  weeks: number;
  startDate?: string;
  timezone?: string;
}

export interface SubjectEnrollment {
  id: string;
  student: string;
  subject: string;
  subjectNodeId?: string;
  serviceType?: string;
  payment: string;
  status: SubjectEnrollmentStatus;
  // Group Class only - see PENDING_STUDENT_CONFIRMATION.
  proposedSchedule?: SubjectEnrollmentSchedule;
  courseEnrollment?: string;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}
