export interface TutorAllocation {
  id: string;
  tutor: string;
  allocatedCourseIds: string[];
  // Service Catalog slugs - allocates every course under that whole service.
  allocatedServiceTypes: string[];
  // CurriculumNode leaf ids, picked via the same tree browser used for
  // course creation and service pricing - replaces the old free-typed
  // allocatedSubjects (matched against Course.category), which could drift
  // out of sync with the live Service Catalog/taxonomy tree.
  allocatedTaxonomyNodeIds: string[];
  // When true, bypasses the three fields above - every course this tutor
  // teaches, resolved live (current and future), not a fixed list that
  // needs re-picking whenever the tutor gets a new course.
  allocateAll: boolean;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}
