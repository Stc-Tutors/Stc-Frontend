import { TeachingCombination } from "./curriculum";

export interface TutorAvailabilitySlot {
  subject: string;
  days: string[];
  time: string;
  duration: number;
}

export interface TutorEducationEntry {
  degree: string;
  institution?: string;
  year?: number;
}

export interface TutorProfile {
  id: string;
  tutor: string;
  bio?: string;
  teachingCombinations: TeachingCombination[];
  ageLevelsTaught: string[];
  availability: TutorAvailabilitySlot[];
  yearsOfExperience?: number;
  qualifications?: string;
  education: TutorEducationEntry[];
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
