// One row per (student, course) taught by this tutor - see stcbe's
// CourseService.getMyStudentsProgress. Split by course (not blended across
// every course a student happens to be in) so attendance/scores never mix
// in data from a student's OTHER tutors, and so the page can be filtered by
// service/subject.
export interface StudentCourseProgress {
  studentId: string;
  fullName: string;
  avatarUrl?: string;
  courseId: string;
  courseTitle: string;
  serviceType?: string;
  subject?: string;
  courseProgressPercent: number;
  attendanceRate: number | null;
  averageScorePercent: number | null;
  overallProgressPercent: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
}

export interface MyStudentsProgress {
  aggregateProgressPercent: number;
  rows: StudentCourseProgress[];
}
