// Shared vocabulary for "which field(s) need fixing" - used by the reviewer
// UI (lms-home/admin/tutor-applications) to flag specific fields when
// requesting more info, and by the tutor-facing review screen to show what
// was flagged and jump straight to the right wizard step to fix it. Field
// ids match the payload keys in types/tutor-application.ts (TutorApplicationStepNPayload).
// `step` is the wizard UI step number (tutor-application-flow.tsx's STEPS).
export interface FlaggableField {
  id: string;
  label: string;
  step: number;
  stepTitle: string;
}

// Personal Information (UI step 2 - countryOfResidence/dateOfBirth/
// headshotFile/preferredLanguages) is deliberately NOT flaggable here: that
// data is only ever set once, via account creation (StartTutorApplicationDto
// at POST /start), which has no corresponding update endpoint - re-running
// it in edit mode would just fail with "Email already exists." Flagging one
// of those fields would send the tutor to a step they can't actually save
// changes on. Revisit if/when a real updatePersonalInfo endpoint exists.
export const FLAGGABLE_FIELDS: FlaggableField[] = [
  // Step 3: Professional Experience
  { id: "qualifications", label: "Qualifications", step: 3, stepTitle: "Professional Experience" },
  { id: "highestQualification", label: "Highest qualification", step: 3, stepTitle: "Professional Experience" },
  { id: "otherQualificationsHeld", label: "Other qualifications held", step: 3, stepTitle: "Professional Experience" },
  { id: "otherCertifications", label: "Other certifications", step: 3, stepTitle: "Professional Experience" },
  { id: "teachingExperienceHistory", label: "Teaching experience history", step: 3, stepTitle: "Professional Experience" },
  { id: "curriculumFamiliar", label: "Curriculum familiarity", step: 3, stepTitle: "Professional Experience" },
  { id: "gradeLevelsCanTeach", label: "Grade/class levels", step: 3, stepTitle: "Professional Experience" },
  { id: "teachingCombinations", label: "Subjects/curricula taught", step: 3, stepTitle: "Professional Experience" },
  { id: "previousPlatforms", label: "Previous tutoring platforms", step: 3, stepTitle: "Professional Experience" },

  // Step 4: What You Can Teach
  { id: "techSkillAreas", label: "Tech skill areas", step: 4, stepTitle: "What You Can Teach" },
  { id: "digitalSkillsBundles", label: "Digital skills bundles", step: 4, stepTitle: "What You Can Teach" },
  { id: "musicInstruments", label: "Music instruments", step: 4, stepTitle: "What You Can Teach" },
  { id: "softSkillsTopics", label: "Soft skills topics", step: 4, stepTitle: "What You Can Teach" },
  { id: "careerCoachingTopics", label: "Career coaching topics", step: 4, stepTitle: "What You Can Teach" },
  { id: "selfDevTopics", label: "Self-development topics", step: 4, stepTitle: "What You Can Teach" },
  { id: "adultEdFocusAreas", label: "Adult education focus areas", step: 4, stepTitle: "What You Can Teach" },

  // Step 5: Supporting Documents
  { id: "govIdFile", label: "Government-issued ID", step: 5, stepTitle: "Supporting Documents" },
  { id: "cvFile", label: "CV/Resume", step: 5, stepTitle: "Supporting Documents" },
  { id: "supportingDocumentsFile", label: "Additional certificates/supporting documents", step: 5, stepTitle: "Supporting Documents" },
  { id: "certificationProofs", label: "Certification proof uploads", step: 5, stepTitle: "Supporting Documents" },
  { id: "reference1Name", label: "Reference 1 name", step: 5, stepTitle: "Supporting Documents" },
  { id: "reference1Contact", label: "Reference 1 contact", step: 5, stepTitle: "Supporting Documents" },
  { id: "reference2Name", label: "Reference 2 name", step: 5, stepTitle: "Supporting Documents" },
  { id: "reference2Contact", label: "Reference 2 contact", step: 5, stepTitle: "Supporting Documents" },

  // Step 6: Technical Readiness
  { id: "devices", label: "Devices available", step: 6, stepTitle: "Technical Readiness" },
  { id: "internetSpeed", label: "Internet speed", step: 6, stepTitle: "Technical Readiness" },
  { id: "toolProficiency", label: "Online tools proficiency", step: 6, stepTitle: "Technical Readiness" },

  // Step 7: Availability
  { id: "timezone", label: "Timezone", step: 7, stepTitle: "Availability" },
  { id: "availabilitySchedule", label: "Weekly availability schedule", step: 7, stepTitle: "Availability" },
  { id: "maxWeeklyHours", label: "Maximum weekly hours", step: 7, stepTitle: "Availability" },
  { id: "preferredClassFormat", label: "Preferred class format", step: 7, stepTitle: "Availability" },

  // Step 8: Psychometric Evaluation
  { id: "psychDisengagedResponse", label: "Disengaged-student response", step: 8, stepTitle: "Psychometric Evaluation" },
  { id: "psychMotivation", label: "Motivation response", step: 8, stepTitle: "Psychometric Evaluation" },
  { id: "personalityType", label: "Teaching style", step: 8, stepTitle: "Psychometric Evaluation" },

  // Step 9: Final Evaluation
  { id: "finalStrengths", label: "Strengths as an online tutor", step: 9, stepTitle: "Final Evaluation" },
  { id: "finalFeedbackApproach", label: "Feedback approach", step: 9, stepTitle: "Final Evaluation" },

  // Step 10: Payment & Referral
  { id: "payoutMethod", label: "Payout method", step: 10, stepTitle: "Payment & Referral" },
  { id: "bankName", label: "Bank name", step: 10, stepTitle: "Payment & Referral" },
  { id: "accountNumber", label: "Account number", step: 10, stepTitle: "Payment & Referral" },
  { id: "accountName", label: "Account holder name", step: 10, stepTitle: "Payment & Referral" },
  { id: "referringTutorId", label: "Referring tutor", step: 10, stepTitle: "Payment & Referral" },

  // Step 11: Agreements & Consent
  { id: "signature", label: "E-signature", step: 11, stepTitle: "Agreements & Consent" },
];

export const FLAGGABLE_FIELDS_BY_ID: Record<string, FlaggableField> = Object.fromEntries(
  FLAGGABLE_FIELDS.map((f) => [f.id, f])
);
