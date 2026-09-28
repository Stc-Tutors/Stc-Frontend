import { CourseTutor } from "@/types/course";

// A course's tutor comes back populated (CourseTutor) almost everywhere, but a couple of older call sites still
// hand back the bare id string - render something honest either way instead of leaving the cell blank.
export function courseTutorName(tutor: string | CourseTutor | undefined | null): string {
  if (!tutor) return "Unassigned";
  if (typeof tutor === "string") return "Tutor";
  return `${tutor.firstName} ${tutor.lastName}`;
}
