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
  // Every course on the enrollment (MULTIPLE-selection services); courseId is the first.
  courseIds?: string[];
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

// Accepts `unknown` (not just Student["user"]) so it also covers
// GroupedStudent["user"], which additionally allows undefined - the same
// runtime shape, just from an endpoint whose type doesn't guarantee it's
// always populated.
export function studentAvatarUrl(user: unknown): string | undefined {
  // typeof null === "object": a student whose linked account no longer exists comes
  // back with user: null, and reading .avatarUrl off it threw and took the whole
  // admin students page down with it.
  return user && typeof user === "object" ? (user as StudentUserRef).avatarUrl : undefined;
}

// Populated (as an object, despite the plain-string field type below) on
// the parent's own /enrollments/mine/linked-students list - see stcbe's
// StudentRepository.findByParentUser - so the login ID for a studentId-based
// child account can be shown again after the one-time reveal at
// account-creation time. Kept out of Student.studentUser's own type since
// other endpoints populate that field differently (or not at all); read it
// via studentLoginId(student.studentUser) instead of widening the shared type.
export interface ChildLoginRef {
  id: string;
  studentId?: string;
  firstName?: string;
  lastName?: string;
}

export function studentLoginId(studentUser: unknown): string | undefined {
  return studentUser && typeof studentUser === "object" ? (studentUser as ChildLoginRef).studentId : undefined;
}

export interface Student {
  id: string;
  // Tutor roster only (GET /courses/mine/students): the subject(s) the
  // requesting tutor teaches this student - distinct from
  // serviceDetails.selectedSubjects, which is everything the student takes
  // across all their tutors.
  taughtSubjects?: string[];
  // Links this enrollment to its real, durable Child identity - see the
  // backend's IChild. Absent on enrollments created before the Child/
  // Student split (pending stcbe's backfill-children script). Multiple
  // Student records sharing the same childId are the same physical child
  // enrolled in different services - see groupStudentsByChild in
  // selected-student-context.tsx.
  childId?: string;
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
  // Only meaningful while enrollmentStatus is PENDING_PARENT_CONFIRMATION on
  // a createdByAdmin record with serviceDetails already filled in (an admin
  // full registration, not a bare name-only stub) - tells the confirm page
  // whether confirming will send the owner to checkout (true) or activate
  // for free (false). See stcbe's StudentService.confirmByOwner.
  adminRegistrationRequiresPayment?: boolean;
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

// Admin Students list row - one per real Child, not per enrollment. See
// stcbe's StudentService.listGroupedForAdmin. Never treat
// representativeStudentId as "the" student - it's only there so the row has
// a stable React key; open the profile via childId (GetChildAction /
// GetChildEnrollmentsAction), not this id.
export interface GroupedStudent {
  childId: string;
  representativeStudentId: string;
  fullName: string;
  photoUrl?: string;
  grade?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  studentIdCode?: string;
  user?: string | StudentUserRef;
  parentUser?: string | { id: string; firstName: string; lastName: string; email?: string; phone?: string };
  studentUser?: string | ChildLoginRef;
  enrollmentCount: number;
  statusCounts: Partial<Record<EnrollmentStatus, number>>;
  suspended: boolean;
  mostRecentCreatedAt?: string;
}

// GET /children/:id/enrollments - every enrollment a child has, each with
// its own status/schedule/serviceDetails, plus every payment made against
// any of them. `student` on EnrollmentPayment is a bare id (unpopulated),
// unlike types/payment.ts's Payment - match a payment to its enrollment by
// comparing it against Student.id in the enrollments array.
export interface EnrollmentPayment {
  id: string;
  student?: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  paymentDate: string;
  reference: string;
  createdAt?: string;
}

export interface ChildEnrollmentsResponse {
  enrollments: Student[];
  payments: EnrollmentPayment[];
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