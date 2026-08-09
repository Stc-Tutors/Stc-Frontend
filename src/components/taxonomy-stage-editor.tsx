"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { CurriculumNodeType } from "@/types/curriculum";
import { ITaxonomyStage } from "@/types/service-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass = "border border-gray-300 rounded-md px-2 py-1.5 text-sm w-full";

// Ordered add/remove/reorder editor for a service's own `taxonomyStages` -
// the sequence of node types (and their display labels) that make up its
// curriculum tree, e.g. academic-tutoring's [COUNTRY, CURRICULUM,
// LEVEL("Grade Level"), CLASS("Class/Year"), SUBJECT]. A brand-new service
// starts with an empty sequence (no tree) - the admin explicitly opts into
// one by adding stages here, nothing is auto-populated from
// architecturalPath. Mirrors Stc-SuperAdmin's component of the same name so
// both admin surfaces manage this identically.
//
// `order` always tracks array position - it isn't independently editable,
// since a stage's depth in the tree *is* its index in this list.
export function TaxonomyStageEditor({
  value,
  onChange,
}: {
  value: ITaxonomyStage[];
  onChange: (stages: ITaxonomyStage[]) => void;
}) {
  const withOrder = (stages: ITaxonomyStage[]): ITaxonomyStage[] =>
    stages.map((s, i) => ({
      ...s,
      order: i,
      // alsoAllow only ever makes sense on the terminal stage.
      alsoAllow: i === stages.length - 1 ? s.alsoAllow : undefined,
    }));

  const updateStage = (index: number, patch: Partial<ITaxonomyStage>) => {
    onChange(withOrder(value.map((s, i) => (i === index ? { ...s, ...patch } : s))));
  };

  const addStage = () => {
    onChange(withOrder([...value, { type: CurriculumNodeType.COUNTRY, label: "", order: value.length }]));
  };

  const removeStage = (index: number) => {
    onChange(withOrder(value.filter((_, i) => i !== index)));
  };

  const moveStage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(withOrder(next));
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Curriculum tree shape</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          The ordered sequence of node types this service&apos;s tree drills through, e.g. Country → Curriculum →
          Grade Level → Class/Year → Subject. Leave empty if this service has no structured taxonomy - courses will
          attach directly to it instead. &quot;Also allow&quot; lets the terminal stage skip straight to a different
          type on some branches (e.g. an exam with no category tier).
        </p>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md px-3 py-4 text-center">
          No stages configured - this service has no curriculum tree.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((stage, i) => {
            const isLast = i === value.length - 1;
            return (
              <div key={i} className="flex items-start gap-2 border border-gray-200 rounded-md p-3">
                <div className="text-xs font-mono text-gray-400 w-6 pt-2">{i}</div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Node type</Label>
                    <select
                      className={selectClass}
                      value={stage.type}
                      onChange={(e) => updateStage(i, { type: e.target.value as CurriculumNodeType })}
                    >
                      {Object.values(CurriculumNodeType).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Display label</Label>
                    <Input
                      placeholder="e.g. Grade Level"
                      value={stage.label}
                      onChange={(e) => updateStage(i, { label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Also allow (terminal stage only)</Label>
                    <select
                      className={selectClass}
                      value={isLast ? stage.alsoAllow ?? "" : ""}
                      disabled={!isLast}
                      onChange={(e) =>
                        updateStage(i, { alsoAllow: e.target.value ? (e.target.value as CurriculumNodeType) : undefined })
                      }
                    >
                      <option value="">None</option>
                      {Object.values(CurriculumNodeType)
                        .filter((t) => t !== stage.type)
                        .map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 pt-5">
                  <button
                    type="button"
                    onClick={() => moveStage(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStage(i, 1)}
                    disabled={isLast}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeStage(i)}
                  className="text-red-500 hover:text-red-700 pt-5"
                  title="Remove stage"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addStage}>
        <Plus className="size-4" />
        Add stage
      </Button>
    </div>
  );
}
