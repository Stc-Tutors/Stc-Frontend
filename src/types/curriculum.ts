// Any live Service Catalog slug whose `taxonomyStages` is non-empty - no
// longer restricted to the original 2 (academic-tutoring/exam-preparation).
// A service's actual tree shape is described by its own `taxonomyStages`
// (see IService/ITaxonomyStage in @/types/service-catalog), fetched live via
// GET /public/services rather than hardcoded here.
export type CurriculumServiceType = string;

export enum CurriculumNodeType {
  COUNTRY = "COUNTRY",
  CURRICULUM = "CURRICULUM",
  LEVEL = "LEVEL",
  CLASS = "CLASS",
  SUBJECT = "SUBJECT",
  // exam-preparation only: COUNTRY -> LEVEL ("Education Level") -> EXAM (e.g.
  // WAEC, JAMB) -> CATEGORY (e.g. Core/Science/Arts - some exams skip this)
  // -> SUBJECT.
  EXAM = "EXAM",
  CATEGORY = "CATEGORY",
  // Root type for Course-Module services with a shallow single-depth tree
  // (e.g. tech-bootcamp's taxonomyStages = [AGE_RANGE]) - a root AGE_RANGE
  // node is itself the leaf a Course.taxonomyNodeId points at, no further
  // children beneath it.
  AGE_RANGE = "AGE_RANGE",
}

export interface ExamCourseCombination {
  course: string;
  subjects: string[];
}

// A self-referencing tree, not fixed columns - depth varies by branch
// (exam-preparation typically skips CLASS: a SUBJECT's parent can be a LEVEL
// directly) and a super admin grows this tree over time.
export interface CurriculumNode {
  id: string;
  serviceType: CurriculumServiceType;
  parent: string | null;
  type: CurriculumNodeType;
  name: string;
  order: number;
  // Only meaningful when type === EXAM - see stcbe ICurriculumNode.
  fullName?: string;
  description?: string;
  grades?: string[];
  requiredSubjects?: string[];
  courseCombinations?: ExamCourseCombination[];
}

// One "what I teach" entry for a tutor - a resolved Country/Curriculum/Grade
// Level path (picked via CurriculumDrilldown, same as student enrollment)
// plus the subjects taught at that leaf. A tutor may have several, covering
// different countries/curricula.
export interface TeachingCombination {
  serviceType: CurriculumServiceType;
  country: string;
  curriculum: string;
  gradeLevel: string;
  subjectsTaught: string[];
}
