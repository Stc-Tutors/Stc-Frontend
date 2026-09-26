// How a class is delivered: a pasted Meet/Zoom link (EXTERNAL) or the
// in-app classroom (LIVEKIT). Mirrors stcbe's LessonDeliveryMode.
export enum LessonDeliveryMode {
  EXTERNAL = "EXTERNAL",
  LIVEKIT = "LIVEKIT",
}

export enum RecordingStatus {
  PENDING = "PENDING",
  RECORDING = "RECORDING",
  READY = "READY",
  FAILED = "FAILED",
  DELETED = "DELETED",
}

export interface LessonRecording {
  enabled: boolean;
  enabledBy?: string;
  enabledAt?: string;
  reason?: string;
  status?: RecordingStatus;
  durationSeconds?: number;
  error?: string;
  expiresAt?: string;
}

export type SessionTrust = "HIGH" | "MEDIUM" | "LOW";

export type SessionFlag =
  | "LATE_START"
  | "SHORT_SESSION"
  | "NO_LEARNER_PRESENT"
  | "NO_STUDENT_CONFIRMATION"
  | "TIME_MISMATCH"
  | "CLOCK_IN_OUTSIDE_WINDOW"
  | "OVERRAN_CAPPED"
  | "TUTOR_OVERLAP"
  | "IMPLAUSIBLE_DURATION";

// Plain-language versions of the fraud/quality checks, for an admin reviewing
// a session or a tutor understanding why a session was held.
export const SESSION_FLAG_LABELS: Record<SessionFlag, string> = {
  LATE_START: "Tutor started late",
  SHORT_SESSION: "Shorter than scheduled",
  NO_LEARNER_PRESENT: "No student was in the class with the tutor",
  NO_STUDENT_CONFIRMATION: "The student side never confirmed this session",
  TIME_MISMATCH: "Tutor and student times don't match",
  CLOCK_IN_OUTSIDE_WINDOW: "Clocked in far from the scheduled time",
  OVERRAN_CAPPED: "Ran over - extra time isn't counted",
  TUTOR_OVERLAP: "Overlaps another of the tutor's sessions",
  IMPLAUSIBLE_DURATION: "Too short to be a real class",
};

export const SESSION_TRUST_LABELS: Record<SessionTrust, string> = {
  HIGH: "Verified",
  MEDIUM: "Confirmed by student",
  LOW: "Needs a look",
};

export interface SessionVerification {
  source: LessonDeliveryMode;
  trust?: SessionTrust;
  billableMinutes: number;
  rawMinutes?: number;
  flags?: SessionFlag[];
  computedAt?: string;
}

export type PresenceRole = "TUTOR" | "LEARNER" | "OBSERVER";

export interface JoinInfo {
  url: string;
  token: string;
  roomName: string;
  role: PresenceRole;
  recording: boolean;
  lesson: { id: string; title: string; scheduledDate: string; durationMinutes: number };
}

export interface ConsentIssue {
  studentId: string;
  fullName: string;
}

export interface RecordingReadiness {
  deliveryMode: LessonDeliveryMode;
  recordingConfigured: boolean;
  recording: LessonRecording | null;
  missingConsent: ConsentIssue[];
  canStart: boolean;
}

export interface ChildConsent {
  studentId: string;
  fullName: string;
  granted: boolean;
  grantedAt?: string;
}

export interface HoursLessonLine {
  lessonId: string;
  title: string;
  scheduledDate: string;
  scheduledMinutes: number;
  billableMinutes: number;
  state: "COUNTED" | "PENDING_REVIEW" | "FLAGGED";
}

export interface HoursAccountSummary {
  accountId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  subject?: string;
  purchasedMinutes: number;
  usedMinutes: number;
  pendingMinutes: number;
  remainingMinutes: number;
  upcomingScheduledMinutes: number;
  // Absent for a child's own login.
  effectiveRatePerHour?: number;
  currency?: string;
  valueUsed?: number;
  valueRemaining?: number;
  lessons: HoursLessonLine[];
}

export interface TutorSessionLine {
  lessonId: string;
  title: string;
  courseTitle: string;
  scheduledDate: string;
  scheduledMinutes: number;
  billableMinutes: number;
  rawMinutes?: number;
  trust?: SessionTrust;
  flags: SessionFlag[];
  reviewStatus?: "PENDING_REVIEW" | "APPROVED" | "FLAGGED";
  flagReason?: string;
  source: string;
}

export interface TutorSessionsReport {
  verifiedMinutes: number;
  pendingMinutes: number;
  flaggedMinutes: number;
  sessions: TutorSessionLine[];
}

export const FEEDBACK_TAGS = [
  "CLEAR_EXPLANATIONS",
  "PATIENT",
  "WELL_PREPARED",
  "ON_TIME",
  "ENGAGING",
  "LATE_START",
  "UNPREPARED",
  "TECHNICAL_ISSUES",
  "RUSHED",
] as const;
export type FeedbackTag = (typeof FEEDBACK_TAGS)[number];

export const FEEDBACK_TAG_LABELS: Record<FeedbackTag, string> = {
  CLEAR_EXPLANATIONS: "Clear explanations",
  PATIENT: "Patient",
  WELL_PREPARED: "Well prepared",
  ON_TIME: "On time",
  ENGAGING: "Engaging",
  LATE_START: "Started late",
  UNPREPARED: "Unprepared",
  TECHNICAL_ISSUES: "Technical issues",
  RUSHED: "Felt rushed",
};

// Tags a parent would use to praise vs. to raise a concern - drives the
// colour of the chips.
export const POSITIVE_TAGS: FeedbackTag[] = ["CLEAR_EXPLANATIONS", "PATIENT", "WELL_PREPARED", "ON_TIME", "ENGAGING"];

export interface ClassReport {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  scheduledDate: string;
  billableMinutes: number;
  report: { key: string; label: string; value: string }[];
  myFeedback: { rating: number; tags: string[]; comment?: string } | null;
  canRate: boolean;
  recordingAvailable: boolean;
}

export interface FeedbackInternalNote {
  author: string;
  note: string;
  createdAt: string;
}

export interface OverviewFeedbackItem {
  id: string;
  rating: number;
  comment?: string;
  tags?: string[];
  hidden: boolean;
  createdAt: string;
  internalNotes?: FeedbackInternalNote[];
  student?: { id: string; fullName: string } | string;
  tutor?: { id: string; firstName: string; lastName: string } | string;
  course?: { id: string; title: string } | string;
  lesson?: { id: string; title: string; scheduledDate: string } | string;
}

export interface FeedbackOverview {
  stats: {
    total: number;
    averageRating: number;
    lowCount: number;
    byStar: Record<"1" | "2" | "3" | "4" | "5", number>;
  };
  items: OverviewFeedbackItem[];
}
