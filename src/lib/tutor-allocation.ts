import { TutorAllocation } from "@/types/tutor-allocation";

// Mirrors stcbe's AllocationHubService.isSubjectAllocatedToTutor exactly -
// that's the check the backend actually enforces on assignTutor/suggestTutors
// regardless of what any UI lets you pick, so every surface that filters or
// previews tutor eligibility client-side must use this same predicate rather
// than reimplementing it.
export function isSubjectAllocatedToTutor(
  allocation: TutorAllocation | null,
  enrollment: { serviceType?: string; subjectNodeId?: string }
): boolean {
  if (!allocation) return false;
  if (allocation.allocateAll) return true;
  if (enrollment.serviceType && allocation.allocatedServiceTypes.includes(enrollment.serviceType)) return true;
  if (enrollment.subjectNodeId && allocation.allocatedTaxonomyNodeIds.includes(enrollment.subjectNodeId)) return true;
  return false;
}
