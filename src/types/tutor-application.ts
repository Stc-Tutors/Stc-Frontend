import { TeachingCombination } from "./curriculum";
import { Weekday } from "@/constants/weekdays";
import { UploadedFile } from "@/lib/cloudinary-upload";

export enum TutorApplicationStatus {
  // Multi-step signup wizard in progress (steps 1-9 saved, not yet
  // submitted) - see TutorApplicationFlow/TutorApplicationContext. Only the
  // applicant (via their draft token) can see/edit these.
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  // An ADMIN/HOD has recommended this application; only a SUPER_ADMIN
  // approving it actually activates the account.
  RECOMMENDED = "RECOMMENDED",
  // Reviewer sent it back for changes on specific fields - the one
  // submitted state the applicant can still log in for (see AuthService.login).
  NEEDS_MORE_INFO = "NEEDS_MORE_INFO",
  // Admin-approved and can log in, but still needs to complete the
  // post-approval Vetting Questionnaire (see VettingQuestionnaire) before
  // being eligible for student allocation - submitting it flips this to APPROVED.
  APPROVED_PENDING_VETTING = "APPROVED_PENDING_VETTING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// Mirrors stcbe's core/interfaces/tutor-application.ts enums exactly - keep
// in sync with the backend DTOs (TutorApplicationStepNDto).

// TutorDeviceType enum removed (v3.6) - Step 5's devices field is now
// TaxonomyOptionKind.TUTOR_DEVICE_TYPE (admin-editable), fetched via
// GetTaxonomyOptionsAction like teaching-details.tsx's curriculum/subjects.

export enum InternetSpeedTier {
  BELOW_5MBPS = "BELOW_5MBPS",
  BETWEEN_5_10MBPS = "BETWEEN_5_10MBPS",
  ABOVE_10MBPS = "ABOVE_10MBPS",
}

export enum LearningStyle {
  ANALYTICAL = "ANALYTICAL",
  CREATIVE = "CREATIVE",
}

// EducationQualificationLevel/TeachingCertification enums removed (v3.6) -
// highestQualification/otherQualificationsHeld/otherCertifications are now
// TaxonomyOptionKind.EDUCATION_QUALIFICATION/TEACHING_CERTIFICATION
// (admin-editable), fetched via GetTaxonomyOptionsAction. The two constants
// below are the magic values the code still branches on by name.
export const TEACHING_CERTIFICATION_NONE = "None";
// Reveals a free-text field (otherCertificationDetail) when checked.
export const TEACHING_CERTIFICATION_OTHER = "Other";

export enum GradeClassLevel {
  NURSERY = "NURSERY",
  PRIMARY = "PRIMARY",
  JUNIOR_SECONDARY = "JUNIOR_SECONDARY",
  SENIOR_SECONDARY = "SENIOR_SECONDARY",
  POST_SECONDARY = "POST_SECONDARY",
  // EXAM_PREPARATION removed (v3.3) - exam prep is its own service with its
  // own teaching cycle now, not an Academic Tutoring grade level.
  OTHER = "OTHER",
}

export const GRADE_CLASS_LEVEL_LABELS: Record<GradeClassLevel, string> = {
  [GradeClassLevel.NURSERY]: "Nursery",
  [GradeClassLevel.PRIMARY]: "Primary",
  [GradeClassLevel.JUNIOR_SECONDARY]: "Junior Secondary",
  [GradeClassLevel.SENIOR_SECONDARY]: "Senior Secondary",
  [GradeClassLevel.POST_SECONDARY]: "Post Secondary",
  [GradeClassLevel.OTHER]: "Other",
};

// CurriculumSystem enum removed (2026-08) - the Academic Tutoring cycle's
// curriculum context field is now TaxonomyOptionKind.CURRICULUM_SYSTEM
// (admin-editable via GetTaxonomyOptionsAction), not a fixed enum, so a new
// curriculum (e.g. Canadian) can be added without a code change.

export enum TutorClassFormat {
  ONE_ON_ONE_ONLY = "ONE_ON_ONE_ONLY",
  GROUP_ONLY = "GROUP_ONLY",
  BOTH = "BOTH",
}

export const CLASS_FORMAT_LABELS: Record<TutorClassFormat, string> = {
  [TutorClassFormat.ONE_ON_ONE_ONLY]: "1-on-1 only",
  [TutorClassFormat.GROUP_ONLY]: "Group classes only",
  [TutorClassFormat.BOTH]: "Both",
};

export enum MaxWeeklyHoursBand {
  UNDER_5 = "UNDER_5",
  BETWEEN_5_10 = "BETWEEN_5_10",
  BETWEEN_10_20 = "BETWEEN_10_20",
  OVER_20 = "OVER_20",
}

export const MAX_WEEKLY_HOURS_LABELS: Record<MaxWeeklyHoursBand, string> = {
  [MaxWeeklyHoursBand.UNDER_5]: "Under 5 hrs/week",
  [MaxWeeklyHoursBand.BETWEEN_5_10]: "5-10 hrs/week",
  [MaxWeeklyHoursBand.BETWEEN_10_20]: "10-20 hrs/week",
  [MaxWeeklyHoursBand.OVER_20]: "20+ hrs/week",
};

export enum AnalyticalOrCreative {
  ANALYTICAL = "ANALYTICAL",
  CREATIVE = "CREATIVE",
  BOTH = "BOTH",
}

export enum PayoutMethod {
  BANK_TRANSFER_NIGERIA = "BANK_TRANSFER_NIGERIA",
  INTERNATIONAL_WISE = "INTERNATIONAL_WISE",
  PAYPAL = "PAYPAL",
  OTHER = "OTHER",
}

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  [PayoutMethod.BANK_TRANSFER_NIGERIA]: "Bank Transfer - Nigeria (via Paystack)",
  [PayoutMethod.INTERNATIONAL_WISE]: "International Transfer (Wise)",
  [PayoutMethod.PAYPAL]: "PayPal",
  [PayoutMethod.OTHER]: "Other",
};

