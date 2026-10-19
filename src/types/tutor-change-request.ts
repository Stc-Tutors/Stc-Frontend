export enum TutorChangeRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

interface UserRef {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

// A parent/student's request to switch a subject's assigned tutor,
// reviewed by an admin - see stcbe's ITutorChangeRequest. Populated sub-refs
// (student/requestedBy/currentTutor/newTutor/reviewedBy) come back as
// objects, not bare ids - see TutorChangeRequestRepository's POPULATE list.
export interface TutorChangeRequest {
  id: string;
  subjectEnrollment: string;
  student: { id: string; fullName: string };
  subject: string;
  // Denormalized at submission time so the approval dialog can reuse
  // isSubjectAllocatedToTutor's exact eligibility check without a second fetch.
  serviceType?: string;
  subjectNodeId?: string;
  currentTutor?: UserRef;
  requestedBy: UserRef;
  reason: string;
  status: TutorChangeRequestStatus;
  reviewedBy?: UserRef;
  reviewedAt?: string;
  rejectionReason?: string;
  newTutor?: UserRef;
  createdAt: string;
  updatedAt: string;
}
