export enum ResourceStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ResourceAccessTier {
  FREE = "FREE",
  PAID = "PAID",
}

export enum ResourceType {
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

// `course` comes back populated as an object from /resources/mine and
// /resources/admin/all (see ResourceRepository.findByUploader/findMany),
// but stays a plain id string from /resources/course/:courseId.
// `uploadedBy` is never populated by the backend.
export interface CourseResource {
  id: string;
  title: string;
  // Empty string when this is a PAID resource the requesting
  // student/parent hasn't unlocked yet (see stcbe's
  // ResourceService.getApprovedByCourse) - check accessTier/price instead of
  // fileUrl to decide whether to show a locked state.
  fileUrl: string;
  course: string | { id: string; title: string; gradeLevel?: string; tutor?: { firstName: string; lastName: string } };
  // Empty/absent - visible to every student enrolled in `course` (default).
  // Non-empty - visible only to these specific Student ids.
  students?: string[];
  uploadedBy: string;
  // Missing on resources created before the `type` field existed - treat
  // an absent value as ResourceType.DOCUMENT wherever resources are bucketed by type.
  type?: ResourceType;
  status: ResourceStatus;
  rejectionReason?: string;
  accessTier: ResourceAccessTier;
  price?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}
