import type { Lesson } from "@/types/lesson";

export interface SessionForReview extends Omit<Lesson, "course"> {
  course: { id: string; title: string; gradeLevel?: string; tutor: { id: string; firstName: string; lastName: string } };
  reviewedBy?: string;
  reviewedAt?: string;
  flagReason?: string;
}
