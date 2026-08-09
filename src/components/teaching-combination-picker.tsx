"use client";

import { useEffect, useState } from "react";
import CurriculumDrilldown, { CurriculumPath } from "@/components/curriculum-drilldown";
import { GetServicesAction } from "@/server/service-catalog";
import { CurriculumNode, CurriculumServiceType, TeachingCombination } from "@/types/curriculum";
import { IService, ServiceCatalogStatus } from "@/types/service-catalog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value: TeachingCombination[];
  onChange: (value: TeachingCombination[]) => void;
}

// A tutor's "what I teach" picker - the same Country -> Curriculum -> Grade
// Level -> Subject drill-down used in student enrollment (CurriculumDrilldown),
// wrapped in a repeatable add/remove list since a tutor may teach across more
// than one country/curriculum (unlike a student, who only ever enrolls in one
// at a time).
export default function TeachingCombinationPicker({ value, onChange }: Props) {
  // Which services actually have a curriculum tree - previously a hardcoded
  // 2-entry list, now whichever live Active services have a non-empty
  // taxonomyStages (see ITaxonomyStage). A tutor can only "teach" against a
  // service that has a tree to drill into (Course-Module services like
  // Tech for Kids are picked in the enrollment flow's own age-range/course
  // step, not here).
  const [services, setServices] = useState<IService[]>([]);
  const [serviceType, setServiceType] = useState<CurriculumServiceType>("");
  const [path, setPath] = useState<CurriculumPath>({});
  const [resolvedSubjects, setResolvedSubjects] = useState<CurriculumNode[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  // Bumped after every "Add" to force CurriculumDrilldown to remount (and so
  // reset its own internal selects) for the next entry.
  const [drilldownKey, setDrilldownKey] = useState(0);

  useEffect(() => {
    GetServicesAction(ServiceCatalogStatus.ACTIVE).then(([res]) => {
      const withTrees = (res?.data ?? []).filter((s) => s.taxonomyStages.length > 0);
      setServices(withTrees);
      setServiceType((prev) => prev || withTrees[0]?.slug || "");
    });
  }, []);

  const gradeLevel = path.klass ?? path.level;
  const canAdd = Boolean(path.country && path.curriculum && gradeLevel) && selectedSubjects.length > 0;

  const resetDrilldown = () => {
    setPath({});
    setResolvedSubjects([]);
    setSelectedSubjects([]);
    setDrilldownKey((k) => k + 1);
  };

  const handleServiceTypeChange = (next: CurriculumServiceType) => {
    setServiceType(next);
    resetDrilldown();
  };

  const addCombination = () => {
    if (!canAdd || !path.country || !path.curriculum || !gradeLevel) return;
    onChange([
      ...value,
      {
        serviceType,
        country: path.country.name,
        curriculum: path.curriculum.name,
        gradeLevel: gradeLevel.name,
        subjectsTaught: selectedSubjects,
      },
    ]);
    resetDrilldown();
  };

  const removeCombination = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((c, i) => (
            <li key={i} className="flex items-start justify-between gap-3 border rounded-md p-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  {c.country} · {c.curriculum} · {c.gradeLevel}
                </p>
                <p className="text-gray-600">{c.subjectsTaught.join(", ")}</p>
              </div>
              <button
                type="button"
                onClick={() => removeCombination(i)}
                className="text-red-600 text-xs hover:underline whitespace-nowrap"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border rounded-md p-3 space-y-3">
        <div className="space-y-1">
          <Label>Service</Label>
          <Select value={serviceType} onValueChange={(v) => handleServiceTypeChange(v as CurriculumServiceType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.serviceName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {serviceType && (
          <CurriculumDrilldown
            key={drilldownKey}
            serviceType={serviceType}
            onSubjectsResolved={(subjects) => {
              setResolvedSubjects(subjects);
              setSelectedSubjects([]);
            }}
            onPathChange={setPath}
          />
        )}

        {resolvedSubjects.length > 0 && (
          <div className="space-y-1">
            <Label>Subjects</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {resolvedSubjects.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedSubjects.includes(s.name)}
                    onCheckedChange={(checked) =>
                      setSelectedSubjects((prev) => (checked ? [...prev, s.name] : prev.filter((n) => n !== s.name)))
                    }
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <Button type="button" variant="outline" onClick={addCombination} disabled={!canAdd}>
          Add teaching combination
        </Button>
      </div>
    </div>
  );
}
