export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface ICourseScheduleSlot {
  days: string[];
  time: string;
  duration: number;
}

export interface ICurriculumItem {
  title: string;
  description?: string;
  order: number;
}

export interface CourseTutor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  language: string;
  // IService.slug - Path C (COURSE_MODULE) enrollment filters courses by
  // this against the selected service - see subjects-schedule.tsx's Course
  // selector. Always implicit from context, never a free admin/tutor choice.
  serviceType: string;
  // The CurriculumNode this course is attached to (a leaf of that service's
  // taxonomyStages tree - e.g. a Subject, or an Age Range node for a
  // Course-Module service). undefined when the service has no tree, in
  // which case the course attaches directly to the service. Replaces the
  // old free-text ageLevel/gradeLevel/curriculum fields.
  taxonomyNodeId?: string;
  tutor: string | CourseTutor;
  price: number;
  currency: string;
  capacity?: number;
  coverImageUrl?: string;
  schedule: ICourseScheduleSlot[];
  curriculumOutline: ICurriculumItem[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  requirements?: string[];
  status: CourseStatus;
  // True only for the bare-minimum record auto-created for a 1:1 tutoring
  // assignment (Academic Tutoring/Exam Preparation) - bookkeeping the schema
  // needs, never a real product listing. Never show a "Publish" call to
  // action or DRAFT/moderation messaging for one of these - see stcbe's
  // AllocationHubService.resolveCourseForTutorSubject.
  isBookkeeping?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDemographics {
  totalStudents: number;
  ageDistribution: { ageLevel: string; percent: number }[];
  countryDistribution: { country: string; percent: number }[];
}

export interface CourseDailyActivity {
  date: string;
  newEnrollments: number;
  attendanceMarked: number;
}

export interface CreateCoursePayload {
  tutorId?: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  language: string;
  // IService.slug - validated against the live Service Catalog server-side,
  // not a hardcoded 3-value union. Always implicit from the workspace/flow
  // the course is being created under, never a free-text/dropdown choice.
  serviceType: string;
  // A CurriculumNode belonging to serviceType's tree - required only when
  // that service actually has one (IService.taxonomyStages non-empty).
  taxonomyNodeId?: string;
  price: number;
  currency?: string;
  capacity?: number;
  coverImageUrl?: string;
  schedule?: ICourseScheduleSlot[];
  curriculumOutline?: ICurriculumItem[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  requirements?: string[];
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;
