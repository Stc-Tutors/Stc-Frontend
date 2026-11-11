// One learner's marks in one place (stcbe PerformanceService): graded assignments plus STC Exams test results.
export interface PerformanceItem {
  kind: "ASSIGNMENT" | "TEST";
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  at: string | null;
}

export interface StudentPerformance {
  studentId: string;
  assignments: { set: number; submitted: number; graded: number; averagePercent: number | null };
  tests: { taken: number; averagePercent: number | null };
  overallPercent: number | null;
  recent: PerformanceItem[];
}
