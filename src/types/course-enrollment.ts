import { Course } from "./course";
import { Student } from "./student";

export enum CourseEnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
}

export interface CourseEnrollment {
  id: string;
  course: Course | string;
  student: Student | string;
  status: CourseEnrollmentStatus;
  enrolledAt: string;
  progressPercent: number;
}
