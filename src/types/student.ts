export enum EnrollmentStatus {
  // Multi-step enrollment wizard autosave, before Review & Submit - see
  // enrollment-context.tsx's autosaveDraft/loadEnrollment.
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PENDING_PARENT_CONFIRMATION = 'PENDING_PARENT_CONFIRMATION',
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
  REMOVED = 'REMOVED',
  // Group class/cohort was at capacity when this enrollment was created -
  // promoted to ENROLLED automatically once a confirmed seat frees up. See
  // the "Task 5" waitlist messaging in enrollment-flow.tsx.
  WAITLISTED = 'WAITLISTED',
}

// Only ever set for one-on-one enrollments with a non-empty `schedule` -
// group/cohort enrollments never collect a schedule preference at
// registration, so they never enter this review flow.
export enum ScheduleReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export interface ISchedule {
  subject: string;
  days: string[];
  time: string;
  duration: number;
}

export interface ISubjectPerformance {
  subject: string;
  currentScore?: string;
  targetScore?: string;
}

// Optional exam-preparation-specific context captured during enrollment -
// see stcbe IExamPreparationDetails.
export interface IExamPreparationDetails {
  educationLevel?: string;
  exam?: string;
  examYear?: number;
  examMonth?: string;
  currentGrade?: string;
  schoolName?: string;
  targetGrade?: string;
  subjectPerformance?: ISubjectPerformance[];
  topicsOfDifficulty?: string;
  previousAttempts?: number;
  preferredClassType?: "one-on-one" | "group";
  preferredLearningMode?: "live-online" | "recorded";
  weeklyHours?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialLearningNeeds?: string;
  courseCombination?: string;
}

export interface IServiceDetails {
  ageLevel: string;
  learningFocus: string;
  learningGoals: string;
  specialNeeds?: string;
  selectedSubjects: string[];
  // Same order/index as selectedSubjects - see stcbe's
  // IServiceDetails.selectedSubjectNodeIds.
  selectedSubjectNodeIds?: string[];
  serviceType: string;
  tutorGender: string;
  curriculum?: string;
  country?: string;
  // Path A only (flowRequirements.requires_grade_level/requires_class_year).
  gradeLevel?: string;
  classYear?: string;
  // Path B only (flowRequirements.requires_category).
  examCategory?: string;
  // Path C only (flowRequirements.requires_course_selection/requires_language_selection).
  courseId?: string;
  language?: string;
  // Set whenever flowRequirements.requires_cohort is false.
  classFormat?: "one-on-one" | "group";
  startDate?: string;
  // Set whenever flowRequirements.requires_cohort is true.
  classGroupId?: string;
  examPreparationDetails?: IExamPreparationDetails;
  totalCost: number;
  billingWeeks?: number;
}

// Some endpoints (courses/mine/students, courses/:id/students) populate the
// `user` reference into this shape rather than leaving it as a bare id.
export interface StudentUserRef {
  id: string;
  firstName: string;
  email: string;
  avatarUrl?: string;
}

export function studentAvatarUrl(user: Student["user"]): string | undefined {
  return typeof user === "object" ? user.avatarUrl : undefined;
}

export interface Student {
  id: string;
  user: string | StudentUserRef;
  parentUser?: string;
  studentUser?: string;
  fullName: string;
  dateOfBirth?: Date;
  gender?: string;
  countryOfResidence?: string;
  phone?: string;
  primaryLanguage?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentOccupation?: string;
  serviceDetails?: IServiceDetails;
  schedule?: ISchedule[];
  scheduleReviewStatus?: ScheduleReviewStatus;
  scheduleReviewedBy?: string;
  scheduleReviewedAt?: string;
  enrollmentStatus: EnrollmentStatus;
  createdByAdmin?: boolean;
  // Admin-facing profile fields (Basic/Identification/Health Details)
  grade?: string;
  admissionDate?: string;
  photoUrl?: string;
  studentIdCode?: string;
  nationality?: string;
  nin?: string;
  weightKg?: number;
  heightCm?: number;
  bloodGroup?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedUntil?: string;
  createdAt?: string;
}

export interface AcademicSummary {
  attendanceRate: number;
  assignmentCompletionRate: number;
  averageGrade: number;
  courseProgressRate: number;
}

export interface ParentEnrollmentSummary {
  numberOfChildren: number;
  paymentStatus: "All Paid" | "Partial" | "Unpaid" | "No Payments";
  occupation?: string;
}