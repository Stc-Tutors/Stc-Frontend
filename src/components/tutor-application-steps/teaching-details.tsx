"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import {
  GRADE_CLASS_LEVEL_LABELS,
  GradeClassLevel,
  TeachingCycle,
  TutorApplicationStep3Payload,
} from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep3Payload) => void;
  errors: Record<string, string>;
}

type FieldKey = keyof TutorApplicationStep3Payload;

// Services that use a repeatable cycle (context + subjects) instead of one
// flat multi-select - see ITeachingCycle. Everything else in SECTIONS below
// stays a flat picker.
const CYCLE_SERVICES = ["Academic Tutoring", "Exam Preparation", "Tech Training for Kids"];

// Static, fixed grouping of exam boards that share ONE subject list - not a
// live catalog relationship, see stcbe's EXAM_BOARD_GROUPS for the full
// Checkboxes, not a fixed dropdown - a tutor can pick any SUBSET of a
// group (e.g. WAEC+NECO without NABTEB) as long as everything checked
// belongs to the same group; mixing across groups or with an ungrouped
// value isn't allowed. Mirrors stcbe's isSubsetOfSomeGroup exactly.
const EXAM_BOARD_GROUPS: string[][] = [["WAEC", "NECO", "NABTEB"]];

function isSubsetOfSomeGroup(values: string[]): boolean {
  return EXAM_BOARD_GROUPS.some((group) => values.every((v) => group.includes(v)));
}

// Only the sub-section(s) matching whatever the applicant picked in
// services.tsx (Step 1) are shown/required - see intro_services in
// tutor-registration-schema.json. Each list is a TaxonomyOptionKind so it
// stays admin-editable, same as country/language - see stcbe's
// TaxonomyOptionKind and seed-taxonomy-options.ts.
const SECTIONS: {
  service: string;
  title: string;
  fieldKey: FieldKey;
  label: string;
  kind: TaxonomyOptionKind;
}[] = [
  { service: "Digital Skills Development", title: "Digital Skills Development", fieldKey: "digitalSkillsBundles", label: "Course bundles you can teach within", kind: TaxonomyOptionKind.DIGITAL_SKILLS_BUNDLE },
  { service: "Music Training", title: "Music Training", fieldKey: "musicInstruments", label: "Instrument(s)/voice you can teach", kind: TaxonomyOptionKind.MUSIC_INSTRUMENT },
  { service: "Soft Skills Development", title: "Soft Skills Development", fieldKey: "softSkillsTopics", label: "Topics you can lead", kind: TaxonomyOptionKind.SOFT_SKILLS_TOPIC },
  { service: "Career Coaching", title: "Career Coaching", fieldKey: "careerCoachingTopics", label: "Coaching areas you cover", kind: TaxonomyOptionKind.CAREER_COACHING_TOPIC },
  { service: "Self-Development", title: "Self-Development", fieldKey: "selfDevTopics", label: "Topics you cover", kind: TaxonomyOptionKind.SELF_DEV_TOPIC },
  { service: "Adult Education", title: "Adult Education", fieldKey: "adultEdFocusAreas", label: "Focus areas you can teach", kind: TaxonomyOptionKind.ADULT_ED_FOCUS_AREA },
];

function emptyCycle(service: string): TeachingCycle {
  return { service, subjects: [] };
}

