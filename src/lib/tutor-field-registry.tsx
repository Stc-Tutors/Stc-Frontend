import FileAccessRow from "@/components/tutor-applications/file-access-row";
import {
  AnalyticalOrCreative,
  CLASS_FORMAT_LABELS,
  GRADE_CLASS_LEVEL_LABELS,
  InternetSpeedTier,
  LearningStyle,
  MAX_WEEKLY_HOURS_LABELS,
  PAYOUT_METHOD_LABELS,
  TutorApplication,
  WhatsappChannelStatus,
} from "@/types/tutor-application";

const SPEED_LABELS: Record<InternetSpeedTier, string> = {
  [InternetSpeedTier.BELOW_5MBPS]: "Below 5 Mbps",
  [InternetSpeedTier.BETWEEN_5_10MBPS]: "5 - 10 Mbps",
  [InternetSpeedTier.ABOVE_10MBPS]: "Above 10 Mbps",
};

const LEARNING_STYLE_LABELS: Record<LearningStyle, string> = {
  [LearningStyle.ANALYTICAL]: "Analytical - structured, logical, step-by-step",
  [LearningStyle.CREATIVE]: "Creative - exploratory, example-driven, flexible",
};

const ANALYTICAL_CREATIVE_LABELS: Record<AnalyticalOrCreative, string> = {
  [AnalyticalOrCreative.ANALYTICAL]: "Analytical",
  [AnalyticalOrCreative.CREATIVE]: "Creative",
  [AnalyticalOrCreative.BOTH]: "Both",
};

const WHATSAPP_LABELS: Record<WhatsappChannelStatus, string> = {
  [WhatsappChannelStatus.JOINED]: "Joined",
  [WhatsappChannelStatus.YET_TO_JOIN]: "Yet to join",
};

function yesNo(value: boolean | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value ? "Yes" : "No";
}

export interface TutorFieldEntry {
  id: string;
  label: string;
  // Matches tutor-application-flow.tsx's STEPS ids (1-11) - the wizard's
  // actual UI steps, which map 1:1 onto tutor-registration-schema.json's
  // step definitions (intro_services..agreements; review_submit is UI step
  // 12 and has no data fields of its own, so no registry entries reference it).
  stepId: number;
  stepTitle: string;
  getValue: (app: TutorApplication) => unknown;
  format: (value: any) => React.ReactNode;
}

