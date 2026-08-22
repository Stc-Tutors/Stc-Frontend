"use client";
import { useState, useEffect } from "react";
import { useEnrollment, type Schedule, type ExamPreparationDetails, type SubjectPerformance, type ClassFormat } from "@/contexts/enrollment-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import CurriculumDrilldown, { CurriculumPath } from "@/components/curriculum-drilldown";
import RecommendedVideoCourses from "@/components/recommended-video-courses";
import { CurriculumNode, CurriculumServiceType } from "@/types/curriculum";
import { ArchitecturalPath, ClassGroupStatus, IClassGroup, ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { GetCurriculumChildrenAction } from "@/server/curriculum";
import { GetClassGroupsAction } from "@/server/class-group";
import { GetCoursesAction } from "@/server/course";
import { Course } from "@/types/course";
import { OneOnOneDatePicker } from "@/components/ui/one-on-one-date-picker";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { Input } from "@/components/ui/input";
import { findScheduleOverlap } from "@/lib/schedule-overlap";

const EXAM_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface StepProps {
  onNext: (errors: Record<string, string>) => void;
  errors: Record<string, string>;
  forcedUserType?: "parent" | "student";
}

import { WEEKDAYS } from "@/constants/weekdays";
const daysOfWeek: readonly string[] = WEEKDAYS;

const timeOptions = [
  "8:00am", "9:00am", "10:00am", "11:00am", "12:00pm",
  "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm",
];

const durationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hr 30 mins" },
  { value: 120, label: "2 hours" },
];

const STAGE = "student-registration:subjects-schedule" as const;

