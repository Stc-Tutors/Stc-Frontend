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
  LIVE_RECORDING = "LIVE_RECORDING",
}

// A resource targets exactly one of course/subject/students - see stcbe's
// IResource for the full explanation. `course` comes back populated as an
// object from /resources/mine and /resources/admin/all (see
// ResourceRepository.findByUploader/findMany), but stays a plain id string
// from /resources/course/:courseId. `uploadedBy` is never populated by the
// backend.
export interface CourseResource {
  id: string;
  title: string;
  // Empty string when this is a PAID resource the requesting
  // student/parent hasn't unlocked yet (see stcbe's
  // ResourceService.getApprovedByCourse/getForLearner) - check
  // accessTier/price instead of fileUrl to decide whether to show a locked
  // state.
  fileUrl: string;
  course?: string | { id: string; title: string; gradeLevel?: string; tutor?: { firstName: string; lastName: string } };
  subject?: string;
  serviceType?: string;
  // Only meaningful when course/subject are both unset - the standalone
  // "specific students" target mode.
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