export default function TeachingDetailsStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();
  const servicesOffered = draft.step1.servicesOffered || [];
  const activeCycleServices = CYCLE_SERVICES.filter((s) => servicesOffered.includes(s));
  const activeSections = SECTIONS.filter((s) => servicesOffered.includes(s.service));

  const [options, setOptions] = useState<Record<string, ITaxonomyOption[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cycles, setCycles] = useState<TeachingCycle[]>(() =>
    draft.step3.teachingCycles?.length
      ? draft.step3.teachingCycles
      : activeCycleServices.map((service) => emptyCycle(service))
  );
  const [values, setValues] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const section of activeSections) {
      initial[section.fieldKey] = (draft.step3[section.fieldKey] as string[]) || [];
    }
    return initial;
  });

  useEffect(() => {
    const kinds = new Set(activeSections.map((s) => s.kind));
    if (activeCycleServices.includes("Academic Tutoring") || activeCycleServices.includes("Exam Preparation")) {
      kinds.add(TaxonomyOptionKind.ACADEMIC_SUBJECT);
    }
    if (activeCycleServices.includes("Academic Tutoring")) {
      kinds.add(TaxonomyOptionKind.CURRICULUM_SYSTEM);
    }
    if (activeCycleServices.includes("Exam Preparation")) {
      kinds.add(TaxonomyOptionKind.EXAM_BOARD);
    }
    if (activeCycleServices.includes("Tech Training for Kids")) {
      kinds.add(TaxonomyOptionKind.TECH_CATEGORY);
      kinds.add(TaxonomyOptionKind.AGE_RANGE);
    }
    const uniqueKinds = Array.from(kinds);
    Promise.all(uniqueKinds.map((kind) => GetTaxonomyOptionsAction(kind))).then((results) => {
      const next: Record<string, ITaxonomyOption[]> = {};
      uniqueKinds.forEach((kind, i) => {
        next[kind] = results[i][0]?.data ?? [];
      });
      setOptions(next);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFlatValue = (fieldKey: FieldKey, value: string) => {
    setValues((prev) => {
      const current = prev[fieldKey] || [];
      return {
        ...prev,
        [fieldKey]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const updateCycle = (index: number, patch: Partial<TeachingCycle>) => {
    setCycles((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const addCycle = (service: string) => {
    setCycles((prev) => [...prev, emptyCycle(service)]);
  };

  const removeCycle = (index: number) => {
    setCycles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCycleSubject = (index: number, subject: string) => {
    setCycles((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const has = c.subjects.includes(subject);
        return { ...c, subjects: has ? c.subjects.filter((s) => s !== subject) : [...c.subjects, subject] };
      })
    );
  };

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      for (const section of activeSections) {
        if ((values[section.fieldKey] || []).length === 0) {
          stepErrors[section.fieldKey] = `Please select at least one option for ${section.title}`;
        }
      }

      const cyclesByService: Record<string, TeachingCycle[]> = {};
      for (const cycle of cycles) {
        (cyclesByService[cycle.service] ??= []).push(cycle);
      }
      for (const service of activeCycleServices) {
        const serviceCycles = cyclesByService[service] || [];
        if (serviceCycles.length === 0) {
          stepErrors[`cycle_${service}`] = `Please add at least one ${service} entry`;
          continue;
        }
        serviceCycles.forEach((cycle, i) => {
          const key = `cycle_${service}_${i}`;
          if (service === "Academic Tutoring" && (!cycle.curriculum?.length || !cycle.gradeLevel?.length)) {
            stepErrors[key] = "Select a curriculum and grade level";
          }
          if (service === "Exam Preparation") {
            if (!cycle.examBoard?.length) {
              stepErrors[key] = "Select an exam board";
            } else if (cycle.examBoard.length > 1 && !isSubsetOfSomeGroup(cycle.examBoard)) {
              stepErrors[key] = "Selected exam boards must all belong to the same group (e.g. WAEC/NECO/NABTEB)";
            }
          }
          if (service === "Tech Training for Kids" && !cycle.ageRange?.length) {
            stepErrors[key] = "Select an age range";
          }
          if (cycle.subjects.length === 0) {
            stepErrors[key] = stepErrors[key] || "Select at least one subject/skill";
          }
        });
      }

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, { ...values, teachingCycles: cycles } as TutorApplicationStep3Payload);
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, cycles, onNext]);

  const academicSubjectOptions = options[TaxonomyOptionKind.ACADEMIC_SUBJECT] || [];
  const examBoardOptions = options[TaxonomyOptionKind.EXAM_BOARD] || [];
  const techSkillOptions = options[TaxonomyOptionKind.TECH_CATEGORY] || [];
  const ageRangeOptions = options[TaxonomyOptionKind.AGE_RANGE] || [];
  const curriculumOptions = options[TaxonomyOptionKind.CURRICULUM_SYSTEM] || [];

  if (activeCycleServices.length === 0 && activeSections.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-gray-500">
          Nothing else needed here for the service(s) you selected - click Next to continue.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {isLoading && <p className="text-sm text-gray-500">Loading options...</p>}

      {activeCycleServices.map((service) => {
        const serviceCycles = cycles
          .map((cycle, index) => ({ cycle, index }))
          .filter(({ cycle }) => cycle.service === service);

        return (
          <Card key={service}>
            <CardHeader>
              <CardTitle>{service}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceCycles.map(({ cycle, index }, cycleNum) => (
                <Card key={index} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Entry {cycleNum + 1}</h4>
                    {serviceCycles.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCycle(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {service === "Academic Tutoring" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Curriculum *</Label>
                        <Select
                          value={cycle.curriculum?.[0] || ""}
                          onValueChange={(v) => updateCycle(index, { curriculum: [v] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select curriculum" />
                          </SelectTrigger>
                          <SelectContent>
                            {curriculumOptions.map((c) => (
                              <SelectItem key={c.id} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Grade Level *</Label>
                        <Select
                          value={cycle.gradeLevel?.[0] || ""}
                          onValueChange={(v) => updateCycle(index, { gradeLevel: [v as GradeClassLevel] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(GradeClassLevel).map((g) => (
                              <SelectItem key={g} value={g}>
                                {GRADE_CLASS_LEVEL_LABELS[g]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {service === "Exam Preparation" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Exam Board(s) *</Label>
                      <p className="text-xs text-gray-500">
                        Check multiple only if they share the same subject list (e.g. WAEC/NECO/NABTEB).
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {examBoardOptions.map((opt) => {
                          const current = cycle.examBoard || [];
                          const isChecked = current.includes(opt.value);
                          const wouldBeInvalid = !isChecked && current.length > 0 && !isSubsetOfSomeGroup([...current, opt.value]);
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-center space-x-2 text-sm ${wouldBeInvalid ? "opacity-40" : ""}`}
                            >
                              <Checkbox
                                checked={isChecked}
                                disabled={wouldBeInvalid}
                                onCheckedChange={() => {
                                  const next = isChecked ? current.filter((v) => v !== opt.value) : [...current, opt.value];
                                  updateCycle(index, { examBoard: next });
                                }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {service === "Tech Training for Kids" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Age Range *</Label>
                      <Select value={cycle.ageRange?.[0] || ""} onValueChange={(v) => updateCycle(index, { ageRange: [v] })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageRangeOptions.map((a) => (
                            <SelectItem key={a.id} value={a.value}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm">
                      {service === "Tech Training for Kids" ? "Skills *" : "Subjects *"}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(service === "Tech Training for Kids" ? techSkillOptions : academicSubjectOptions).map((opt) => (
                        <label key={opt.id} className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            checked={cycle.subjects.includes(opt.value)}
                            onCheckedChange={() => toggleCycleSubject(index, opt.value)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {errors[`cycle_${service}_${cycleNum}`] && (
                    <p className="text-red-600 text-sm">{errors[`cycle_${service}_${cycleNum}`]}</p>
                  )}
                </Card>
              ))}

              {errors[`cycle_${service}`] && <p className="text-red-600 text-sm">{errors[`cycle_${service}`]}</p>}

              <Button type="button" variant="outline" onClick={() => addCycle(service)}>
                Add another {service} entry
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {activeSections.map((section) => (
        <Card key={section.fieldKey}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">{section.label} *</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(options[section.kind] || []).map((option) => (
                <label key={option.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={(values[section.fieldKey] || []).includes(option.value)}
                    onCheckedChange={() => toggleFlatValue(section.fieldKey, option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors[section.fieldKey] && <p className="text-red-600 text-sm">{errors[section.fieldKey]}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