// Single canonical list of every field captured by the tutor-registration
// wizard - the SOURCE for both the admin review screen
// (FullApplicationDetails) and the tutor's own read-only application record
// (MyApplicationRecord), so neither can silently drift from the other or
// from what the wizard actually collects. See
// crossCuttingRequirements.fullVisibilityPrinciple in
// tutor-registration-schema.json - this is the "iterate the schema/step
// structure programmatically" piece; add a field here once and it appears
// in both views automatically. The wizard's own input step components
// (services.tsx, personal-information.tsx, etc.) stay hand-built - this
// registry is the read-side counterpart, not a form generator.
export const TUTOR_FIELD_REGISTRY: TutorFieldEntry[] = [
  // Step 1: What You Can Teach (intro_services)
  {
    id: "servicesOffered",
    label: "Services offered",
    stepId: 1,
    stepTitle: "What You Can Teach",
    getValue: (a) => a.servicesOffered,
    format: (v: string[]) => v.join(", "),
  },

  // Step 2: Personal Information (personal_contact)
  {
    id: "countryOfResidence",
    label: "Country of residence",
    stepId: 2,
    stepTitle: "Personal Information",
    getValue: (a) => a.countryOfResidence,
    format: (v) => v,
  },
  {
    id: "preferredLanguages",
    label: "Preferred languages",
    stepId: 2,
    stepTitle: "Personal Information",
    getValue: (a) => a.preferredLanguages,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "dateOfBirth",
    label: "Date of birth",
    stepId: 2,
    stepTitle: "Personal Information",
    getValue: (a) => a.dateOfBirth,
    format: (v: string) => new Date(v).toLocaleDateString(),
  },
  {
    id: "headshotFile",
    label: "Headshot",
    stepId: 2,
    stepTitle: "Personal Information",
    getValue: (a) => a.headshotFile,
    format: (v) => <FileAccessRow label="Headshot photo" file={v} />,
  },

  // Step 3: Professional Experience
  {
    id: "qualifications",
    label: "Qualifications",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.qualifications,
    format: (v) => v,
  },
  {
    id: "yearsOfExperience",
    label: "Years of teaching experience",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.yearsOfExperience,
    format: (v) => v,
  },
  {
    id: "yearsOnlineTutoringExperience",
    label: "Years of online tutoring experience",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.yearsOnlineTutoringExperience,
    format: (v) => v,
  },
  {
    id: "highestQualification",
    label: "Highest qualification",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.highestQualification,
    format: (v) => v,
  },
  {
    id: "otherQualificationsHeld",
    label: "Other qualifications held",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.otherQualificationsHeld,
    format: (v: TutorApplication["otherQualificationsHeld"]) => v!.join(", "),
  },
  {
    id: "teachingExperienceHistory",
    label: "Teaching experience history",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.teachingExperienceHistory,
    format: (v: TutorApplication["teachingExperienceHistory"]) =>
      v!
        .map((entry) => `${entry.role} at ${entry.institution} (${entry.startDate} - ${entry.currentlyWorkHere ? "present" : entry.endDate})`)
        .join("; "),
  },
  {
    id: "otherCertifications",
    label: "Other certifications",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.otherCertifications,
    format: (v: TutorApplication["otherCertifications"]) => v!.join(", "),
  },
  {
    id: "previousPlatforms",
    label: "Previous tutoring platforms",
    stepId: 3,
    stepTitle: "Professional Experience",
    getValue: (a) => a.previousPlatforms,
    format: (v) => v,
  },

  // Step 4: What You Can Teach - Details (teaching_details)
  {
    id: "teachingCycles",
    label: "What you teach",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.teachingCycles,
    format: (v: TutorApplication["teachingCycles"]) => (
      <ul className="space-y-1">
        {v!.map((cycle, i) => (
          <li key={i}>
            <span className="font-medium">{cycle.service}:</span>{" "}
            {[
              cycle.curriculum?.join("/"),
              cycle.gradeLevel?.map((g) => GRADE_CLASS_LEVEL_LABELS[g]).join("/"),
              cycle.examBoard?.join("/"),
              cycle.ageRange?.join("/"),
            ]
              .filter(Boolean)
              .concat(cycle.subjects.join(", "))
              .join(" — ")}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "digitalSkillsBundles",
    label: "Digital skills bundles",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.digitalSkillsBundles,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "musicInstruments",
    label: "Music instruments",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.musicInstruments,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "softSkillsTopics",
    label: "Soft skills topics",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.softSkillsTopics,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "careerCoachingTopics",
    label: "Career coaching topics",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.careerCoachingTopics,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "selfDevTopics",
    label: "Self-development topics",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.selfDevTopics,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "adultEdFocusAreas",
    label: "Adult education focus areas",
    stepId: 4,
    stepTitle: "What You Can Teach - Details",
    getValue: (a) => a.adultEdFocusAreas,
    format: (v: string[]) => v.join(", "),
  },

  // Step 5: Supporting Documents
  {
    id: "govIdFile",
    label: "Government-issued ID",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => a.govIdFile,
    format: (v) => <FileAccessRow label="Government-issued ID" file={v} />,
  },
  {
    id: "cvFile",
    label: "CV/Resume",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => a.cvFile,
    format: (v) => <FileAccessRow label="CV/Resume" file={v} />,
  },
  {
    id: "supportingDocumentsFile",
    label: "Supporting documents",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => a.supportingDocumentsFile,
    format: (v) => <FileAccessRow label="Supporting documents" file={v} />,
  },
  {
    id: "certificationProofs",
    label: "Certification proofs",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => a.certificationProofs,
    format: (v: TutorApplication["certificationProofs"]) => (
      <div className="space-y-1.5">
        {v!.map((proof, i) => (
          <FileAccessRow key={i} label={`${proof.certification} proof`} file={proof.file} />
        ))}
      </div>
    ),
  },
  {
    id: "backgroundCheckConsent",
    label: "Background check consent",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => a.backgroundCheckConsent,
    format: (v) => yesNo(v),
  },
  {
    id: "reference1",
    label: "Reference 1",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => (a.reference1Name ? { name: a.reference1Name, contact: a.reference1Contact } : undefined),
    format: (v: { name: string; contact?: string }) => `${v.name} (${v.contact})`,
  },
  {
    id: "reference2",
    label: "Reference 2",
    stepId: 5,
    stepTitle: "Supporting Documents",
    getValue: (a) => (a.reference2Name ? { name: a.reference2Name, contact: a.reference2Contact } : undefined),
    format: (v: { name: string; contact?: string }) => `${v.name} (${v.contact})`,
  },

  // Step 6: Technical Readiness
  {
    id: "devices",
    label: "Devices",
    stepId: 6,
    stepTitle: "Technical Readiness",
    getValue: (a) => a.devices,
    format: (v: TutorApplication["devices"]) => v!.join(", "),
  },
  {
    id: "internetSpeed",
    label: "Internet speed",
    stepId: 6,
    stepTitle: "Technical Readiness",
    getValue: (a) => a.internetSpeed,
    format: (v) => SPEED_LABELS[v as keyof typeof SPEED_LABELS],
  },
  {
    id: "toolProficiency",
    label: "Tools proficiency",
    stepId: 6,
    stepTitle: "Technical Readiness",
    getValue: (a) => a.toolProficiency,
    format: (v: string[]) => v.join(", "),
  },
  {
    id: "hasQuietEnvironment",
    label: "Quiet environment",
    stepId: 6,
    stepTitle: "Technical Readiness",
    getValue: (a) => a.hasQuietEnvironment,
    format: (v) => yesNo(v),
  },
  {
    id: "hasPeripherals",
    label: "Webcam/mic/headset",
    stepId: 6,
    stepTitle: "Technical Readiness",
    getValue: (a) => a.hasPeripherals,
    format: (v) => yesNo(v),
  },

  // Step 7: Availability
  {
    id: "timezone",
    label: "Timezone",
    stepId: 7,
    stepTitle: "Availability",
    getValue: (a) => a.timezone,
    format: (v) => v,
  },
  {
    id: "availabilitySchedule",
    label: "Weekly availability",
    stepId: 7,
    stepTitle: "Availability",
    getValue: (a) => a.availabilitySchedule,
    format: (v: TutorApplication["availabilitySchedule"]) =>
      v!.map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(", "),
  },
  {
    id: "maxWeeklyHours",
    label: "Max weekly hours",
    stepId: 7,
    stepTitle: "Availability",
    getValue: (a) => a.maxWeeklyHours,
    format: (v) => MAX_WEEKLY_HOURS_LABELS[v as keyof typeof MAX_WEEKLY_HOURS_LABELS],
  },
  {
    id: "preferredClassFormat",
    label: "Preferred class format",
    stepId: 7,
    stepTitle: "Availability",
    getValue: (a) => a.preferredClassFormat,
    format: (v) => CLASS_FORMAT_LABELS[v as keyof typeof CLASS_FORMAT_LABELS],
  },

  // Step 8: Psychometric Evaluation
  {
    id: "psychConfidenceRating",
    label: "Confidence rating (1-5)",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.psychConfidenceRating,
    format: (v) => v,
  },
  {
    id: "psychDisengagedResponse",
    label: "Disengaged-student response",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.psychDisengagedResponse,
    format: (v) => v,
  },
  {
    id: "psychMotivation",
    label: "Motivation",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.psychMotivation,
    format: (v) => v,
  },
  {
    id: "psychParentDisagreementResponse",
    label: "Parent-disagreement response",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.psychParentDisagreementResponse,
    format: (v) => v,
  },
  {
    id: "personalityType",
    label: "Teaching style",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.personalityType,
    format: (v) => LEARNING_STYLE_LABELS[v as keyof typeof LEARNING_STYLE_LABELS],
  },
  {
    id: "personalityAdaptabilityRating",
    label: "Adaptability rating (1-5)",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.personalityAdaptabilityRating,
    format: (v) => v,
  },
  {
    id: "personalityClassPrep",
    label: "Class preparation approach",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.personalityClassPrep,
    format: (v) => v,
  },
  {
    id: "personalityAboveAndBeyond",
    label: "Above-and-beyond example",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.personalityAboveAndBeyond,
    format: (v) => v,
  },
  {
    id: "analyticalOrCreative",
    label: "Analytical or creative",
    stepId: 8,
    stepTitle: "Psychometric Evaluation",
    getValue: (a) => a.analyticalOrCreative,
    format: (v) => ANALYTICAL_CREATIVE_LABELS[v as keyof typeof ANALYTICAL_CREATIVE_LABELS],
  },

  // Step 9: Final Evaluation
  {
    id: "finalStrengths",
    label: "Strengths as online tutor",
    stepId: 9,
    stepTitle: "Final Evaluation",
    getValue: (a) => a.finalStrengths,
    format: (v) => v,
  },
  {
    id: "finalFeedbackApproach",
    label: "Feedback approach",
    stepId: 9,
    stepTitle: "Final Evaluation",
    getValue: (a) => a.finalFeedbackApproach,
    format: (v) => v,
  },
  {
    id: "lessonPlanUrl",
    label: "Lesson plan",
    stepId: 9,
    stepTitle: "Final Evaluation",
    getValue: (a) => a.lessonPlanUrl,
    format: (v) => (
      <a href={v} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
        View lesson plan
      </a>
    ),
  },
  {
    id: "lessonPlanText",
    label: "Lesson plan (text)",
    stepId: 9,
    stepTitle: "Final Evaluation",
    getValue: (a) => a.lessonPlanText,
    format: (v) => v,
  },
  {
    id: "internalExpectedPay",
    label: "Internal expected pay range",
    stepId: 9,
    stepTitle: "Final Evaluation",
    getValue: (a) =>
      a.internalExpectedPayMin != null && a.internalExpectedPayMax != null
        ? { min: a.internalExpectedPayMin, max: a.internalExpectedPayMax }
        : undefined,
    format: (v: { min: number; max: number }) => `₦${v.min.toLocaleString()} - ₦${v.max.toLocaleString()} / hr`,
  },

  // Step 10: Payment & Referral
  {
    id: "payoutMethod",
    label: "Payout method",
    stepId: 10,
    stepTitle: "Payment & Referral",
    getValue: (a) => a.payoutMethod,
    format: (v) => PAYOUT_METHOD_LABELS[v as keyof typeof PAYOUT_METHOD_LABELS],
  },
  {
    id: "bankName",
    label: "Bank name",
    stepId: 10,
    stepTitle: "Payment & Referral",
    getValue: (a) => a.bankName,
    format: (v) => v,
  },
  {
    id: "accountNumber",
    label: "Account number",
    stepId: 10,
    stepTitle: "Payment & Referral",
    getValue: (a) => a.accountNumber,
    format: (v) => v,
  },
  {
    id: "accountName",
    label: "Account name",
    stepId: 10,
    stepTitle: "Payment & Referral",
    getValue: (a) => a.accountName,
    format: (v) => v,
  },
  {
    id: "wasReferred",
    label: "Was referred",
    stepId: 10,
    stepTitle: "Payment & Referral",
    getValue: (a) => a.wasReferred,
    format: (v) => yesNo(v),
  },
  {
    id: "referringTutorId",
    label: "Referring tutor",
    stepId: 10,
    stepTitle: "Payment & Referral",
    getValue: (a) => a.referringTutorId,
    format: (v) => v,
  },

  // Step 11: Agreements & Consent
  {
    id: "termsAccepted",
    label: "Code of conduct accepted",
    stepId: 11,
    stepTitle: "Agreements & Consent",
    getValue: (a) => a.termsAccepted,
    format: (v) => yesNo(v),
  },
  {
    id: "ethicsCommitmentAccepted",
    label: "Ethics commitment accepted",
    stepId: 11,
    stepTitle: "Agreements & Consent",
    getValue: (a) => a.ethicsCommitmentAccepted,
    format: (v) => yesNo(v),
  },
  {
    id: "dataPrivacyAgreed",
    label: "Data privacy agreed",
    stepId: 11,
    stepTitle: "Agreements & Consent",
    getValue: (a) => a.dataPrivacyAgreed,
    format: (v) => yesNo(v),
  },
  {
    id: "signature",
    label: "E-signature",
    stepId: 11,
    stepTitle: "Agreements & Consent",
    getValue: (a) => a.signature,
    format: (v) => v,
  },
  {
    id: "whatsappChannelJoined",
    label: "WhatsApp channel",
    stepId: 11,
    stepTitle: "Agreements & Consent",
    getValue: (a) => a.whatsappChannelJoined,
    format: (v) => WHATSAPP_LABELS[v as keyof typeof WHATSAPP_LABELS],
  },
];

export const TUTOR_FIELD_STEPS: { stepId: number; stepTitle: string }[] = Array.from(
  new Map(TUTOR_FIELD_REGISTRY.map((f) => [f.stepId, f.stepTitle])).entries()
)
  .map(([stepId, stepTitle]) => ({ stepId, stepTitle }))
  .sort((a, b) => a.stepId - b.stepId);

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

// Renders one registry entry against a given application, or null if that
// field wasn't answered - shared by FullApplicationDetails (admin) and
// MyApplicationRecord (tutor's own profile) so both stay pixel-identical to
// what the registry declares.
export function renderTutorField(entry: TutorFieldEntry, app: TutorApplication): React.ReactNode {
  const value = entry.getValue(app);
  if (isEmpty(value)) return null;
  return entry.format(value);
}
