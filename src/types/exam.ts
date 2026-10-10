// Mirrors stcbe's STC Exams integration (core/interfaces/exam.ts).
export enum ExamLaunchMode {
  NEW_TAB = "NEW_TAB",
  EMBEDDED = "EMBEDDED",
}

export enum ExamAudienceType {
  ASSIGNED = "ASSIGNED",
  COURSE = "COURSE",
}

export enum ExamApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ExamRemoteStatus {
  NOT_CREATED = "NOT_CREATED",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  READY = "READY",
}

export type ExamSeatStatus = "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED";

// The documented STC Exams integrity toggles, with a plain-words label for the admin form.
export const PROCTORING_OPTIONS: { key: string; label: string }[] = [
  { key: "require_fullscreen", label: "Require full screen" },
  { key: "block_tab_switch", label: "Block switching tabs" },
  { key: "block_copy_paste", label: "Block copy & paste" },
  { key: "require_webcam", label: "Require webcam" },
  { key: "require_mic", label: "Require microphone" },
  { key: "track_ip_location", label: "Track IP location" },
  { key: "require_screen_share", label: "Require screen sharing" },
  { key: "enable_browser_lockdown", label: "Browser lockdown" },
  { key: "detect_screenshot_attempts", label: "Detect screenshot attempts" },
  { key: "detect_automation", label: "Detect automation tools" },
  { key: "detect_virtual_machine", label: "Detect virtual machines" },
  { key: "detect_virtual_camera", label: "Detect virtual cameras" },
  { key: "require_face_verification", label: "Require face verification" },
  { key: "monitor_clipboard", label: "Monitor clipboard" },
  { key: "enable_forensic_watermark", label: "Forensic watermark" },
];

export interface ExamSeat {
  id: string;
  learnerKey: string;
  fullName: string;
  status: ExamSeatStatus;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  lateSubmission?: boolean;
  submittedAt?: string;
  lastLaunchedAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  remoteId?: number;
  remoteStatus: ExamRemoteStatus;
  paymentLink?: string;
  durationMinutes: number;
  expectedParticipantCount: number;
  proctoring: Record<string, boolean>;
  launchMode: ExamLaunchMode;
  audienceType: ExamAudienceType;
  courseIds: string[];
  published: boolean;
  approvalStatus: ExamApprovalStatus;
  rejectionReason?: string;
  createdByName?: string;
  createdByRole?: string;
  draftQuestionCount?: number;
  createdAt: string;
  seatCount?: number;
  submittedCount?: number;
  seats?: ExamSeat[];
}

export interface ExamQuestion {
  id: number;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  marks?: number;
  approval_status?: string;
}

export interface NewExamQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
}

export interface ExamLearnerHit {
  key: string;
  fullName: string;
  grade?: string;
}

// Learner side: one row per (test, person).
export interface MyExam {
  assessment: {
    id: string;
    title: string;
    description?: string;
    durationMinutes: number;
    launchMode: ExamLaunchMode;
    proctoring: string[];
  };
  learner: { key: string; fullName: string };
  seat: {
    id?: string;
    status: ExamSeatStatus | "NOT_STARTED";
    score?: number;
    totalMarks?: number;
    percentage?: number;
    submittedAt?: string;
  };
}

export interface ExamLaunchResult {
  launchUrl: string;
  launchMode: ExamLaunchMode;
  title: string;
}

export interface ExamStatus {
  configured: boolean;
  canApprove: boolean;
  isStaff: boolean;
}

export interface ExamCourseOption {
  id: string;
  title: string;
}