export enum WhatsappChannelStatus {
  JOINED = "JOINED",
  YET_TO_JOIN = "YET_TO_JOIN",
}

export interface TutorApplicationApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

// A tutor's general weekly availability - one open window per day (1-7
// entries), not tied to any subject or fixed session length - see
// stcbe's IWeeklyAvailabilitySlot. `startTime`/`endTime` are "HH:MM"
// 24-hour strings (native <input type="time"> value).
export interface TutorAvailabilitySlot {
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
}

export interface CertificationProof {
  certification: string;
  file: UploadedFile;
}

// A reference's own submitted answers - see stcbe's IReferenceResponse.
export interface ReferenceResponse {
  howTheyKnowApplicant: string;
  teachingAbility: string;
  reliability: string;
  additionalComments?: string;
  submittedAt: string;
}

// Returned by GET /tutor-applications/:id/reference/:slot (token-gated,
// public) - just enough for the reference-response page to render itself.
export interface ReferenceInfo {
  applicantName: string;
  referenceName: string;
  alreadySubmitted: boolean;
}

export interface SubmitReferenceResponsePayload {
  howTheyKnowApplicant: string;
  teachingAbility: string;
  reliability: string;
  additionalComments?: string;
}

// One prior teaching/tutoring role - repeatable via "Add another" on the
// Professional Experience step. endDate is omitted (not blank) when
// currentlyWorkHere is true.
export interface TeachingExperienceEntry {
  institution: string;
  role: string;
  startDate: string;
  endDate?: string;
  currentlyWorkHere: boolean;
  description?: string;
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
  // Set by a reviewer's "request more info" action, cleared on resubmit.
  flaggedFields?: string[];
  needsMoreInfoNote?: string;
  createdAt: string;

  // Multi-step wizard fields (all optional - only populated as the
  // applicant progresses through steps 1-10). See stcbe's
  // TutorApplicationService and TutorApplicationContext.
  currentStep?: number;

  // Step 1: Services + Personal Information (in addition to the User fields)
  servicesOffered?: string[];
  countryOfResidence?: string;
  preferredLanguages?: string[];
  dateOfBirth?: string;
  headshotFile?: UploadedFile;

  // Step 2: Professional Experience
  previousPlatforms?: string;
  yearsOnlineTutoringExperience?: number;
  highestQualification?: string;
  otherQualificationsHeld?: string[];
  otherCertifications?: string[];
  otherCertificationDetail?: string;
  teachingExperienceHistory?: TeachingExperienceEntry[];

  // Step 3: What You Teach - repeatable cycles (Academic Tutoring, Exam
  // Preparation, Tech Training for Kids) plus flat fields for the
  // remaining, non-cycle services.
  teachingCycles?: TeachingCycle[];
  digitalSkillsBundles?: string[];
  musicInstruments?: string[];
  softSkillsTopics?: string[];
  careerCoachingTopics?: string[];
  selfDevTopics?: string[];
  adultEdFocusAreas?: string[];

