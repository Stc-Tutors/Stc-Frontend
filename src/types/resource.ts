export enum ResourceStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// `course` comes back populated as an object from /resources/mine and
// /resources/admin/all (see ResourceRepository.findByUploader/findMany),
// but stays a plain id string from /resources/course/:courseId.
// `uploadedBy` is never populated by the backend.
export interface CourseResource {
  id: string;
  title: string;
  fileUrl: string;
  course: string | { id: string; title: string; gradeLevel?: string; tutor?: { firstName: string; lastName: string } };
  uploadedBy: string;
  status: ResourceStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
