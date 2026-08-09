export interface SessionFeedback {
  id: string;
  lesson: string;
  course: string;
  student: string | { id: string; fullName: string };
  tutor: string;
  rating: number;
  comment?: string;
  hidden: boolean;
  createdAt: string;
}

export interface TutorRatingSummary {
  averageRating: number;
  totalRatings: number;
}

export interface CourseRatingSummary {
  averageRating: number;
  totalRatings: number;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
}
