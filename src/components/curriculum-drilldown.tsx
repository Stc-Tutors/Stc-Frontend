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
  // several subjects, not one. Also carries the exact path that produced
  // these subjects (omitted when merely clearing to []) - a caller that
  // needs the two in sync (e.g. also persisting country/examCategory
  // alongside the subjects) should apply both from this single callback
  // rather than relying on onPathChange separately. Without this, subjects
  // resolving (an imperative call inside an async handler) and onPathChange
  // firing (a separate useEffect reacting to state a render later) had no
  // guaranteed order - under real network timing this could resolve subjects
  // successfully while the parent's country/curriculum/examCategory state
  // still reflected an earlier, blanker path, so a real submission could
  // reach payment with genuine subjects selected but educationLevel/exam/
  // examCategory silently empty.
  onSubjectsResolved: (subjects: CurriculumNode[], path?: CurriculumPath) => void;
  // Optional: fires with the current Country/Curriculum/Level/Class
  // selections on every change - a live running commentary, useful for
  // breadcrumb-style display, but NOT guaranteed to be in sync with the most
  // recent onSubjectsResolved call (see that prop's doc). A caller that
  // needs the two consistent should read the path from onSubjectsResolved.
  onPathChange?: (path: CurriculumPath) => void;
  // Names (not ids - callers only persist the resolved node names, e.g.
  // ServiceDetails.country/curriculum/examCategory) to walk the tree down to
  // and restore on mount, instead of always starting blank. Without this, a
  // step that remounts with a previously-completed selection already in its
  // state (e.g. the enrollment wizard's Subjects & Schedule step re-mounting
  // after "Edit" from Review, or resuming a saved draft) forced the parent
  // to redo the entire Country -> ... -> Category drill-down from scratch,
  // and any subject/category picked before that redo finished got treated
  // as unresolved - the "my selection keeps getting deleted" bug.
  initialPath?: { country?: string; curriculum?: string; level?: string; klass?: string };
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

export default function CurriculumDrilldown({ serviceType, onSubjectsResolved, onPathChange, initialPath }: CurriculumDrilldownProps) {
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
    let cancelled = false;
    setCountry(undefined);
    setCurriculum(undefined);
    setLevel(undefined);
    setKlass(undefined);
    setCurricula([]);
    setLevels([]);
    setClasses([]);
    onSubjectsResolved([]);

    const restore = async () => {
      const [countriesRes] = await GetCurriculumChildrenAction(null, serviceType);
      const countryList = countriesRes?.data ?? [];
      if (cancelled) return;
      setCountries(countryList);
      if (!initialPath?.country) return;

      const countryNode = countryList.find((c) => c.name === initialPath.country);
      if (!countryNode) return;
      setCountry(countryNode);
      const [curriculaRes] = await GetCurriculumChildrenAction(countryNode.id, serviceType);
      const curriculaList = curriculaRes?.data ?? [];
      if (cancelled) return;
      setCurricula(curriculaList);
      if (!initialPath.curriculum) return;

      const curriculumNode = curriculaList.find((c) => c.name === initialPath.curriculum);
      if (!curriculumNode) return;
      setCurriculum(curriculumNode);
      const [levelsRes] = await GetCurriculumChildrenAction(curriculumNode.id, serviceType);
      const levelList = levelsRes?.data ?? [];
      if (cancelled) return;
      setLevels(levelList);
      if (!initialPath.level) return;

      const levelNode = levelList.find((l) => l.name === initialPath.level);
      if (!levelNode) return;
      setLevel(levelNode);
      setIsLoading(true);
      const [childrenRes] = await GetCurriculumChildrenAction(levelNode.id, serviceType);
      const children = childrenRes?.data ?? [];
      setIsLoading(false);
      if (cancelled) return;

      // Same branch as handleLevel below - some exams skip the Category
      // layer entirely and attach subjects straight to the level above.
      if (children.length > 0 && children[0].type === CurriculumNodeType.SUBJECT) {
        onSubjectsResolved(children, { country: countryNode, curriculum: curriculumNode, level: levelNode });
        return;
      }
      setClasses(children);
      if (!initialPath.klass) return;

      const klassNode = children.find((c) => c.name === initialPath.klass);
      if (!klassNode) return;
      setKlass(klassNode);
      setIsLoading(true);
      const [subjectsRes] = await GetCurriculumChildrenAction(klassNode.id, serviceType);
      setIsLoading(false);
      if (cancelled) return;
      onSubjectsResolved(subjectsRes?.data ?? [], { country: countryNode, curriculum: curriculumNode, level: levelNode, klass: klassNode });
    };
    restore();

    return () => {
      cancelled = true;
    };
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
      onSubjectsResolved(children, { country, curriculum, level: next });
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
    onSubjectsResolved(res?.data ?? [], { country, curriculum, level, klass: next });
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
