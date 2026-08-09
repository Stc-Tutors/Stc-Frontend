export interface StudentProgressSummary {
  studentId: string;
  fullName: string;
  avatarUrl?: string;
  attendanceRate: number | null;
  averageScorePercent: number | null;
  overallProgressPercent: number;
}

export interface MyStudentsProgress {
  aggregateProgressPercent: number;
  students: StudentProgressSummary[];
}