  // Step 4: Supporting Documents
  govIdFile?: UploadedFile;
  cvFile?: UploadedFile;
  supportingDocumentsFile?: UploadedFile;
  certificationProofs?: CertificationProof[];
  backgroundCheckConsent?: boolean;
  reference1Name?: string;
  reference1Relationship?: string;
  reference1Contact?: string;
  reference1ConsentToContact?: boolean;
  reference1Response?: ReferenceResponse;
  reference2Name?: string;
  reference2Relationship?: string;
  reference2Contact?: string;
  reference2ConsentToContact?: boolean;
  reference2Response?: ReferenceResponse;

  // Step 5: Technical Readiness
  devices?: string[];
  internetSpeed?: InternetSpeedTier;
  toolProficiency?: string[];
  hasQuietEnvironment?: boolean;
  hasPeripherals?: boolean;

  // Step 6: Availability
  timezone?: string;
  availabilitySchedule?: TutorAvailabilitySlot[];
  maxWeeklyHours?: MaxWeeklyHoursBand;
  preferredClassFormat?: TutorClassFormat;

  // Step 7: Psych Evaluation and Personality Assessment
  psychConfidenceRating?: number;
  psychDisengagedResponse?: string;
  psychMotivation?: string;
  psychParentDisagreementResponse?: string;
  personalityType?: LearningStyle;
  personalityAdaptabilityRating?: number;
  personalityClassPrep?: string;
  personalityAboveAndBeyond?: string;
  analyticalOrCreative?: AnalyticalOrCreative;

  // Step 8: Final Evaluation
  finalStrengths?: string;
  finalFeedbackApproach?: string;
  lessonPlanUrl?: string;
  lessonPlanText?: string;
  internalExpectedPayMin?: number;
  internalExpectedPayMax?: number;

  // Step 9: Payment & Referral
  payoutMethod?: PayoutMethod;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  wasReferred?: boolean;
  // Populated (firstName/lastName only) by TutorApplicationRepository - a
  // plain string only if somehow unpopulated.
  referringTutorId?: string | { id: string; firstName: string; lastName: string };

  // Step 10: Agreements & Consent
  termsAccepted?: boolean;
  ethicsCommitmentAccepted?: boolean;
  dataPrivacyAgreed?: boolean;
  signature?: string;
  whatsappChannelJoined?: WhatsappChannelStatus;

  // Post-approval Vetting Questionnaire - see VettingQuestionnaire and
  // TutorApplicationStatus.APPROVED_PENDING_VETTING.
  vettingQuestionnaire?: VettingQuestionnaire;

  // Task 6: answers to any active CustomFormField for the tutor-onboarding
  // stages, keyed by ICustomFormField.id.
  customFieldResponses?: Record<string, string | string[] | number | boolean>;
}

// STC Tutors' post-approval "Vetting Questionnaire" - the Independent Tutor
// Agreement the tutor confirms AFTER admin approval (not part of the signup
// wizard). Submitting this flips TutorApplicationStatus from
// APPROVED_PENDING_VETTING to APPROVED. Mirrors stcbe's IVettingQuestionnaire.
export interface VettingQuestionnaire {
  independentContractorAccepted: boolean;
  scenarioDirectPaymentResponse: string;
  scenarioFirstLessonPrepResponse: string;
  reportingPolicyAccepted: boolean;
  nonCircumventionAccepted: boolean;
  punctualityAccepted: boolean;
  attendanceAccepted: boolean;
  confidentialityAccepted: boolean;
  bindingAgreementAccepted: boolean;
  signature: string;
  signatureDate: string;
  submittedAt: string;
}

export interface SubmitVettingQuestionnairePayload {
  independentContractorAccepted: boolean;
  scenarioDirectPaymentResponse: string;
  scenarioFirstLessonPrepResponse: string;
  reportingPolicyAccepted: boolean;
  nonCircumventionAccepted: boolean;
  punctualityAccepted: boolean;
  attendanceAccepted: boolean;
  confidentialityAccepted: boolean;
  bindingAgreementAccepted: boolean;
  signature: string;
  signatureDate: string;
}

