"use client";

import {
  ArchitecturalPath,
  IServiceFlowRequirements,
  ITaxonomyStage,
  SelectionMode,
} from "@/types/service-catalog";
import { findFlowMismatches } from "@/lib/flow-sync";

interface Step {
  label: string;
  rule: string;
}

// What a student is actually asked, in order, for this service's current
// Flow Requirements + Flow Tree + selection mode - the same inputs the
// registration wizard's Subjects & Schedule step reads (see Stc-Frontend's
// subjects-schedule.tsx). Live: reflects unsaved edits, so an admin can see
// the effect of a change before saving it.
export function RegistrationFlowPreview({
  stages,
  flow,
  selectionMode,
  architecturalPath,
}: {
  stages: ITaxonomyStage[];
  flow: IServiceFlowRequirements;
  selectionMode: SelectionMode;
  architecturalPath: ArchitecturalPath | undefined;
}) {
  const isCourseModule = architecturalPath === ArchitecturalPath.COURSE_MODULE;
  const isSingle = selectionMode === SelectionMode.SINGLE;
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  const steps: Step[] = [];

  // The flow is exactly the tree: every stage is a choice, and the LAST stage
  // is what the student actually picks - one or several, per the selection
  // mode. There is deliberately no extra "Course" step after it.
  // The one exception: a tree that is only the age range. That stage is a
  // filter (it sets the student's age level), so it stays "pick one" and the
  // courses under it are what's ticked. Mirrors the registration form's
  // `lastStageIsPick` (Stc-Frontend subjects-schedule.tsx).
  const ageRangeOnly = ordered.length === 1 && !!flow.requires_age_range;

  ordered.forEach((stage, i) => {
    const isLast = i === ordered.length - 1;
    steps.push({
      label: stage.label || stage.type,
      rule: isLast && !isSingle && !ageRangeOnly ? "pick one or more" : "pick one",
    });
  });
  if (ageRangeOnly && !isSingle) steps.push({ label: "Courses", rule: "pick one or more" });

  // A service with no tree at all still has to pick something.
  if (ordered.length === 0) {
    steps.push({ label: isCourseModule ? "Courses" : "Subjects", rule: isSingle ? "pick one" : "pick one or more" });
  }

  // Extra choices an admin switched on explicitly in Flow Requirements - not
  // tree levels, but real questions the form asks after the tree.
  if (flow.requires_language_selection) steps.push({ label: "Language", rule: "pick one" });
  if (flow.requires_cohort) steps.push({ label: "Class group", rule: "pick one" });

  const mismatches = findFlowMismatches(flow, stages);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900">What students will see</p>
      <p className="text-xs text-gray-500">
        Updates as you change the requirements and the tree above - this is the order of choices in the
        registration form.
      </p>
      {steps.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md px-3 py-4 text-center">
          No choices configured yet.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {steps.map((step, i) => (
            <li key={`${step.label}-${i}`} className="flex items-baseline gap-3 text-sm">
              <span className="w-5 shrink-0 text-right font-mono text-xs text-gray-400">{i + 1}</span>
              <span className="font-medium text-gray-900">{step.label}</span>
              <span className="text-xs text-gray-500">{step.rule}</span>
            </li>
          ))}
        </ol>
      )}
      {mismatches.map((note) => (
        <p key={note} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {note}
        </p>
      ))}
    </div>
  );
}
