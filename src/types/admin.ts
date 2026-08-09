export interface AdminOverview {
  usersByRole: Record<string, number>;
  enrollmentsByStatus: Record<string, number>;
  coursesByStatus: Record<string, number>;
  revenueMTD: number;
}

export interface RevenuePoint {
  date: string;
  total: number;
}

export interface CourseCompletionStat {
  courseId: string;
  courseTitle: string;
  total: number;
  completed: number;
  rate: number;
}

export interface TutorPerformanceStat {
  tutorId: string;
  name: string;
  totalHours: number;
  averageRating: number | null;
  totalRatings: number;
  completedSessions: number;
  cancelledSessions: number;
  completionRate: number | null;
}
