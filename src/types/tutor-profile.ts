import { TeachingCombination } from "./curriculum";
import { Weekday } from "@/constants/weekdays";
import { UploadedFile } from "@/lib/cloudinary-upload";
import {
  InternetSpeedTier,
  MaxWeeklyHoursBand,
  PayoutMethod,
  TeachingCycle,
  TutorClassFormat,
} from "./tutor-application";

// A tutor's general weekly availability - one open window per day (1-7
// entries), not tied to any subject or fixed session length. `startTime`/
// `endTime` are "HH:MM" 24-hour strings (native <input type="time"> value).
export interface TutorAvailabilitySlot {
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
}

export interface TutorEducationEntry {
  degree: string;
  institution?: string;
  year?: number;
}

export interface TutorSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface TutorCertificationProof {
  certification: string;
  file: UploadedFile;
}

export interface TutorProfile {
  id: string;
  // A plain id from most endpoints; GetTutorProfileAction's GET /:tutorId
  // populates it with name/avatar, since a parent/student viewing a
  // tutor's profile needs a name to attach the bio/qualifications to.
  tutor: string | TutorSummary;
  bio?: string;
  teachingCombinations: TeachingCombination[];
  teachingCycles?: TeachingCycle[];
  digitalSkillsBundles?: string[];
  musicInstruments?: string[];
  softSkillsTopics?: string[];
  careerCoachingTopics?: string[];
  selfDevTopics?: string[];
  adultEdFocusAreas?: string[];
  ageLevelsTaught: string[];
  availability: TutorAvailabilitySlot[];
  // General (non-subject-tied) scheduling preferences, alongside `availability`.
  maxWeeklyHours?: MaxWeeklyHoursBand;
  preferredClassFormat?: TutorClassFormat;
  // IANA timezone the `availability` times above were entered in - see
  // stcbe's LessonService.isWithinAvailability, which converts a
  // reschedule request into this timezone before comparing.
  timezone?: string;
  yearsOfExperience?: number;
  qualifications?: string;
  education: TutorEducationEntry[];
  // Prefilled from TutorApplication at approval, editable afterward - shown
  // on the public profile alongside qualifications/experience (2026-08-21
  // visibility decision).
  preferredLanguages?: string[];
  otherCertifications?: string[];
  // Tutor-facing only - never shown on the public profile parents/students see.
  countryOfResidence?: string;
  govIdFile?: UploadedFile;
  cvFile?: UploadedFile;
  supportingDocumentsFile?: UploadedFile;
  certificationProofs?: TutorCertificationProof[];
  devices?: string[];
  internetSpeed?: InternetSpeedTier;
  toolProficiency?: string[];
  hasQuietEnvironment?: boolean;
  hasPeripherals?: boolean;
  payoutMethod?: PayoutMethod;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
