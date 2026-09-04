import { Course } from "@/types/course";
import { CourseEnrollment } from "@/types/course-enrollment";
import { User } from "@/types/user";

export enum SubjectEnrollmentStatus {
  UNASSIGNED_TUTOR = "UNASSIGNED_TUTOR",
  // An HOD proposed a tutor under a scope that requires Super Admin
  // approval - the tutor hasn't been notified yet.
  PENDING_ADMIN_APPROVAL = "PENDING_ADMIN_APPROVAL",
  // A tutor has been proposed but hasn't accepted/declined yet.
  PENDING_TUTOR_ACCEPTANCE = "PENDING_TUTOR_ACCEPTANCE",
  // The tutor accepted, but the Google Meet link hasn't been entered yet -
  // shown as "Pending Confirmation".
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  // The Meet link has been saved - shown as "Active".
  ACTIVE = "ACTIVE",
}

export const SUBJECT_ENROLLMENT_STATUS_LABELS: Record<SubjectEnrollmentStatus, string> = {
  [SubjectEnrollmentStatus.UNASSIGNED_TUTOR]: "Unassigned",
  [SubjectEnrollmentStatus.PENDING_ADMIN_APPROVAL]: "Awaiting Super Admin Approval",
  [SubjectEnrollmentStatus.PENDING_TUTOR_ACCEPTANCE]: "Awaiting Tutor Response",
  [SubjectEnrollmentStatus.PENDING_CONFIRMATION]: "Pending Confirmation",
  [SubjectEnrollmentStatus.ACTIVE]: "Active",
};

// Minimal shape of the populated `student` field on a SubjectEnrollment -
// see stcbe's SubjectEnrollmentRepository's STUDENT_POPULATE select list.
export interface SubjectEnrollmentStudent {
  id: string;
  fullName: string;
  parentEmail?: string;
  parentName?: string;
}

export interface SubjectEnrollment {
  id: string;
  student: SubjectEnrollmentStudent;
  subject: string;
  subjectNodeId?: string;
  // IService.slug this subject was paid under.
  serviceType?: string;
  // Set for a Group Class registration once payment succeeds - every row
  // sharing this id is meant to end up in the same Course once a tutor is
  // assigned to the whole group.
  classGroup?: string;
  payment: string;
  status: SubjectEnrollmentStatus;
  // Set while status is PENDING_TUTOR_ACCEPTANCE - who's being asked.
  // courseEnrollment (and so its tutor) doesn't exist yet at that point.
  pendingTutor?: string;
  courseEnrollment?: CourseEnrollment | string;
  // Static Google Meet URL - set via SetMeetingLinkAction, the trigger that
  // flips status PENDING_CONFIRMATION -> ACTIVE.
  meetingUrl?: string;
  lastRejectedBy?: string;
  lastRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Smart Tutor Suggestion Engine result.
export interface SuggestedTutor {
  tutor: User;
  tutorProfileId: string;
  matchedTeachingCombination?: { serviceType: string; country: string; curriculum: string; gradeLevel: string; subjectsTaught: string[] };
  hasConflict: boolean;
}

export interface AdminOversightAllocation {
  id: string;
  admin: string;
  subjectEnrollment: SubjectEnrollment;
  assignedBy: string;
  createdAt: string;
}

export interface AllocationHubSummary {
  unassignedTutorCount: number;
  unassignedOversightCount: number;
}

export interface BulkActionResult {
  subjectEnrollmentId: string;
  success: boolean;
  message: string;
}

export interface TutorTeachingSummary {
  activeCount: number;
  courses: { course: Course; studentCount: number }[];
}
