import { TeachingCombination } from "./curriculum";

export enum TutorApplicationStatus {
  // Multi-step signup wizard in progress (steps 1-4 saved, not yet
  // submitted) - see TutorApplicationFlow/TutorApplicationContext. Only the
  // applicant (via their draft token) can see/edit these.
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  // An ADMIN/HOD has recommended this application; only a SUPER_ADMIN
  // approving it actually activates the account.
  RECOMMENDED = "RECOMMENDED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// Mirrors stcbe's core/interfaces/tutor-application.ts enums exactly - keep
// in sync with the backend DTOs (TutorApplicationStep3Dto/Step4Dto).
export enum TutorDeviceType {
  PC = "PC",
  LAPTOP = "LAPTOP",
  TABLET = "TABLET",
  SMARTPHONE = "SMARTPHONE",
}

export enum InternetSpeedTier {
  BELOW_5MBPS = "BELOW_5MBPS",
  BETWEEN_5_10MBPS = "BETWEEN_5_10MBPS",
  ABOVE_10MBPS = "ABOVE_10MBPS",
}

export enum LearningStyle {
  ANALYTICAL = "ANALYTICAL",
  CREATIVE = "CREATIVE",
}

export interface TutorApplicationApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

// One tutor availability slot - same shape as the student enrollment
// flow's Schedule (stcbe's ISchedule), kept as its own named type here so
// this file doesn't have to import from the (client-only) enrollment
// context just for a type.
export interface TutorAvailabilitySlot {
  subject: string;
  days: string[];
  time: string;
  duration: number;
}

export interface TutorApplication {
  id: string;
  user: TutorApplicationApplicant | string;
  qualifications: string;
  yearsOfExperience: number;
  teachingCombinations: TeachingCombination[];
  availability: string;
  documentUrls: string[];
  screeningAnswers?: string;
  status: TutorApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;

  // Multi-step wizard fields (all optional - only populated as the
  // applicant progresses through steps 1-5). See stcbe's
  // TutorApplicationService and TutorApplicationContext.
  currentStep?: number;

  // Step 1: Personal Information (in addition to the User fields)
  countryOfResidence?: string;
  preferredLanguages?: string[];

  // Step 2: Professional Experience
  previousPlatforms?: string;
  availabilitySchedule?: TutorAvailabilitySlot[];

  // Step 3: Technical Readiness
  devices?: TutorDeviceType[];
  internetSpeed?: InternetSpeedTier;
  toolProficiency?: string[];
  hasQuietEnvironment?: boolean;
  hasPeripherals?: boolean;

  // Step 4: Psych Evaluation and Personality Assessment
  psychConfidenceRating?: number;
  psychDisengagedResponse?: string;
  psychMotivation?: string;
  psychParentDisagreementResponse?: string;
  personalityType?: LearningStyle;
  personalityAdaptabilityRating?: number;
  personalityClassPrep?: string;
  personalityAboveAndBeyond?: string;

  // Step 5: Final Evaluation and Submission
  finalStrengths?: string;
  finalFeedbackApproach?: string;
  lessonPlanUrl?: string;
  lessonPlanText?: string;
  termsAccepted?: boolean;
  ethicsCommitmentAccepted?: boolean;

  // Task 6: answers to any active CustomFormField for the tutor-onboarding
  // stages, keyed by ICustomFormField.id.
  customFieldResponses?: Record<string, string | string[] | number | boolean>;
}

// Legacy single-shot signup (stcbe ApplyTutorDto, POST /tutor-applications) -
// superseded by the 5-step wizard payloads below, kept only until the wizard
// fully replaces src/components/forms/apply-tutor-form.tsx.
export interface ApplyTutorPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  qualifications: string;
  yearsOfExperience: number;
  teachingCombinations: TeachingCombination[];
  availability: string;
  documentUrls?: string[];
  screeningAnswers?: string;
}

// --- Wizard step payloads - mirror stcbe's dtos/tutor-application.dto.ts ---

export interface StartTutorApplicationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  countryOfResidence: string;
  preferredLanguages: string[];
}

export interface StartTutorApplicationResponse {
  applicationId: string;
  draftToken: string;
}

export interface TutorApplicationStep2Payload {
  qualifications: string;
  yearsOfExperience: number;
  teachingCombinations: TeachingCombination[];
  previousPlatforms?: string;
  availabilitySchedule: TutorAvailabilitySlot[];
  documentUrls?: string[];
}

export interface TutorApplicationStep3Payload {
  devices: TutorDeviceType[];
  internetSpeed: InternetSpeedTier;
  toolProficiency: string[];
  hasQuietEnvironment: boolean;
  hasPeripherals: boolean;
}

export interface TutorApplicationStep4Payload {
  psychConfidenceRating: number;
  psychDisengagedResponse: string;
  psychMotivation: string;
  psychParentDisagreementResponse: string;
  personalityType: LearningStyle;
  personalityAdaptabilityRating: number;
  personalityClassPrep: string;
  personalityAboveAndBeyond: string;
}

export interface TutorApplicationStep5Payload {
  finalStrengths: string;
  finalFeedbackApproach: string;
  lessonPlanUrl?: string;
  lessonPlanText?: string;
  termsAccepted: boolean;
  ethicsCommitmentAccepted: boolean;
  customFieldResponses?: Record<string, string | string[] | number | boolean>;
}
