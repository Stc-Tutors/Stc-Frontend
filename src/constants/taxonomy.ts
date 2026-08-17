// Display title for every enrollable service, keyed by the same slug used in
// the public marketing routes (/services/<slug>) and the enrollment
// context's ServiceType. Used to seed `learningFocus` when a service is
// pre-selected via a `?service=` deep link.
//
// This used to sit alongside hardcoded SERVICE_TOPICS/CURRICULA/ALL_SUBJECTS/
// TECH_TRACKS/INSTRUCTION_LANGUAGES lists - those were the pre-Service-Catalog
// dropdown option sets. They were unused dead code (every live picker now
// pulls the real tree from the backend Service Catalog/CurriculumNode via
// CurriculumDrilldown/teaching-combination-picker.tsx) and have been removed
// so nothing gets accidentally wired back to a hardcoded list instead of the
// DB-backed one - see types/service-catalog.ts for the live contract.
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  "academic-tutoring": "Academic Tutoring",
  "exam-preparation": "Exam Preparation",
  "tech-bootcamp": "Tech Training for Kids",
  "digital-skills": "Digital Skills Development",
  "music-training": "Music Training",
  "adult-education": "Adult Education",
  "language-culture": "Language and Culture",
  "soft-skill": "Soft Skill Development",
  "career-coaching": "Career Coaching",
  "self-development": "Self-Development",
};
