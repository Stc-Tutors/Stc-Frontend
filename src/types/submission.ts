import { Assignment } from "./assignment";
import { Student } from "./student";
import { UploadedFile } from "@/lib/cloudinary-upload";

export enum SubmissionStatus {
  SUBMITTED = "SUBMITTED",
  LATE = "LATE",
  GRADED = "GRADED",
}

export interface Submission {
  id: string;
  assignment: Assignment | string;
  student: Student | string;
  content?: string;
  fileUrl?: string;
  attachment?: UploadedFile;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}
