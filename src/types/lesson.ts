export enum LessonStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  // A non-admin actor tried to cancel/reschedule inside the 24h notice
  // window - on hold pending an admin decision on the linked RescheduleRequest.
  PENDING_CANCELLATION_DECISION = "PENDING_CANCELLATION_DECISION",
}

// listForAdmin (GET /lessons) populates `course` into this shape.
export interface LessonCourseRef {
  id: string;
  title: string;
  tutor: string | { id: string; firstName: string; lastName: string };
}

export interface Lesson {
  id: string;
  course: string | LessonCourseRef;
  title: string;
  description?: string;
  order: number;
  scheduledDate: string;
  durationMinutes: number;
  resourceUrls: string[];
  recordingUrl?: string;
  meetingUrl?: string;
  status: LessonStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  tutorComments?: string;
}

export interface TutorHoursReport {
  totalHours: number;
  byCourse: { courseId: string; courseTitle: string; hours: number }[];
}

export interface TutorSessionStats {
  completed: number;
  cancelled: number;
  scheduled: number;
  cancellationRate: number;
}

export interface TutorPerformanceWeek {
  weekStart: string;
  completed: number;
  cancelled: number;
  hours: number;
  attendanceRate: number;
}

export enum RescheduleRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type RescheduleRequestType = "RESCHEDULE" | "CANCEL" | "TUTOR_RESCHEDULE";
export type TutorRescheduleStage = "AWAITING_ADMIN" | "AWAITING_PARENT";

export enum RescheduleSurchargeType {
  FLAT = "FLAT",
  PERCENTAGE = "PERCENTAGE",
}

export interface RescheduleSurcharge {
  type: RescheduleSurchargeType;
  amount: number;
  currency: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

// Admin-configurable, read by anyone before submitting a late tutor
// reschedule so they see the exact fee up front.
export interface RescheduleSurchargeSettings {
  id: string;
  type: RescheduleSurchargeType;
  flatAmount: number;
  percentage: number;
  currency: string;
  updatedAt: string;
}

// `lesson`/`course`/`requestedBy` come back populated from GET /lessons/reschedule-requests
// (see RescheduleRequestRepository.findMany) - stay as plain id strings only
// if the backend ever stops populating them.
export interface RescheduleRequest {
  id: string;
  lesson: string | { id: string; title: string; scheduledDate: string; meetingUrl?: string };
  course: string | { id: string; title: string };
  requestedBy: string | { id: string; firstName: string; lastName: string; email?: string };
  type: RescheduleRequestType;
  stage?: TutorRescheduleStage;
  currentScheduledDate: string;
  // Absent for CANCEL requests.
  requestedScheduledDate?: string;
  // Always present - mandatory on every request regardless of notice window.
  reason: string;
  // True when filed inside the 24h notice window - surface as a priority
  // badge in the admin queue.
  urgent: boolean;
  // TUTOR_RESCHEDULE only - true when filed inside the 48h notice window
  // (surcharge applies). See `surcharge`.
  lateNotice?: boolean;
  surcharge?: RescheduleSurcharge;
  status: RescheduleRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

// Response shape for the reschedule/cancel endpoints (see LessonController) -
// `applied: true` means the change went through immediately; `false` means it
// was filed as a RescheduleRequest awaiting admin review.
export interface ScheduleChangeResult {
  applied: boolean;
  lesson?: Lesson;
  request?: RescheduleRequest;
}
