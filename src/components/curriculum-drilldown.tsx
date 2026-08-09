"use client";

import { useEffect, useState } from "react";
import { GetCurriculumChildrenAction } from "@/server/curriculum";
import { GetServicesAction } from "@/server/service-catalog";
import { CurriculumNode, CurriculumNodeType, CurriculumServiceType } from "@/types/curriculum";
import { ITaxonomyStage, ServiceCatalogStatus } from "@/types/service-catalog";

export interface CurriculumPath {
  country?: CurriculumNode;
  curriculum?: CurriculumNode;
  level?: CurriculumNode;
  klass?: CurriculumNode;
}

interface CurriculumDrilldownProps {
  serviceType: CurriculumServiceType;
  // Fires with the resolved SUBJECT leaves once the drill-down reaches them
  // (some branches skip Class/Year - see handleLevel below) - the caller
  // renders these as its own multi-select checkboxes, since a student picks
  // several subjects, not one.
  onSubjectsResolved: (subjects: CurriculumNode[]) => void;
  // Optional: fires with the current Country/Curriculum/Level/Class
  // selections on every change. The student enrollment flow doesn't need
  // this (it only cares about the resolved subject names), but a caller
  // that has to persist the full path - e.g. a tutor's teaching-combination
  // picker, which stores country/curriculum/gradeLevel alongside subjects -
  // does.
  onPathChange?: (path: CurriculumPath) => void;
}

const selectClass = "border rounded-md px-3 py-2 text-sm w-full";

// Fallback shown while `stages` hasn't loaded yet (or for a service with no
// tree - shouldn't render this component in that case, but avoids blank
// labels flashing on first paint).
const DEFAULT_LABELS = { curriculum: "Curriculum", level: "Level", klass: "Class" };

// This service's own taxonomyStages sequence (see ITaxonomyStage) decides
// the labels shown at each depth - e.g. academic-tutoring's stages[1..3] are
// Curriculum/Grade Level/Class-Year, exam-preparation's are Education
// Level/Exam/Category. The drill-down logic itself doesn't care about node
// `type` beyond detecting SUBJECT leaves, only the labels differ per service.
function labelsFromStages(stages: ITaxonomyStage[]) {
  return {
    curriculum: stages[1]?.label ?? DEFAULT_LABELS.curriculum,
    level: stages[2]?.label ?? DEFAULT_LABELS.level,
    klass: stages[3]?.label ?? DEFAULT_LABELS.klass,
  };
}

export default function CurriculumDrilldown({ serviceType, onSubjectsResolved, onPathChange }: CurriculumDrilldownProps) {
  const [labels, setLabels] = useState(DEFAULT_LABELS);

  useEffect(() => {
    GetServicesAction(ServiceCatalogStatus.ACTIVE).then(([res]) => {
      const service = res?.data?.find((s) => s.slug === serviceType);
      setLabels(labelsFromStages(service?.taxonomyStages ?? []));
    });
  }, [serviceType]);

  const [country, setCountry] = useState<CurriculumNode | undefined>();
  const [curriculum, setCurriculum] = useState<CurriculumNode | undefined>();
  const [level, setLevel] = useState<CurriculumNode | undefined>();
  const [klass, setKlass] = useState<CurriculumNode | undefined>();

  useEffect(() => {
    onPathChange?.({ country, curriculum, level, klass });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, curriculum, level, klass]);

  const [countries, setCountries] = useState<CurriculumNode[]>([]);
  const [curricula, setCurricula] = useState<CurriculumNode[]>([]);
  const [levels, setLevels] = useState<CurriculumNode[]>([]);
  const [classes, setClasses] = useState<CurriculumNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCountry(undefined);
    setCurriculum(undefined);
    setLevel(undefined);
    setKlass(undefined);
    setCurricula([]);
    setLevels([]);
    setClasses([]);
    onSubjectsResolved([]);
    GetCurriculumChildrenAction(null, serviceType).then(([res]) => setCountries(res?.data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType]);

  const handleCountry = async (id: string) => {
    const next = countries.find((c) => c.id === id);
    setCountry(next);
    setCurriculum(undefined);
    setLevel(undefined);
    setKlass(undefined);
    setLevels([]);
    setClasses([]);
    onSubjectsResolved([]);
    if (!next) {
      setCurricula([]);
      return;
    }
    const [res] = await GetCurriculumChildrenAction(id, serviceType);
    setCurricula(res?.data ?? []);
  };

  const handleCurriculum = async (id: string) => {
    const next = curricula.find((c) => c.id === id);
    setCurriculum(next);
    setLevel(undefined);
    setKlass(undefined);
    setClasses([]);
    onSubjectsResolved([]);
    if (!next) {
      setLevels([]);
      return;
    }
    const [res] = await GetCurriculumChildrenAction(id, serviceType);
    setLevels(res?.data ?? []);
  };

  const handleLevel = async (id: string) => {
    const next = levels.find((l) => l.id === id);
    setLevel(next);
    setKlass(undefined);
    setClasses([]);
    onSubjectsResolved([]);
    if (!next) return;

    setIsLoading(true);
    const [res] = await GetCurriculumChildrenAction(id, serviceType);
    const children = res?.data ?? [];
    setIsLoading(false);

    // Some branches skip this layer entirely - e.g. academic-tutoring
    // curricula with no Class/Year, or exam-preparation exams with no
    // Category (JAMB) - subjects attach straight to the level above.
    if (children.length > 0 && children[0].type === CurriculumNodeType.SUBJECT) {
      onSubjectsResolved(children);
    } else {
      setClasses(children);
    }
  };

  const handleClass = async (id: string) => {
    const next = classes.find((c) => c.id === id);
    setKlass(next);
    onSubjectsResolved([]);
    if (!next) return;

    setIsLoading(true);
    const [res] = await GetCurriculumChildrenAction(id, serviceType);
    setIsLoading(false);
    onSubjectsResolved(res?.data ?? []);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Country</label>
        <select className={selectClass} value={country?.id ?? ""} onChange={(e) => handleCountry(e.target.value)}>
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {country && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">{labels.curriculum}</label>
          <select className={selectClass} value={curriculum?.id ?? ""} onChange={(e) => handleCurriculum(e.target.value)}>
            <option value="">Select {labels.curriculum.toLowerCase()}</option>
            {curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {curriculum && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">{labels.level}</label>
          <select className={selectClass} value={level?.id ?? ""} onChange={(e) => handleLevel(e.target.value)}>
            <option value="">Select {labels.level.toLowerCase()}</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {level && classes.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">{labels.klass}</label>
          <select className={selectClass} value={klass?.id ?? ""} onChange={(e) => handleClass(e.target.value)}>
            <option value="">Select {labels.klass.toLowerCase()}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && <p className="text-xs text-gray-400 col-span-full">Loading...</p>}
    </div>
  );
}