export default function SubjectsSchedule({ onNext, errors }: StepProps) {
  const { enrollmentData, updateServiceDetails, updateSchedule, calculateCost, getUnpricedSubjects, setTotalCost, updateCustomFieldResponse } = useEnrollment();
  const [totalCost, setLocalTotalCost] = useState(enrollmentData.totalCost || 0);

  const selectedService = enrollmentData.selectedService;
  const architecturalPath = selectedService?.architecturalPath;
  const flowReq = selectedService?.flowRequirements ?? {};
  const serviceType = enrollmentData.serviceDetails?.serviceType;

  // Task 3 - which drill-down/picker renders is driven entirely by the
  // selected service's architecturalPath, not a hardcoded serviceType check.
  const isPathA = architecturalPath === ArchitecturalPath.ACADEMIC_TUTORING_TAXONOMY;
  const isPathB = architecturalPath === ArchitecturalPath.EXAM_PREP_TAXONOMY;
  const isPathC = architecturalPath === ArchitecturalPath.COURSE_MODULE;
  const isCohortBased = !!flowReq.requires_cohort;

  const [serviceData, setServiceData] = useState({
    ageLevel: enrollmentData.serviceDetails?.ageLevel || "",
    selectedSubjects: enrollmentData.serviceDetails?.selectedSubjects || [],
    learningGoals: enrollmentData.serviceDetails?.learningGoals || "",
    specialNeeds: enrollmentData.serviceDetails?.specialNeeds || "",
    tutorGender: enrollmentData.serviceDetails?.tutorGender || "",
    curriculum: enrollmentData.serviceDetails?.curriculum || "",
    country: enrollmentData.serviceDetails?.country || "",
    gradeLevel: enrollmentData.serviceDetails?.gradeLevel || "",
    classYear: enrollmentData.serviceDetails?.classYear || "",
    examCategory: enrollmentData.serviceDetails?.examCategory || "",
    courseId: enrollmentData.serviceDetails?.courseId || "",
    language: enrollmentData.serviceDetails?.language || "",
    classFormat: enrollmentData.serviceDetails?.classFormat,
    startDate: enrollmentData.serviceDetails?.startDate || "",
    classGroupId: enrollmentData.serviceDetails?.classGroupId || "",
    examPreparationDetails: enrollmentData.serviceDetails?.examPreparationDetails || ({} as ExamPreparationDetails),
    // How many weeks of tuition to pay for up front - only meaningful for
    // hourly-rate subjects (a flat-rate subject's price is unaffected by
    // this). Defaults to the historical fixed 4-week month.
    billingWeeks: enrollmentData.serviceDetails?.billingWeeks || 4,
  });

  // The Exam-position CurriculumNode itself (fullName/description/grades/
  // requiredSubjects/courseCombinations) - only meaningful for Path B,
  // resolved from the drill-down's path so this step can surface exam
  // metadata without a separate fetch.
  const [examNode, setExamNode] = useState<CurriculumNode | undefined>();

  const [schedule, setSchedule] = useState<Schedule[]>(enrollmentData.schedule || []);

  // Path A/B: subjects resolved by the Country -> Curriculum/Education Level
  // -> Grade/Exam -> Class/Category -> Subject drill-down (CurriculumDrilldown,
  // backed by GET /public/curriculum-nodes).
  const [resolvedSubjects, setResolvedSubjects] = useState<CurriculumNode[]>([]);

  // Drop any previously-checked subject that's no longer in the resolved
  // list (e.g. the user picked a different grade level/class).
  useEffect(() => {
    if (!(isPathA || isPathB) || resolvedSubjects.length === 0) return;
    const validNames = new Set(resolvedSubjects.map((s) => s.name));
    setServiceData((prev) => {
      const filtered = prev.selectedSubjects.filter((s) => validNames.has(s));
      return filtered.length === prev.selectedSubjects.length ? prev : { ...prev, selectedSubjects: filtered };
    });
  }, [resolvedSubjects, isPathA, isPathB]);

  // For Path A the price-differentiating tier is the Curriculum node; for
  // Path B it's the Exam node (WAEC vs JAMB pricing differs more than
  // "Senior Secondary" vs itself) - see enrollment-context.tsx's
  // calculateCost, which matches ServicePricing rows by this same
  // `curriculum` field, kept populated for Path B (from the Exam name) purely
  // for pricing-lookup parity even though the DTO's canonical Path B fields
  // are examPreparationDetails.{educationLevel,exam}/examCategory.
  const handleCurriculumPath = (path: CurriculumPath) => {
    setServiceData((prev) => {
      if (isPathB) {
        return {
          ...prev,
          country: path.country?.name ?? "",
          curriculum: path.level?.name ?? "",
          examCategory: path.klass?.name ?? "",
          examPreparationDetails: {
            ...prev.examPreparationDetails,
            educationLevel: path.curriculum?.name,
            exam: path.level?.name,
            // Reset once the exam changes, since the available grades/course
            // combinations belong to the newly selected exam.
            currentGrade: path.level?.id === examNode?.id ? prev.examPreparationDetails.currentGrade : undefined,
            courseCombination: path.level?.id === examNode?.id ? prev.examPreparationDetails.courseCombination : undefined,
          },
        };
      }
      return {
        ...prev,
        country: path.country?.name ?? "",
        curriculum: path.curriculum?.name ?? "",
        gradeLevel: path.level?.name ?? "",
        classYear: path.klass?.name ?? "",
      };
    });
    if (isPathB) setExamNode(path.level);
  };

  // --- Path C (Course Module) ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  // Age Range is now a real (if shallow) branch of the curriculum tree - a
  // service with requires_age_range has taxonomyStages = [{type: AGE_RANGE}],
  // so its root nodes (parent=null) ARE the age brackets. A Course attaches
  // to one specific node via taxonomyNodeId - the id (not the display name)
  // is what filters courses below; selectedAgeRangeNodeId is purely local UI
  // state for that filter, never submitted itself (the chosen Course.id is
  // what actually gets submitted).
  const [ageRangeNodes, setAgeRangeNodes] = useState<CurriculumNode[]>([]);
  const [selectedAgeRangeNodeId, setSelectedAgeRangeNodeId] = useState("");
  const [languageOptions, setLanguageOptions] = useState<ITaxonomyOption[]>([]);
  const [classGroups, setClassGroups] = useState<IClassGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (!isPathC || !serviceType) return;
    setIsLoadingCourses(true);
    GetCoursesAction({ serviceType }).then(([res]) => {
      setCourses(res?.data ?? []);
      setIsLoadingCourses(false);
    });
  }, [isPathC, serviceType]);

  useEffect(() => {
    if (!isPathC || !flowReq.requires_age_range || !serviceType) return;
    GetCurriculumChildrenAction(null, serviceType).then(([res]) => setAgeRangeNodes(res?.data ?? []));
  }, [isPathC, flowReq.requires_age_range, serviceType]);

  useEffect(() => {
    if (!isPathC || !flowReq.requires_language_selection) return;
    GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE).then(([res]) => setLanguageOptions(res?.data ?? []));
  }, [isPathC, flowReq.requires_language_selection]);

  const filteredCourses = isPathC
    ? courses.filter((c) => {
        if (flowReq.requires_age_range && selectedAgeRangeNodeId && c.taxonomyNodeId !== selectedAgeRangeNodeId) return false;
        return true;
      })
    : [];

  const selectedCourse = courses.find((c) => c.id === serviceData.courseId);

  const handleSelectCourse = (course: Course) => {
    const courseSchedule: Schedule[] = (course.schedule ?? []).map((slot) => ({
      subject: course.title,
      days: slot.days,
      time: slot.time,
      duration: slot.duration,
    }));
    setServiceData((prev) => ({ ...prev, courseId: course.id, selectedSubjects: [course.title], classGroupId: "" }));
    setSchedule(courseSchedule.length > 0 ? courseSchedule : [{ subject: course.title, days: [], time: "8:00am", duration: 60 }]);
  };

  // Task 3 - once a course + (optionally) age range are chosen for a cohort
  // service, fetch the open ClassGroups the student can join directly.
  useEffect(() => {
    if (!isPathC || !isCohortBased || !serviceData.courseId || !serviceType) {
      setClassGroups([]);
      return;
    }
    setIsLoadingGroups(true);
    GetClassGroupsAction({ serviceType, course: serviceData.courseId, ageRange: serviceData.ageLevel || undefined }).then(([res]) => {
      setClassGroups(res?.data ?? []);
      setIsLoadingGroups(false);
    });
  }, [isPathC, isCohortBased, serviceData.courseId, serviceData.ageLevel, serviceType]);

  const isPathBExam = isPathB;

  // Auto-update schedule entries when the selected subjects change (Path
  // A/B only - Path C's schedule comes straight from the chosen course, see
  // handleSelectCourse).
  useEffect(() => {
    if (isPathC) return;
    setSchedule((prev) => {
      const updated = serviceData.selectedSubjects.map((subject) => {
        const existing = prev.find((s) => s.subject === subject);
        return (
          existing || {
            subject,
            days: [],
            time: "8:00am",
            duration: 60,
          }
        );
      });

      return updated;
    });
  }, [serviceData.selectedSubjects, isPathC]);

  useEffect(() => {
    updateSchedule(schedule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  // Computed from the local `schedule`/`serviceData` state directly (not
  // enrollmentData from context) since that context update above hasn't
  // committed by the time this effect runs in the same pass.
  useEffect(() => {
    const computedCost = isPathC ? selectedCourse?.price ?? 0 : calculateCost(schedule, serviceData);

    setLocalTotalCost(computedCost);
    setTotalCost(computedCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    schedule,
    serviceData.selectedSubjects,
    serviceData.curriculum,
    serviceData.country,
    serviceData.gradeLevel,
    serviceData.billingWeeks,
    isPathC,
    selectedCourse,
  ]);

  const { fields: customFields } = useCustomFormFields(STAGE, serviceType);
  const customFieldResponses = enrollmentData.customFieldResponses ?? {};

  useEffect(() => {
    const validate = () => {
      const stepErrors: Record<string, string> = {};

      if (serviceData.selectedSubjects.length === 0) {
        stepErrors.subjects = isPathC ? "Please select a course" : "Please select at least one subject";
      }
      if (!serviceData.tutorGender) stepErrors.tutorGender = "Please select preferred tutor gender";

      if (isPathC && flowReq.requires_age_range && !serviceData.ageLevel) {
        stepErrors.ageLevel = "Please select an age range";
      }
      if (isPathC && flowReq.requires_language_selection && !serviceData.language) {
        stepErrors.language = "Please select a language";
      }
      if (isPathC && isCohortBased && !serviceData.classGroupId) {
        stepErrors.classGroupId = "Please select a class group to join";
      }

      if (!isPathC && !schedule.some((s) => s.days.length > 0)) {
        stepErrors.schedule = "Please select at least one day for at least one subject";
      }
      if (isPathC && serviceData.selectedSubjects.length > 0 && schedule.length === 0) {
        stepErrors.schedule = "The selected course has no schedule configured - please choose another course.";
      }

      // Two subjects can't be scheduled at overlapping times - a student
      // can't attend both. Only checked once every subject has at least one
      // day picked (the check above already covers that case).
      if (!isPathC && !stepErrors.schedule) {
        const overlap = findScheduleOverlap(schedule);
        if (overlap) {
          stepErrors.schedule = `${overlap.subjectA} and ${overlap.subjectB} overlap on ${overlap.day} - please choose different times`;
        }
      }

      if (!isPathC && serviceData.selectedSubjects.length > 0) {
        const unpriced = getUnpricedSubjects(schedule, serviceData);
        if (unpriced.length > 0) {
          stepErrors.subjects = `No pricing has been set up yet for: ${unpriced.join(", ")} - please contact us or choose different subjects.`;
        }
      }

      if (!isCohortBased) {
        if (!serviceData.classFormat) {
          stepErrors.classFormat = "Please select One-on-One or Group Class";
        } else if (serviceData.classFormat === "one-on-one") {
          if (!serviceData.startDate) {
            stepErrors.startDate = "Please select a start date";
          } else if (new Date(serviceData.startDate).getTime() < Date.now() + 24 * 60 * 60 * 1000) {
            stepErrors.startDate = "Start date must be at least 24 hours from now";
          }
        }
      }

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id];
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`;
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        // Same order/index as selectedSubjects - lets the backend price by
        // the exact node instead of only the legacy named fields, for
        // services whose Flow Tree doesn't map cleanly onto those (see
        // ServiceDetails.selectedSubjectNodeIds).
        const selectedSubjectNodeIds = resolvedSubjects
          .filter((n) => serviceData.selectedSubjects.includes(n.name))
          .map((n) => n.id);
        updateServiceDetails({ ...serviceData, selectedSubjectNodeIds });
        updateSchedule(schedule);
        setTotalCost(isPathC ? selectedCourse?.price ?? 0 : calculateCost(schedule, serviceData));
      }

      onNext(stepErrors);
    };

    window.addEventListener("validateStep", validate);
    return () => window.removeEventListener("validateStep", validate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceData, schedule, isPathC, isCohortBased, customFields, customFieldResponses, selectedCourse]);

  const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
    setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const availableSubjects = resolvedSubjects.map((s) => s.name);

  return (
    <div className="space-y-6">
      {/* Subject / Course Selection */}
      <Card>
        <CardHeader><CardTitle>{isPathC ? "Select a Course" : "Select Subjects"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isPathC && flowReq.requires_age_range && (
            <div className="space-y-2">
              <Label>Age Range *</Label>
              <Select
                value={selectedAgeRangeNodeId}
                onValueChange={(nodeId) => {
                  const node = ageRangeNodes.find((n) => n.id === nodeId);
                  setSelectedAgeRangeNodeId(nodeId);
                  setServiceData((prev) => ({ ...prev, ageLevel: node?.name ?? "", courseId: "", selectedSubjects: [], classGroupId: "" }));
                }}
              >
                <SelectTrigger className={errors.ageLevel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  {ageRangeNodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ageLevel && <p className="text-red-600 text-sm">{errors.ageLevel}</p>}
            </div>
          )}

          {isPathC && (
            <div className="space-y-2">
              <Label>Course *</Label>
              {isLoadingCourses && <p className="text-sm text-gray-500">Loading courses...</p>}
              {!isLoadingCourses && filteredCourses.length === 0 && (
                <p className="text-sm text-gray-500">
                  No courses available yet{serviceData.ageLevel ? " for this age range" : ""}.
                </p>
              )}
              <div className="grid gap-3">
                {filteredCourses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-start justify-between border rounded-lg p-3 cursor-pointer ${
                      serviceData.courseId === course.id ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="course"
                        className="mt-1"
                        checked={serviceData.courseId === course.id}
                        onChange={() => handleSelectCourse(course)}
                      />
                      <div>
                        <p className="font-medium">{course.title}</p>
                        {course.subtitle && <p className="text-sm text-gray-600">{course.subtitle}</p>}
                      </div>
                    </div>
                    <p className="font-semibold text-green-700 whitespace-nowrap">
                      {course.currency ?? "NGN"} {course.price?.toLocaleString()}
                    </p>
                  </label>
                ))}
              </div>
              {errors.subjects && <p className="text-red-600 text-sm">{errors.subjects}</p>}
            </div>
          )}

          {isPathC && flowReq.requires_language_selection && (
            <div className="space-y-2">
              <Label>Language *</Label>
              <Select value={serviceData.language} onValueChange={(value) => setServiceData((prev) => ({ ...prev, language: value }))}>
                <SelectTrigger className={errors.language ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((l) => (
                    <SelectItem key={l.id} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.language && <p className="text-red-600 text-sm">{errors.language}</p>}
            </div>
          )}

          {(isPathA || isPathB) && serviceType && (
            <div className="space-y-2">
              <Label>Find subjects for your {isPathBExam ? "exam" : "curriculum"}</Label>
              <CurriculumDrilldown
                serviceType={serviceType as CurriculumServiceType}
                onSubjectsResolved={setResolvedSubjects}
                onPathChange={handleCurriculumPath}
              />
            </div>
          )}

          {(isPathA || isPathB) && (
            <div className="space-y-2">
              <Label>Available Subjects *</Label>
              {availableSubjects.length === 0 && (
                <p className="text-xs text-gray-500">Complete the selections above to see available subjects.</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((subject) => (
                  <label key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      className="h-5 w-5"
                      checked={serviceData.selectedSubjects.includes(subject)}
                      onCheckedChange={(checked) =>
                        setServiceData((prev) => ({
                          ...prev,
                          selectedSubjects: checked
                            ? [...prev.selectedSubjects, subject]
                            : prev.selectedSubjects.filter((s) => s !== subject),
                        }))
                      }
                    />
                    <Label htmlFor={subject} className="text-sm">{subject}</Label>
                  </label>
                ))}
              </div>
              {errors.subjects && <p className="text-red-600 text-sm">{errors.subjects}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="learningGoals">Learning Goals</Label>
            <Textarea
              id="learningGoals"
              value={serviceData.learningGoals}
              onChange={(e) => setServiceData((prev) => ({ ...prev, learningGoals: e.target.value }))}
              placeholder="Describe what you hope your child will achieve..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeeds">Anything Your Tutor Should Know? (optional)</Label>
            <Textarea
              id="specialNeeds"
              value={serviceData.specialNeeds}
              onChange={(e) => setServiceData((prev) => ({ ...prev, specialNeeds: e.target.value }))}
              placeholder="Learning differences, accommodations, or anything else that helps your tutor teach effectively..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Tutor Gender *</Label>
            <Select
              value={serviceData.tutorGender}
              onValueChange={(value) => setServiceData((prev) => ({ ...prev, tutorGender: value }))}
            >
              <SelectTrigger className={errors.tutorGender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="No preference">No preference</SelectItem>
              </SelectContent>
            </Select>
            {errors.tutorGender && <p className="text-red-600 text-sm">{errors.tutorGender}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Optional cross-sell - only renders if an admin actually attached a
          standalone Video Course to one of the selected Subject nodes (see
          stcbe's IVideoCourse). Never a requirement to proceed. */}
      {(isPathA || isPathB) && (
        <RecommendedVideoCourses
          subjectNodeIds={resolvedSubjects
            .filter((n) => serviceData.selectedSubjects.includes(n.name))
            .map((n) => n.id)}
        />
      )}

      {/* Exam Preparation Details - all optional. Enough to route/price the
          enrollment already came from subject selection above; this is
          richer context (current performance, difficulty areas, logistics)
          a student can fill in now or complete later, not a checkout
          blocker. */}
      {isPathB && (
        <Card>
          <CardHeader><CardTitle>Exam Details (optional)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {examNode && (examNode.fullName || examNode.description || (examNode.requiredSubjects?.length ?? 0) > 0) && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
                {examNode.fullName && <p className="font-medium">{examNode.fullName}</p>}
                {examNode.description && <p className="text-gray-600">{examNode.description}</p>}
                {examNode.requiredSubjects && examNode.requiredSubjects.length > 0 && (
                  <p className="text-gray-600">Required subjects: {examNode.requiredSubjects.join(", ")}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examNode?.grades && examNode.grades.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Grade/Class</Label>
                  <Select
                    value={serviceData.examPreparationDetails.currentGrade ?? ""}
                    onValueChange={(value) =>
                      setServiceData((prev) => ({
                        ...prev,
                        examPreparationDetails: { ...prev.examPreparationDetails, currentGrade: value },
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Select current grade" /></SelectTrigger>
                    <SelectContent>
                      {examNode.grades.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {examNode?.courseCombinations && examNode.courseCombinations.length > 0 && (
                <div className="space-y-2">
                  <Label>Course Combination</Label>
                  <Select
                    value={serviceData.examPreparationDetails.courseCombination ?? ""}
                    onValueChange={(value) =>
                      setServiceData((prev) => ({
                        ...prev,
                        examPreparationDetails: { ...prev.examPreparationDetails, courseCombination: value },
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Select course combination" /></SelectTrigger>
                    <SelectContent>
                      {examNode.courseCombinations.map((c) => (
                        <SelectItem key={c.course} value={c.course}>{c.course} ({c.subjects.join(", ")})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="examYear">Exam Year</Label>
                <input
                  id="examYear"
                  type="number"
                  min={new Date().getFullYear()}
                  value={serviceData.examPreparationDetails.examYear ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: {
                        ...prev.examPreparationDetails,
                        examYear: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Exam Month</Label>
                <Select
                  value={serviceData.examPreparationDetails.examMonth ?? ""}
                  onValueChange={(value) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: { ...prev.examPreparationDetails, examMonth: value },
                    }))
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select exam month" /></SelectTrigger>
                  <SelectContent>
                    {EXAM_MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <input
                  id="schoolName"
                  value={serviceData.examPreparationDetails.schoolName ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: { ...prev.examPreparationDetails, schoolName: e.target.value },
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetGrade">Target Grade</Label>
                <input
                  id="targetGrade"
                  value={serviceData.examPreparationDetails.targetGrade ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: { ...prev.examPreparationDetails, targetGrade: e.target.value },
                    }))
                  }
                  placeholder="e.g. A1 / Distinction"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousAttempts">Previous Exam Attempts</Label>
                <input
                  id="previousAttempts"
                  type="number"
                  min={0}
                  value={serviceData.examPreparationDetails.previousAttempts ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: {
                        ...prev.examPreparationDetails,
                        previousAttempts: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Learning Mode</Label>
                <Select
                  value={serviceData.examPreparationDetails.preferredLearningMode ?? ""}
                  onValueChange={(value) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: {
                        ...prev.examPreparationDetails,
                        preferredLearningMode: value as ExamPreparationDetails["preferredLearningMode"],
                      },
                    }))
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select learning mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live-online">Live Online</SelectItem>
                    <SelectItem value="recorded">Recorded Lessons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyHours">Weekly Hours</Label>
                <input
                  id="weeklyHours"
                  type="number"
                  min={0}
                  value={serviceData.examPreparationDetails.weeklyHours ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: {
                        ...prev.examPreparationDetails,
                        weeklyHours: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <input
                  id="emergencyContactName"
                  value={serviceData.examPreparationDetails.emergencyContactName ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: { ...prev.examPreparationDetails, emergencyContactName: e.target.value },
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <input
                  id="emergencyContactPhone"
                  value={serviceData.examPreparationDetails.emergencyContactPhone ?? ""}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      examPreparationDetails: { ...prev.examPreparationDetails, emergencyContactPhone: e.target.value },
                    }))
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>
            </div>

            {serviceData.selectedSubjects.length > 0 && (
              <div className="space-y-2">
                <Label>Current / Target Score Per Subject</Label>
                <div className="space-y-2">
                  {serviceData.selectedSubjects.map((subject) => {
                    const perf: SubjectPerformance = serviceData.examPreparationDetails.subjectPerformance?.find(
                      (p) => p.subject === subject
                    ) ?? { subject };
                    const updatePerf = (field: "currentScore" | "targetScore", value: string) => {
                      setServiceData((prev) => {
                        const existing = prev.examPreparationDetails.subjectPerformance ?? [];
                        const next = existing.some((p) => p.subject === subject)
                          ? existing.map((p) => (p.subject === subject ? { ...p, [field]: value } : p))
                          : [...existing, { subject, [field]: value }];
                        return { ...prev, examPreparationDetails: { ...prev.examPreparationDetails, subjectPerformance: next } };
                      });
                    };
                    return (
                      <div key={subject} className="grid grid-cols-3 gap-2 items-center text-sm">
                        <span>{subject}</span>
                        <input
                          placeholder="Current score"
                          value={perf.currentScore ?? ""}
                          onChange={(e) => updatePerf("currentScore", e.target.value)}
                          className="border rounded-md px-2 py-1 text-sm"
                        />
                        <input
                          placeholder="Target score"
                          value={perf.targetScore ?? ""}
                          onChange={(e) => updatePerf("targetScore", e.target.value)}
                          className="border rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="topicsOfDifficulty">Topics Student Finds Difficult</Label>
              <Textarea
                id="topicsOfDifficulty"
                value={serviceData.examPreparationDetails.topicsOfDifficulty ?? ""}
                onChange={(e) =>
                  setServiceData((prev) => ({
                    ...prev,
                    examPreparationDetails: { ...prev.examPreparationDetails, topicsOfDifficulty: e.target.value },
                  }))
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialLearningNeeds">Special Learning Needs</Label>
              <Textarea
                id="specialLearningNeeds"
                value={serviceData.examPreparationDetails.specialLearningNeeds ?? ""}
                onChange={(e) =>
                  setServiceData((prev) => ({
                    ...prev,
                    examPreparationDetails: { ...prev.examPreparationDetails, specialLearningNeeds: e.target.value },
                  }))
                }
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task 3/5 - cohort-based Path C services skip the one-on-one/group
          question entirely: the student picks a specific open ClassGroup
          instead. */}
      {isPathC && isCohortBased && serviceData.courseId && (
        <Card>
          <CardHeader><CardTitle>Choose a Class Group</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoadingGroups && <p className="text-sm text-gray-500">Loading available class groups...</p>}
            {!isLoadingGroups && classGroups.length === 0 && (
              <p className="text-sm text-gray-500">No open class groups yet for this course - check back soon.</p>
            )}
            {classGroups.map((group) => {
              const seatsLeft = Math.max(group.capacity - group.confirmedCount, 0);
              return (
                <label
                  key={group.id}
                  className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer ${
                    serviceData.classGroupId === group.id ? "border-blue-500 bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="classGroup"
                      checked={serviceData.classGroupId === group.id}
                      onChange={() => setServiceData((prev) => ({ ...prev, classGroupId: group.id }))}
                    />
                    <div>
                      <p className="font-medium">{group.label}</p>
                      <p className="text-xs text-gray-500">
                        {group.startDate ? `Starts ${new Date(group.startDate).toLocaleDateString()}` : "Start date to be confirmed"}
                        {" · "}
                        {group.status === ClassGroupStatus.FULL ? "Full - you'll join the waitlist" : `${seatsLeft} seat(s) left`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.status}</Badge>
                </label>
              );
            })}
            {errors.classGroupId && <p className="text-red-600 text-sm">{errors.classGroupId}</p>}
          </CardContent>
        </Card>
      )}

      {/* Task 5 - One-on-One vs Group Class, whenever this service isn't
          cohort-based. */}
      {!isCohortBased && serviceData.selectedSubjects.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Class Format</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>One-on-One or Group Class? *</Label>
              <Select
                value={serviceData.classFormat ?? ""}
                onValueChange={(value) =>
                  setServiceData((prev) => ({
                    ...prev,
                    classFormat: value as ClassFormat,
                    startDate: value === "group" ? "" : prev.startDate,
                  }))
                }
              >
                <SelectTrigger className={errors.classFormat ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select class format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-on-one">One-on-One</SelectItem>
                  <SelectItem value="group">Group Class</SelectItem>
                </SelectContent>
              </Select>
              {errors.classFormat && <p className="text-red-600 text-sm">{errors.classFormat}</p>}
            </div>

            {serviceData.classFormat === "one-on-one" && (
              <div className="space-y-2">
                <Label>Preferred Start Date *</Label>
                <OneOnOneDatePicker
                  value={serviceData.startDate}
                  onChange={(iso) => setServiceData((prev) => ({ ...prev, startDate: iso }))}
                  error={!!errors.startDate}
                />
                {errors.startDate && <p className="text-red-600 text-sm">{errors.startDate}</p>}
              </div>
            )}

            {serviceData.classFormat === "group" && (
              <p className="text-sm text-gray-600">
                You'll be placed in the next available group class for this subject - we'll confirm your schedule
                after enrollment (you may be waitlisted if the group is full).
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Section */}
      {serviceData.selectedSubjects.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
          <CardContent>
            {isPathC ? (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold mb-2">{selectedCourse?.title} Schedule</h4>
                {schedule.length > 0 ? (
                  <div className="space-y-2">
                    {schedule.map((slot, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        {slot.days.length > 0 ? slot.days.join(", ") : "Days to be confirmed"} at {slot.time} ({slot.duration} minutes)
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Schedule to be confirmed by your tutor after enrollment.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-semibold mb-3">{item.subject}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Days *</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {daysOfWeek.map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${index}-${day}`}
                                checked={item.days.includes(day)}
                                onCheckedChange={() => {
                                  const newDays = item.days.includes(day)
                                    ? item.days.filter((d) => d !== day)
                                    : [...item.days, day];
                                  handleScheduleChange(index, "days", newDays);
                                }}
                              />
                              <Label htmlFor={`${index}-${day}`} className="text-xs">
                                {day.slice(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Time</Label>
                        <Select
                          value={item.time}
                          onValueChange={(value) => handleScheduleChange(index, "time", value)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Duration</Label>
                        <Select
                          value={item.duration.toString()}
                          onValueChange={(value) => handleScheduleChange(index, "duration", Number(value))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {durationOptions.map((d) => (
                              <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
                {errors.schedule && <p className="text-red-600 text-sm">{errors.schedule}</p>}
              </div>
            )}

            {/* Task - lets a parent pay for more/fewer than the historical
                fixed 4-week month; only moves the needle for hourly-rate
                subjects (a flat-rate subject's price is fixed regardless -
                see EnrollmentContext.calculateCost). */}
            {!isPathC && serviceData.selectedSubjects.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="billingWeeks">Number of weeks to pay for</Label>
                <Input
                  id="billingWeeks"
                  type="number"
                  min={1}
                  max={52}
                  className="w-32"
                  value={serviceData.billingWeeks}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setServiceData((prev) => ({ ...prev, billingWeeks: value > 0 ? value : 1 }));
                  }}
                />
              </div>
            )}

            {/* Cost Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Cost Summary</h4>
              <p className="text-2xl font-bold text-green-600">
                ₦{totalCost.toLocaleString()}
                {isPathC ? "" : ` / ${serviceData.billingWeeks} week${serviceData.billingWeeks === 1 ? "" : "s"}`}
              </p>
              <p className="text-sm text-gray-600">
                {isPathC ? "Course price" : "Based on selected subjects, schedule, and weeks selected above"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {customFields.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {customFields.map((field) => (
              <DynamicQuestionField
                key={field.id}
                field={field}
                value={customFieldResponses[field.id]}
                onChange={(value) => updateCustomFieldResponse(field.id, value)}
                error={errors[`custom_${field.id}`]}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
