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

export interface AttendanceReport {
  overall: { total: number; present: number; rate: number };
  byCourse: { courseId: string; courseTitle: string; total: number; present: number; rate: number }[];
}

export interface CategoryPopularityStat {
  category: string;
  courseCount: number;
  enrollmentCount: number;
}

export interface StudentRetentionReport {
  eligible: number;
  retained: number;
  rate: number | null;
}

export interface RescheduleRateStat {
  tutorId: string;
  name: string;
  rescheduleCount: number;
}

export interface PayoutTurnaroundReport {
  averageHours: number | null;
}

export interface StudentProgressReport {
  studentId: string;
  attendance: { total: number; present: number; rate: number | null };
  assignments: { totalSubmitted: number; totalGraded: number; averageScorePercent: number | null };
  gradeTimeline: { assignmentTitle: string; score: number; maxScore: number; gradedAt: string }[];
}