// Legacy single-shot signup (stcbe ApplyTutorDto, POST /tutor-applications) -
// superseded by the 10-step wizard payloads below. The frontend entry point
// for this (apply-tutor-form.tsx) has been retired; this type/action is kept
// only because nothing has confirmed the backend route itself is safe to remove.
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
  servicesOffered: string[];
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  countryOfResidence: string;
  preferredLanguages: string[];
  dateOfBirth: string;
  headshotFile?: UploadedFile;
}

export interface StartTutorApplicationResponse {
  applicationId: string;
  draftToken: string;
}

export interface TutorApplicationStep2Payload {
  qualifications: string;
  yearsOfExperience: number;
  yearsOnlineTutoringExperience: number;
  highestQualification: string;
  otherQualificationsHeld?: string[];
  otherCertifications: string[];
  otherCertificationDetail?: string;
  teachingExperienceHistory?: TeachingExperienceEntry[];
  previousPlatforms?: string;
  documentUrls?: string[];
}

// One "What You Teach" cycle - service + context + the subjects/skills that
// apply to every context value in this cycle. Context fields are always
// arrays, even single-valued, so grouped cycles (e.g. WAEC+NECO+NABTEB
// sharing one subject list) share the same shape as ungrouped ones - see
// EXAM_BOARD_GROUPS in the teaching-details step.
export interface TeachingCycle {
  service: string;
  curriculum?: string[];
  gradeLevel?: GradeClassLevel[];
  examBoard?: string[];
  ageRange?: string[];
  subjects: string[];
}

export interface TutorApplicationStep3Payload {
  teachingCycles?: TeachingCycle[];
  digitalSkillsBundles?: string[];
  musicInstruments?: string[];
  softSkillsTopics?: string[];
  careerCoachingTopics?: string[];
  selfDevTopics?: string[];
  adultEdFocusAreas?: string[];
}

export interface TutorApplicationStep4Payload {
  govIdFile: UploadedFile;
  cvFile: UploadedFile;
  supportingDocumentsFile?: UploadedFile;
  certificationProofs?: CertificationProof[];
  backgroundCheckConsent: boolean;
  reference1Name: string;
  reference1Relationship: string;
  reference1Contact: string;
  reference1ConsentToContact: boolean;
  reference2Name: string;
  reference2Relationship: string;
  reference2Contact: string;
  reference2ConsentToContact: boolean;
}

export interface TutorApplicationStep5Payload {
  devices: string[];
  internetSpeed: InternetSpeedTier;
  toolProficiency: string[];
  hasQuietEnvironment: boolean;
  hasPeripherals: boolean;
}

export interface TutorApplicationStep6Payload {
  timezone: string;
  // General weekly grid - not tied to any subject or session length. Admin
  // fits students into these open windows afterward, and reschedules within
  // them as needed (see stcbe's IWeeklyAvailabilitySlot).
  availabilitySchedule: TutorAvailabilitySlot[];
  maxWeeklyHours: MaxWeeklyHoursBand;
  preferredClassFormat: TutorClassFormat;
}

export interface TutorApplicationStep7Payload {
  psychConfidenceRating: number;
  psychDisengagedResponse: string;
  psychMotivation: string;
  psychParentDisagreementResponse: string;
  personalityType: LearningStyle;
  personalityAdaptabilityRating: number;
  personalityClassPrep: string;
  personalityAboveAndBeyond: string;
  analyticalOrCreative: AnalyticalOrCreative;
}

export interface TutorApplicationStep8Payload {
  finalStrengths: string;
  finalFeedbackApproach: string;
  lessonPlanUrl?: string;
  lessonPlanText?: string;
  internalExpectedPayMin: number;
  internalExpectedPayMax: number;
}

export interface TutorApplicationStep9Payload {
  payoutMethod: PayoutMethod;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  wasReferred: boolean;
  referringTutorId?: string;
}

export interface TutorApplicationStep10Payload {
  termsAccepted: boolean;
  ethicsCommitmentAccepted: boolean;
  dataPrivacyAgreed: boolean;
  signature: string;
  whatsappChannelJoined: WhatsappChannelStatus;
  customFieldResponses?: Record<string, string | string[] | number | boolean>;
}

export interface SubmitTutorApplicationStep10Response {
  application: TutorApplication;
  statusToken: string;
}

export interface TutorSearchResult {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TutorApplicationStatusSummary {
  status: TutorApplicationStatus;
  rejectionReason?: string;
  flaggedFields?: string[];
  needsMoreInfoNote?: string;
}

export interface RequestMoreInfoPayload {
  flaggedFields: string[];
  note: string;
}
