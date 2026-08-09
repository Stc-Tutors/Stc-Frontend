import { Assignment } from "./assignment";
import { Student } from "./student";

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
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}
