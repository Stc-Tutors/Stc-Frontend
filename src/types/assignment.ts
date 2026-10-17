import { UploadedFile } from "@/lib/cloudinary-upload";

export enum AssignmentStatus {
  // Only reachable for a tutor without assignmentAutoApprove granted (or an
  // HOD, which has no bypass) - hidden from students/parents until approved.
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// GET /assignments/admin/pending populates course/createdBy - everywhere
// else they stay plain id strings.
export interface AssignmentCourseRef {
  id: string;
  title: string;
}

export interface Assignment {
  id: string;
  course: string | AssignmentCourseRef;
  lesson?: string;
  // Student record ids this assignment is scoped to - absent/empty means
  // every student currently enrolled in the course (the default).
  targetStudents?: string[];
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  attachmentUrl?: string;
  attachment?: UploadedFile;
  createdBy: string | { id: string; firstName: string; lastName: string };
  status: AssignmentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

// GET /assignments/admin/all - every assignment at any approval stage, with how many of the students it was set for have handed it in.
export interface AssignmentProgress {
  expected: number;
  submitted: number;
  late: number;
  graded: number;
  notSubmitted: number;
}

export interface AssignmentWithProgress extends Omit<Assignment, "course"> {
  course: string | (AssignmentCourseRef & { tutor?: string | { id: string; firstName: string; lastName: string } });
  progress: AssignmentProgress;
  pastDue: boolean;
}

export interface AssignmentStudentProgress {
  studentId: string;
  fullName: string;
  state: "NOT_SUBMITTED" | "SUBMITTED" | "LATE" | "GRADED";
  submittedAt: string | null;
  score: number | null;
}

// GET /assignments/admin/:id/progress
export interface AssignmentProgressDetail {
  dueDate: string;
  maxScore: number;
  students: AssignmentStudentProgress[];
}
