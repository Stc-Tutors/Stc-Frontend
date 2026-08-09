// Single source of truth for the fixed dropdown option sets shared across
// enrollment, tutor applications/profiles, and course creation - so every
// place a subject, curriculum, or age bracket is picked offers the same
// trackable set of values instead of each form inventing (or free-texting)
// its own.

export const TECH_TRACKS: Record<string, string[]> = {
  "5–8 years": [
    "Game Design with Scratch",
    "Basic computer literacy",
    "Creative expression with graphics",
  ],
  "9–12 years": [
    "Intermediate Block Coding (Scratch 3.0)",
    "Beginner Animation",
    "Practical AI with No Code",
    "Graphics design",
    "STEM Robotics",
  ],
  "13–16 years": [
    "Video editing",
    "Introduction to AI and Chatbots",
    "Web development (No Code with Wix/Wordpress)",
    "Presentation Mastery",
    "Text-lite Coding (Python or JavaScript for Beginners)",
    "Web Development (HTML, CSS & Simple JS)",
    "Graphics DESIGN",
    "Smart Robotics and Embedded Tech",
  ],
  "17-20 years": [
    "Build with AI (Vision/NLP)",
    "Full-Stack Web Dev Bootcamp",
    "Robotics & Embedded Systems",
    "Web Development (HTML, CSS & Simple JS)",
    "Graphics DESIGN",
    "NO CODE App Development",
    "Data analysis",
    "Portfolio and presentation",
    "Machine Learning with Python",
    "Data Science",
  ],
};

export const AGE_LEVELS = Object.keys(TECH_TRACKS);

export const ACADEMIC_SUBJECTS = [
  "Mathematics", "English", "Science", "Physics", "Chemistry", "Biology",
  "History", "Geography", "Economics", "Literature",
];

// Flattened, deduplicated pool used wherever a person (tutor, course author)
// picks subjects/tracks in general rather than drilling down a specific
// curriculum path - e.g. a tutor's "subjects I teach".
export const ALL_SUBJECTS = Array.from(
  new Set([...ACADEMIC_SUBJECTS, ...Object.values(TECH_TRACKS).flat()])
).sort();

// `value` matches the `curriculum` bucket used for tech-bootcamp pricing
// (getTechBootcampCost); `label` is the country name shown to the user in
// the Country select in SubjectsSchedule and the tutor's preferred-curriculum
// picker.
export const CURRICULA = [
  { value: "Nigerian", label: "Nigeria" },
  { value: "British", label: "UK" },
  { value: "American", label: "USA" },
  { value: "Canada", label: "Canada" },
  { value: "Ghanaian", label: "Ghana" },
  { value: "SouthAfrican", label: "South Africa" },
  { value: "Kenyan", label: "Kenya" },
  { value: "Zambian", label: "Zambia" },
  { value: "Irish", label: "Ireland" },
  { value: "Swiss", label: "Switzerland" },
  { value: "Chinese", label: "China" },
];

export const INSTRUCTION_LANGUAGES = [
  "English", "French", "Spanish", "Portuguese", "Arabic", "Swahili",
];

// Display title for every enrollable service, keyed by the same slug used in
// the public marketing routes (/services/<slug>) and the enrollment
// context's ServiceType. Used to seed `learningFocus` when a service is
// pre-selected via a `?service=` deep link.
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

// Static topic lists for the services that don't use the curriculum-node
// drill-down (academic-tutoring/exam-preparation) or the age-bracket track
// model (tech-bootcamp). Drawn directly from each service's own marketing
// copy in AcademicSession.tsx rather than invented from scratch.
export const SERVICE_TOPICS: Record<string, string[]> = {
  "digital-skills": [
    "Coding Fundamentals",
    "Robotics",
    "Video Editing",
    "App Development",
    "Graphic Design",
    "Digital Marketing",
  ],
  "music-training": ["Piano", "Guitar", "Vocals", "Violin", "Drums", "Music Theory & Composition"],
  "adult-education": [
    "Literacy & Numeracy",
    "Life Skills",
    "Career Advancement Skills",
    "Personal Development",
  ],
  "language-culture": ["French", "Spanish", "Portuguese", "Swahili", "Zulu", "Yoruba", "Hausa", "Igbo"],
  "soft-skill": [
    "Communication Skills",
    "Teamwork & Collaboration",
    "Time Management",
    "Leadership",
    "Job Training & Career Readiness",
  ],
  "career-coaching": [
    "CV Review",
    "Interview Preparation",
    "Public Speaking",
    "Digital Literacy",
    "Personalized Career Coaching",
  ],
  "self-development": ["Leadership", "Productivity", "Mindset Development", "Personal Growth Planning"],
};
