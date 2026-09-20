import { CurriculumNodeType } from "@/types/curriculum";
import { IServiceFlowRequirements, ITaxonomyStage } from "@/types/service-catalog";

type FlowKey = keyof IServiceFlowRequirements;

// A Flow Requirement and a Flow Tree stage are two views of the same thing -
// "Country is required" IS "the tree has a Country stage" - so the admin UI
// keeps them in step instead of making an admin flip both by hand and hope
// they agree. Only these requirements correspond to a tree level; cohort,
// course selection and language selection aren't tree levels (they're extra
// steps after the tree), so toggling them never touches the stages.
const FLAG_TO_STAGE: Partial<Record<FlowKey, { type: CurriculumNodeType; label: string }>> = {
  requires_age_range: { type: CurriculumNodeType.AGE_RANGE, label: "Age Range" },
  requires_country: { type: CurriculumNodeType.COUNTRY, label: "Country" },
  requires_curriculum: { type: CurriculumNodeType.CURRICULUM, label: "Curriculum" },
  requires_grade_level: { type: CurriculumNodeType.LEVEL, label: "Grade Level" },
  requires_education_level: { type: CurriculumNodeType.LEVEL, label: "Education Level" },
  requires_exam: { type: CurriculumNodeType.EXAM, label: "Exam" },
  requires_class_year: { type: CurriculumNodeType.CLASS, label: "Class/Year" },
  requires_category: { type: CurriculumNodeType.CATEGORY, label: "Category" },
  requires_subject: { type: CurriculumNodeType.SUBJECT, label: "Subject" },
};

const flagsForType = (type: CurriculumNodeType): FlowKey[] =>
  (Object.keys(FLAG_TO_STAGE) as FlowKey[]).filter((k) => FLAG_TO_STAGE[k]?.type === type);

// Where a newly-added level belongs relative to the ones already there (both
// real trees - academic tutoring and exam prep - follow this ordering), so
// switching a requirement on inserts the stage in a sensible spot instead of
// always at the bottom. An admin can still reorder it afterwards.
const CANONICAL_RANK: Record<CurriculumNodeType, number> = {
  [CurriculumNodeType.AGE_RANGE]: 0,
  [CurriculumNodeType.COUNTRY]: 1,
  [CurriculumNodeType.CURRICULUM]: 2,
  [CurriculumNodeType.LEVEL]: 3,
  [CurriculumNodeType.EXAM]: 4,
  [CurriculumNodeType.CLASS]: 5,
  [CurriculumNodeType.CATEGORY]: 6,
  [CurriculumNodeType.SUBJECT]: 7,
};

const withOrder = (stages: ITaxonomyStage[]): ITaxonomyStage[] =>
  stages.map((s, i) => ({ ...s, order: i, alsoAllow: i === stages.length - 1 ? s.alsoAllow : undefined }));

const hasStage = (stages: ITaxonomyStage[], type: CurriculumNodeType) => stages.some((s) => s.type === type);

// The admin flipped a Flow Requirement: update the requirement and, when it
// corresponds to a tree level, add/remove that stage so the Flow Tree shows it.
export function toggleFlowRequirement(
  flow: IServiceFlowRequirements,
  stages: ITaxonomyStage[],
  key: FlowKey
): { flow: IServiceFlowRequirements; stages: ITaxonomyStage[] } {
  const turningOn = !flow[key];
  const nextFlow = { ...flow, [key]: turningOn };
  const mapping = FLAG_TO_STAGE[key];
  if (!mapping) return { flow: nextFlow, stages };

  if (turningOn) {
    if (hasStage(stages, mapping.type)) return { flow: nextFlow, stages };
    const rank = CANONICAL_RANK[mapping.type];
    const at = stages.findIndex((s) => CANONICAL_RANK[s.type] > rank);
    const next = [...stages];
    next.splice(at === -1 ? next.length : at, 0, { type: mapping.type, label: mapping.label, order: 0 });
    return { flow: nextFlow, stages: withOrder(next) };
  }

  // Grade Level and Education Level share the LEVEL stage - only drop it once
  // neither requirement still needs it.
  const stillNeeded = flagsForType(mapping.type).some((k) => nextFlow[k]);
  if (stillNeeded) return { flow: nextFlow, stages };
  return { flow: nextFlow, stages: withOrder(stages.filter((s) => s.type !== mapping.type)) };
}

// The admin edited the Flow Tree: turn on/off the requirements for any level
// that was just added/removed. Deliberately compares against `previous` so a
// service whose requirements and tree already differ (older data) isn't
// silently rewritten just by opening it - only what the admin changes syncs.
export function syncFlowRequirementsFromStages(
  flow: IServiceFlowRequirements,
  previous: ITaxonomyStage[],
  next: ITaxonomyStage[]
): IServiceFlowRequirements {
  const result = { ...flow };
  for (const type of Object.values(CurriculumNodeType)) {
    const was = hasStage(previous, type);
    const now = hasStage(next, type);
    if (was === now) continue;
    const keys = flagsForType(type);
    if (now) {
      if (keys.some((k) => result[k])) continue;
      // LEVEL is "Education Level" for exam prep, "Grade Level" otherwise -
      // let the stage's own label decide which one was meant.
      const label = next.find((s) => s.type === type)?.label.toLowerCase() ?? "";
      const key = type === CurriculumNodeType.LEVEL && label.includes("education") ? "requires_education_level" : keys[0];
      result[key] = true;
    } else {
      for (const k of keys) result[k] = false;
    }
  }
  return result;
}

// Requirements that describe a tree level but whose stage isn't in the tree
// (and the reverse) - shown as warnings in the preview so an admin can see
// an inconsistency instead of it surfacing later as a confusing student form.
export function findFlowMismatches(flow: IServiceFlowRequirements, stages: ITaxonomyStage[]): string[] {
  const notes: string[] = [];
  for (const key of Object.keys(FLAG_TO_STAGE) as FlowKey[]) {
    const mapping = FLAG_TO_STAGE[key]!;
    if (flow[key] && !hasStage(stages, mapping.type)) {
      notes.push(`"${mapping.label}" is required but the Flow Tree has no ${mapping.type} stage, so students won't be asked for it.`);
    }
  }
  return notes;
}
