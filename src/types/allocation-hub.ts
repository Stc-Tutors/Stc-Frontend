import { Course } from "@/types/course";
import { CourseEnrollment } from "@/types/course-enrollment";
import { User } from "@/types/user";

export enum SubjectEnrollmentStatus {
  UNASSIGNED_TUTOR = "UNASSIGNED_TUTOR",
  // A tutor has been allocated but the Google Meet link hasn't been entered
  // yet - shown as "Pending Confirmation".
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  // The Meet link has been saved - shown as "Active".
  ACTIVE = "ACTIVE",
}

export const SUBJECT_ENROLLMENT_STATUS_LABELS: Record<SubjectEnrollmentStatus, string> = {
  [SubjectEnrollmentStatus.UNASSIGNED_TUTOR]: "Unassigned",
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
  payment: string;
  status: SubjectEnrollmentStatus;
  courseEnrollment?: CourseEnrollment | string;
  // Static Google Meet URL - set via SetMeetingLinkAction, the trigger that
  // flips status PENDING_CONFIRMATION -> ACTIVE.
  meetingUrl?: string;
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
