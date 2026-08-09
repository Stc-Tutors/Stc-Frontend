"use client";

import { FLOW_REQUIREMENT_KEYS, FLOW_REQUIREMENT_LABELS, IServiceFlowRequirements } from "@/types/service-catalog";

// The flow-requirement toggle grid - shared between the Service Catalog
// list's create/edit dialog and a service's workspace Overview tab so the
// two never drift. Mirrors Stc-SuperAdmin's component of the same name.
// FLOW_REQUIREMENT_LABELS is the canonical wording for these taxonomy terms
// (Country, Curriculum, Grade Level, Class/Year, Subject, Education Level,
// Exam, Category, Age Range, Cohort, Course Selection, Language Selection,
// ...) - every other screen that talks about the same concepts should match
// this wording exactly.
export function ServiceFlowRequirementsFieldset({
  value,
  onToggle,
}: {
  value: IServiceFlowRequirements | undefined;
  onToggle: (key: keyof IServiceFlowRequirements) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900">Flow requirements</p>
      <p className="text-xs text-gray-500">
        Off = hidden from the registration form (select None downstream). On = shown as a step/field and populated
        from the matching taxonomy list.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 rounded-md p-3">
        {FLOW_REQUIREMENT_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!value?.[key]}
              onChange={() => onToggle(key)}
              className="rounded border-gray-300"
            />
            {FLOW_REQUIREMENT_LABELS[key]}
          </label>
        ))}
      </div>
    </div>
  );
}
