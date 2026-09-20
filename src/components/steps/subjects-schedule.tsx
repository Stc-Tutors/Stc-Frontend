"use client";
import { useState, useEffect } from "react";
import { useEnrollment, type Schedule, type ExamPreparationDetails, type SubjectPerformance, type ClassFormat, type ServiceDetails } from "@/contexts/enrollment-context";
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
import { ArchitecturalPath, ClassGroupStatus, IClassGroup, IService, ITaxonomyOption, SelectionMode, TaxonomyOptionKind } from "@/types/service-catalog";
import { GetServicesAction } from "@/server/service-catalog";
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
import { scheduleTimeFrom24Hour, scheduleTimeTo24Hour } from "@/lib/datetime";

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


const durationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hr 30 mins" },
  { value: 120, label: "2 hours" },
];

const STAGE = "student-registration:subjects-schedule" as const;

export default function SubjectsSchedule({ onNext, errors }: StepProps) {
  const { enrollmentData, updateServiceDetails, updateSchedule, calculateCost, getUnpricedSubjects, getHourlyPricedSubjects, setTotalCost, updateCustomFieldResponse, setEnrollmentData } = useEnrollment();
  const [totalCost, setLocalTotalCost] = useState(enrollmentData.totalCost || 0);

  const selectedService = enrollmentData.selectedService;
  const architecturalPath = selectedService?.architecturalPath;
  const flowReq = selectedService?.flowRequirements ?? {};
  const serviceType = enrollmentData.serviceDetails?.serviceType;

  // Task 3 - which drill-down/picker renders is driven entirely by the
  // selected service's architecturalPath, not a hardcoded serviceType check.
  const isPathA = architecturalPath === ArchitecturalPath.ACADEMIC_TUTORING_TAXONOMY;
  const isPathB = architecturalPath === ArchitecturalPath.EXAM_PREP_TAXONOMY;
  const isPathCService = architecturalPath === ArchitecturalPath.COURSE_MODULE;
  const isCohortBased = !!flowReq.requires_cohort;
  // Set per service in the admin Service Catalog ("How many can a student
  // pick?") - Exam Preparation lets a student take several subjects, Tech for
  // Kids exactly one course. The API always sends the effective value; the
  // fallback only covers a response from before this field existed. The one
  // forced case is a cohort service: it joins a single class group (which
  // belongs to one course), so it's single whatever the setting says.
  const isSingleSelection =
    (isPathCService && isCohortBased) ||
    (selectedService?.selectionMode ?? (isPathCService ? SelectionMode.SINGLE : SelectionMode.MULTIPLE)) === SelectionMode.SINGLE;
  // Course-based service where the family may take several courses.
  const isMultiCourse = isPathCService && !isSingleSelection;

  // Lets the family switch service without going back to step 1 - see
  // handleChangeService below.
  const [availableServices, setAvailableServices] = useState<IService[]>([]);
  useEffect(() => {
    GetServicesAction().then(([res]) => setAvailableServices(res?.data ?? []));
  }, []);

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
    // Enrollments saved before multi-course existed only have courseId.
    courseIds:
      enrollmentData.serviceDetails?.courseIds ??
      (enrollmentData.serviceDetails?.courseId ? [enrollmentData.serviceDetails.courseId] : ([] as string[])),
    language: enrollmentData.serviceDetails?.language || "",
    classFormat: enrollmentData.serviceDetails?.classFormat,
    startDate: enrollmentData.serviceDetails?.startDate || "",
    flexibleSchedule: enrollmentData.serviceDetails?.flexibleSchedule || false,
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
  // True only once the course list for the CURRENT pick has actually loaded -
  // "no courses" is only a real answer after that, not while a fetch is still
  // in flight for a pick the student has just made.
  const [coursesResolved, setCoursesResolved] = useState(false);
  // Tick-list items (last stage, when several may be taken) chosen as plain
  // tree picks because no Course is attached to them - see nodePicks below.
  const [nodePickIds, setNodePickIds] = useState<string[]>([]);
  // A Course-Module service's own taxonomyStages (Service Catalog > Flow Tree)
  // drive a cascade of dropdowns here, one per stage - e.g. Tech for Kids'
  // [Age Range] or a deeper [Age Range, Track]. Each stage's options are the
  // children (GET /public/curriculum-nodes?parent=<previous pick>) of the
  // node picked one stage up; the first stage's options are the tree's roots.
  // A Course attaches to one node via taxonomyNodeId - the ids picked here
  // filter the course list server-side (which also matches courses filed
  // under any deeper node beneath the pick), and are purely local UI state,
  // never submitted themselves (the chosen Course.id is what gets submitted).
  const stages = [...(selectedService?.taxonomyStages ?? [])].sort((a, b) => a.order - b.order);
  // When several courses may be taken, the tree's last stage is the tick-list
  // the student picks from (each item resolving to its course). The exception
  // is a tree that is only the age range: that stage is a filter which sets the
  // student's age level, so it stays a dropdown and the courses under it are
  // listed as ticks beneath.
  const lastStageIsPick = isMultiCourse && stages.length > 0 && !(stages.length === 1 && flowReq.requires_age_range);
  const [stageOptions, setStageOptions] = useState<CurriculumNode[][]>([]);
  const [stageSelections, setStageSelections] = useState<string[]>([]);
  const deepestSelectedNodeId = [...stageSelections].reverse().find(Boolean) ?? "";
  const [languageOptions, setLanguageOptions] = useState<ITaxonomyOption[]>([]);
  const [classGroups, setClassGroups] = useState<IClassGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // First stage's options (the tree's roots) - and, when this step remounts
  // with an age range already chosen (Edit from Review, resumed draft),
  // restore that pick by name so the course list doesn't silently un-filter.
  useEffect(() => {
    if (!isPathCService || !serviceType || stages.length === 0) return;
    let cancelled = false;
    GetCurriculumChildrenAction(null, serviceType).then(([res]) => {
      if (cancelled) return;
      const roots = res?.data ?? [];
      setStageOptions([roots]);
      const restored = flowReq.requires_age_range ? roots.find((n) => n.name === serviceData.ageLevel) : undefined;
      if (restored) handleStageSelect(0, restored.id, roots, false);
    });
    return () => {
      cancelled = true;
    };
    // Only when the service changes - handleStageSelect/serviceData are
    // read once for the restore, not reactive inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPathCService, serviceType, stages.length]);

  const handleStageSelect = async (stageIndex: number, nodeId: string, options?: CurriculumNode[], reset = true) => {
    const node = (options ?? stageOptions[stageIndex] ?? []).find((n) => n.id === nodeId);
    setStageSelections((prev) => [...prev.slice(0, stageIndex), nodeId]);
    setStageOptions((prev) => prev.slice(0, stageIndex + 1));
    setServiceData((prev) => ({
      ...prev,
      // The first stage of a requires_age_range service IS the age range -
      // ageLevel is what pricing, class-group matching and validation key off.
      ...(stageIndex === 0 && flowReq.requires_age_range ? { ageLevel: node?.name ?? "" } : {}),
      // A different pick upstream invalidates any course already chosen.
      ...(reset ? { courseId: "", courseIds: [], selectedSubjects: [], classGroupId: "" } : {}),
    }));
    if (reset) setNodePickIds([]);
    if (stageIndex < stages.length - 1 && serviceType) {
      const [res] = await GetCurriculumChildrenAction(nodeId, serviceType);
      setStageOptions((prev) => [...prev.slice(0, stageIndex + 1), res?.data ?? []]);
    }
  };

  // Which node the course list is filtered by. Normally the deepest pick. When
  // several courses can be taken (isMultiCourse) the LAST stage becomes the
  // tick-list itself (see the render below), so its own options are what's
  // being chosen from - the courses to load are everything under the stage
  // BEFORE it. With a one-stage (or no) tree there's no earlier pick to wait
  // for: every course of the service is loaded.
  const coursesQueryNodeId = lastStageIsPick
    ? stages.length >= 2
      ? stageSelections[stages.length - 2] ?? ""
      : ""
    : deepestSelectedNodeId;
  const mustPickBeforeCourses = lastStageIsPick ? stages.length >= 2 : stages.length > 0;

  // Refetches whenever that node changes. A service with a tree lists
  // nothing until its stages are chosen - except on a remount that
  // already carries a chosen course, which loads the unfiltered list so that
  // course still resolves (see the restore effect above).
  useEffect(() => {
    if (!isPathCService || !serviceType) return;
    setCoursesResolved(false);
    if (mustPickBeforeCourses && !coursesQueryNodeId && !serviceData.courseId) {
      setCourses([]);
      return;
    }
    let cancelled = false;
    setIsLoadingCourses(true);
    GetCoursesAction({ serviceType, ...(coursesQueryNodeId ? { taxonomyNodeId: coursesQueryNodeId } : {}) }).then(([res]) => {
      if (cancelled) return;
      const list = res?.data ?? [];
      setCourses(list);
      setIsLoadingCourses(false);
      setCoursesResolved(true);
      // With exactly one option there's nothing to choose, so asking the
      // family to pick it again just reads as an extra step - take it. Never
      // overrides a course already picked (a resumed draft).
      if (list.length === 1 && !serviceData.courseId) handleSelectCourse(list[0]);
    });
    return () => {
      cancelled = true;
    };
    // serviceData.courseId is deliberately not a dependency - picking a
    // course must not refetch the list it was picked from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPathCService, serviceType, stages.length, coursesQueryNodeId, lastStageIsPick]);

  useEffect(() => {
    if (!isPathCService || !flowReq.requires_language_selection) return;
    GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE).then(([res]) => setLanguageOptions(res?.data ?? []));
  }, [isPathCService, flowReq.requires_language_selection]);

  // Already narrowed by the server (see the courses effect above).
  const filteredCourses = isPathCService ? courses : [];

  // A Course-Module service's tree is "finished" once every stage is picked, or
  // the pick has nothing deeper to choose (a shorter branch). Before that the
  // next stage's dropdown IS the next question; listing anything alongside it
  // was the extra "third flow" for a two-stage tree.
  const hasTree = stages.length > 0;
  const pickedStageCount = stageSelections.length;
  const nextStageOptions = stageOptions[pickedStageCount];
  const treeExhausted =
    !hasTree ||
    (deepestSelectedNodeId !== "" &&
      (pickedStageCount >= stages.length || (Array.isArray(nextStageOptions) && nextStageOptions.length === 0)));
  // One course under the finished tree: nothing to choose, so it's resolved
  // for the student and never shown as a step of its own.
  const courseDecidedByTree = isPathCService && hasTree && filteredCourses.length === 1;

  // --- Plain picks from the tree (no Course behind them) ---
  // A module of a Course Module service is just an item on the Flow Tree - the
  // same thing a subject is for Academic Tutoring/Exam Prep - so it can be
  // enrolled in directly: it becomes the enrollment's subject and is scheduled,
  // priced and provisioned exactly like one. A special Course attached to it is
  // an optional extra; when the pick has one, THAT is what's used (above), and
  // only a pick with none falls back to being a plain subject. That includes a
  // cohort service: its class group is then found by the item's name instead of
  // by a Course. A tree that is only the age range has no pick level (that
  // stage is a filter), so it still needs a Course.
  const treeHasPickLevel = hasTree && !(stages.length === 1 && flowReq.requires_age_range);
  const deepestIndex = stageSelections.length - 1;
  const deepestNode =
    deepestIndex >= 0 ? (stageOptions[deepestIndex] ?? []).find((n) => n.id === stageSelections[deepestIndex]) : undefined;
  const nodePicks: CurriculumNode[] =
    !isPathCService || !treeHasPickLevel
      ? []
      : lastStageIsPick
        ? (stageOptions[stages.length - 1] ?? []).filter((n) => nodePickIds.includes(n.id))
        : treeExhausted && coursesResolved && filteredCourses.length === 0 && deepestNode
          ? [deepestNode]
          : [];
  const nodeBacked = nodePicks.length > 0 && serviceData.courseIds.length === 0;
  // From here on, `isPathC` means "this enrollment is backed by a Course"
  // (schedule and price come from the course). A plain-pick enrollment takes
  // the same paths as the taxonomy services. Everything about the Course Module
  // SERVICE itself (its tree, language, cohort) uses isPathCService.
  const isPathC = isPathCService && !nodeBacked;

  // Same order as selectedSubjects - see the long note in the validate step.
  const subjectNodeIds = serviceData.selectedSubjects.map(
    (name) => (nodeBacked ? nodePicks : resolvedSubjects).find((n) => n.name === name)?.id ?? ""
  );
  // What pricing needs to know about each subject (its tree item), so a price
  // set against one specific item is found - see EnrollmentContext.priceRowFor.
  const pricingDetails = { ...serviceData, selectedSubjectNodeIds: subjectNodeIds };
  const pricingKey = subjectNodeIds.join(",");
  // Any hourly-only price among the picked subjects (see getHourlyPricedSubjects)
  // - only those make "weeks to pay for" and a weekly hours breakdown mean
  // anything; a flat price is one fixed charge.
  const hasHourlySubject = getHourlyPricedSubjects(serviceData.selectedSubjects, pricingDetails).length > 0;

  // While plain-picking, the picked items ARE the enrollment's subjects.
  const nodePickKey = nodePicks.map((n) => n.id).join(",");
  useEffect(() => {
    if (!isPathCService || !treeHasPickLevel) return;
    if (serviceData.courseIds.length > 0) return;
    const names = nodePicks.map((n) => n.name);
    setServiceData((prev) =>
      prev.selectedSubjects.length === names.length && prev.selectedSubjects.every((s, i) => s === names[i])
        ? prev
        : { ...prev, selectedSubjects: names, courseId: "", courseIds: [] }
    );
    // nodePicks is captured through nodePickKey; the rest are stable inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodePickKey, serviceData.courseIds.length, isPathCService, treeHasPickLevel]);

  const toggleNodePick = (node: CurriculumNode) =>
    setNodePickIds((prev) => (prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id]));

  const selectedCourse = courses.find((c) => c.id === serviceData.courseId);
  const chosenCourses = courses.filter((c) => serviceData.courseIds.includes(c.id));
  // A number (not the array) so the cost effects below can depend on it without
  // re-firing on every render.
  const chosenCoursesTotal = chosenCourses.reduce((sum, c) => sum + (c.price ?? 0), 0);

  // Sets the whole course selection at once: the enrollment's subjects are the
  // course titles, and its schedule is each course's own timetable back to
  // back (a course with none configured gets an empty row to fill in).
  const applyCourseSelection = (next: Course[]) => {
    setServiceData((prev) => ({
      ...prev,
      courseId: next[0]?.id ?? "",
      courseIds: next.map((c) => c.id),
      selectedSubjects: next.map((c) => c.title),
      classGroupId: "",
    }));
    setSchedule(
      next.flatMap((course) => {
        const slots: Schedule[] = (course.schedule ?? []).map((slot) => ({
          subject: course.title,
          days: slot.days,
          time: slot.time,
          duration: slot.duration,
        }));
        return slots.length > 0 ? slots : [{ subject: course.title, days: [], time: "8:00am", duration: 60 }];
      })
    );
  };

  const handleSelectCourse = (course: Course) => applyCourseSelection([course]);

  // Tick/untick one course when several may be taken.
  const toggleCourse = (course: Course) =>
    applyCourseSelection(
      serviceData.courseIds.includes(course.id)
        ? chosenCourses.filter((c) => c.id !== course.id)
        : [...chosenCourses, course]
    );

  // Switch to a different service from inside this step. Everything specific
  // to the old service (its subjects/course, curriculum path, schedule, price,
  // and the custom answers scoped to it) is dropped - none of it is valid for
  // the new one - while what isn't service-specific (tutor preference,
  // learning goals, notes) is kept. The wizard remounts this step on a
  // service change (see EnrollmentFlow), so its local state re-seeds from the
  // reset values below rather than holding the old service's picks.
  const handleChangeService = (slug: string) => {
    const next = availableServices.find((s) => s.slug === slug);
    if (!next || next.slug === serviceType) return;
    setEnrollmentData((prev) => ({
      ...prev,
      selectedService: next,
      serviceDetails: {
        serviceType: next.slug,
        learningFocus: next.serviceName,
        selectedSubjects: [],
        learningGoals: prev.serviceDetails?.learningGoals ?? "",
        specialNeeds: prev.serviceDetails?.specialNeeds,
        tutorGender: prev.serviceDetails?.tutorGender ?? "",
        curriculum: "",
      } as ServiceDetails,
      schedule: [],
      totalCost: 0,
      customFieldResponses: {},
    }));
  };

  // Task 3 - once a course + (optionally) age range are chosen for a cohort
  // service, fetch the open ClassGroups the student can join directly.
  // A group is set up for a Course, or - when the pick has no Course behind it -
  // for the tree item itself (matched by name).
  const cohortSubject = nodeBacked ? nodePicks[0]?.name : undefined;
  useEffect(() => {
    if (!isPathCService || !isCohortBased || (!serviceData.courseId && !cohortSubject) || !serviceType) {
      setClassGroups([]);
      return;
    }
    setIsLoadingGroups(true);
    GetClassGroupsAction({
      serviceType,
      ...(serviceData.courseId ? { course: serviceData.courseId } : { subject: cohortSubject }),
      ageRange: serviceData.ageLevel || undefined,
    }).then(([res]) => {
      setClassGroups(res?.data ?? []);
      setIsLoadingGroups(false);
    });
  }, [isPathCService, isCohortBased, serviceData.courseId, cohortSubject, serviceData.ageLevel, serviceType]);

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
    const computedCost = isPathC ? chosenCoursesTotal : calculateCost(schedule, pricingDetails);

    setLocalTotalCost(computedCost);
    setTotalCost(computedCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    schedule,
    serviceData.selectedSubjects,
    serviceData.curriculum,
    serviceData.country,
    serviceData.gradeLevel,
    serviceData.classFormat,
    serviceData.billingWeeks,
    isPathC,
    chosenCoursesTotal,
    pricingKey,
  ]);

  const { fields: customFields } = useCustomFormFields(STAGE, serviceType);
  const customFieldResponses = enrollmentData.customFieldResponses ?? {};

  useEffect(() => {
    const validate = () => {
      const stepErrors: Record<string, string> = {};

      if (serviceData.selectedSubjects.length === 0) {
        stepErrors.subjects = isPathCService
          ? stages.length > 0
            ? "Please complete your selection above"
            : "Please select a course"
          : isSingleSelection
            ? "Please select a subject"
            : "Please select at least one subject";
      } else if (isSingleSelection && serviceData.selectedSubjects.length > 1) {
        stepErrors.subjects = "This service allows only one subject per enrollment";
      }
      // An item with a special Course is booked through that Course; one without is
      // a plain pick. Their prices/schedules come from different places, so they
      // can't share one enrollment.
      if (isPathCService && serviceData.courseIds.length > 0 && nodePickIds.length > 0) {
        stepErrors.subjects =
          "Some of your choices are booked as special courses and others as standard ones - please enroll in them separately";
      }
      if (!serviceData.tutorGender) stepErrors.tutorGender = "Please select preferred tutor gender";

      if (isPathCService && flowReq.requires_age_range && !serviceData.ageLevel) {
        stepErrors.ageLevel = "Please select an age range";
      }
      if (isPathCService && flowReq.requires_language_selection && !serviceData.language) {
        stepErrors.language = "Please select a language";
      }
      if (isPathCService && isCohortBased && !serviceData.classGroupId) {
        stepErrors.classGroupId = "Please select a class group to join";
      }

      // Group/cohort placement is confirmed after enrollment, not picked
      // upfront - same exemption as flexibleSchedule (one-on-one only). This
      // used to force a family who picked "Group Class" to also fill in
      // specific days/times just to pass validation, even though the
      // Schedule section below never even asked them to (or, before that was
      // fixed, showed the picker but nothing downstream used what they
      // entered) - see the Schedule section's classFormat === "group" branch.
      if (
        !isPathC &&
        !isCohortBased &&
        !serviceData.flexibleSchedule &&
        serviceData.classFormat !== "group" &&
        !schedule.some((s) => s.days.length > 0)
      ) {
        stepErrors.schedule = "Please select at least one day for at least one subject";
      }
      if (isPathC && serviceData.selectedSubjects.length > 0 && schedule.length === 0) {
        stepErrors.schedule = "This selection has no schedule configured yet - please choose another.";
      }

      // Two subjects can't be scheduled at overlapping times - a student
      // can't attend both. Only checked once every subject has at least one
      // day picked (the check above already covers that case).
      if ((!isPathC || isMultiCourse) && !stepErrors.schedule) {
        const overlap = findScheduleOverlap(schedule);
        if (overlap) {
          stepErrors.schedule = `${overlap.subjectA} and ${overlap.subjectB} overlap on ${overlap.day} - please choose different times`;
        }
      }

      if (!isPathC && serviceData.selectedSubjects.length > 0) {
        const unpriced = getUnpricedSubjects(schedule, pricingDetails);
        if (unpriced.length > 0) {
          stepErrors.subjects = `No pricing has been set up yet for: ${unpriced.join(", ")} - please contact us or choose different subjects.`;
        } else if (serviceData.classFormat === "group" || serviceData.flexibleSchedule || isCohortBased) {
          // No days/times are submitted for these, so a price per hour has nothing
          // to multiply - the total would be 0. Only a flat price works here.
          const hourly = getHourlyPricedSubjects(serviceData.selectedSubjects, pricingDetails);
          if (hourly.length > 0) {
            stepErrors.subjects = `${hourly.join(", ")} ${hourly.length === 1 ? "is" : "are"} priced per hour, so ${
              hourly.length === 1 ? "it needs" : "they need"
            } specific days and times and can't be booked as a group class, in a cohort or with a flexible schedule. Please choose days and times instead, or contact us.`;
          }
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
        // ServiceDetails.selectedSubjectNodeIds). Must be built by mapping
        // over selectedSubjects (the order that has to be preserved), not by
        // filtering resolvedSubjects - resolvedSubjects comes back from the
        // backend sorted by {order, name} (see CurriculumNodeRepository),
        // which is unrelated to the family's click order, so filtering it
        // silently produced a full positional scramble against
        // selectedSubjects whenever the two orders differed (e.g. "Chemistry,
        // Biology, Physics, English Language" selected, but nodeIds coming
        // back alphabetical - "Biology, Chemistry, English Language,
        // Physics" - cross-wiring every subject to the wrong node).
        // (Computed once above as subjectNodeIds - from the drill-down's
        // subjects for the taxonomy paths, from the picked tree items for a
        // Course Module enrolled by plain picks.)
        const selectedSubjectNodeIds = subjectNodeIds;
        updateServiceDetails({ ...serviceData, selectedSubjectNodeIds });
        // A flexible one-on-one schedule, or a group-format one (placement
        // confirmed after enrollment, not picked upfront - see the Schedule
        // section's classFormat === "group" branch), submits no days/times
        // at all - the per-subject rows above only exist locally to drive
        // the "which subjects need a schedule" UI, not real picked days (see
        // validateScheduleDaysRequired on the backend, which would otherwise
        // reject each row's empty `days`).
        const submittedSchedule =
          !isPathC && (serviceData.flexibleSchedule || serviceData.classFormat === "group" || isCohortBased) ? [] : schedule;
        updateSchedule(submittedSchedule);
        setTotalCost(isPathC ? chosenCoursesTotal : calculateCost(schedule, pricingDetails));
      }

      onNext(stepErrors);
    };

    window.addEventListener("validateStep", validate);
    return () => window.removeEventListener("validateStep", validate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceData, schedule, isPathC, isCohortBased, isSingleSelection, customFields, customFieldResponses, chosenCoursesTotal, pricingKey, nodePickIds]);

  const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
    setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const availableSubjects = resolvedSubjects.map((s) => s.name);

  return (
    <div className="space-y-6">
      {/* Subject / Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPathCService ? (stages.length > 0 ? "Your Selection" : "Select a Course") : "Select Subjects"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableServices.length > 1 && (
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceType ?? ""} onValueChange={handleChangeService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((s) => (
                    <SelectItem key={s.id} value={s.slug}>{s.serviceName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Picked the wrong service? Switch it here - your subject/course and schedule choices below will be reset.
              </p>
            </div>
          )}

          {isPathCService &&
            stages.map((stage, i) => {
              // Later stages only appear once the previous one is picked, and
              // only if that pick actually has children - otherwise it is the
              // leaf and its courses are listed below.
              if (i > 0 && (!stageSelections[i - 1] || (stageOptions[i] ?? []).length === 0)) return null;
              const isAgeRange = i === 0 && !!flowReq.requires_age_range;

              // The last stage is what the student actually picks, so when
              // several may be taken it's a tick-list rather than a dropdown.
              // Each item resolves to the Course filed under it - there is no
              // separate "Course" step after this.
              if (lastStageIsPick && i === stages.length - 1) {
                return (
                  <div key={`${stage.order}-${stage.type}`} className="space-y-2">
                    <Label>
                      {stage.label || stage.type} * <span className="text-xs font-normal text-gray-500">(choose one or more)</span>
                    </Label>
                    {isLoadingCourses && <p className="text-sm text-gray-500">Loading...</p>}
                    <div className="grid gap-3">
                      {(stageOptions[i] ?? []).map((node) => {
                        const nodeCourses = courses.filter((c) => c.taxonomyNodeId === node.id);
                        if (nodeCourses.length === 0) {
                          // No special Course behind it: a plain pick, enrolled
                          // like a subject.
                          return (
                            <label
                              key={node.id}
                              className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${
                                nodePickIds.includes(node.id) ? "border-blue-500 bg-blue-50" : ""
                              }`}
                            >
                              <Checkbox
                                className="mt-1 h-5 w-5"
                                checked={nodePickIds.includes(node.id)}
                                onCheckedChange={() => toggleNodePick(node)}
                              />
                              <p className="font-medium">{node.name}</p>
                            </label>
                          );
                        }
                        return (
                          <div key={node.id} className="space-y-2">
                            {nodeCourses.length > 1 && <p className="text-sm font-medium text-gray-700">{node.name}</p>}
                            {nodeCourses.map((course) => (
                              <label
                                key={course.id}
                                className={`flex items-start justify-between border rounded-lg p-3 cursor-pointer ${
                                  serviceData.courseIds.includes(course.id) ? "border-blue-500 bg-blue-50" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    className="mt-1 h-5 w-5"
                                    checked={serviceData.courseIds.includes(course.id)}
                                    onCheckedChange={() => toggleCourse(course)}
                                  />
                                  <div>
                                    <p className="font-medium">{nodeCourses.length === 1 ? node.name : course.title}</p>
                                    {course.subtitle && <p className="text-sm text-gray-600">{course.subtitle}</p>}
                                  </div>
                                </div>
                                <p className="font-semibold text-green-700 whitespace-nowrap">
                                  {course.currency ?? "NGN"} {course.price?.toLocaleString()}
                                </p>
                              </label>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    {errors.subjects && <p className="text-red-600 text-sm">{errors.subjects}</p>}
                  </div>
                );
              }

              return (
                <div key={`${stage.order}-${stage.type}`} className="space-y-2">
                  <Label>
                    {stage.label || stage.type}
                    {isAgeRange ? " *" : ""}
                  </Label>
                  <Select value={stageSelections[i] ?? ""} onValueChange={(nodeId) => handleStageSelect(i, nodeId)}>
                    <SelectTrigger className={isAgeRange && errors.ageLevel ? "border-red-500" : ""}>
                      <SelectValue placeholder={`Select ${(stage.label || stage.type).toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(stageOptions[i] ?? []).map((n) => (
                        <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isAgeRange && errors.ageLevel && <p className="text-red-600 text-sm">{errors.ageLevel}</p>}
                </div>
              );
            })}

          {/* With several courses allowed, the tree's last stage above already
              lists them - this separate list is only for a service with no
              tree at all (or the single-course flow). */}
          {isPathCService && !lastStageIsPick && (
            <div className="space-y-2">
              {/* The flow is the Flow Tree - nothing extra after it. This block
                  stays silent until the tree is finished, and then only speaks
                  up when there's something to say: the price when the tree
                  already pinned down one course (no choice, so no "Course"
                  step), a list only when the last pick genuinely holds several,
                  or that it isn't open yet. A service with no tree at all has
                  nothing but courses to pick from, so it lists them. */}
              {treeExhausted && isLoadingCourses && <p className="text-sm text-gray-500">Loading...</p>}
              {/* Nothing under the pick. With a tree that has a pick level the
                  student simply carries on with the item they chose (a plain
                  pick, below) - "not open" only applies where that isn't possible
                  (an age-range-only tree has no item to enrol in) or when there's
                  no tree at all. */}
              {treeExhausted &&
                coursesResolved &&
                !isLoadingCourses &&
                filteredCourses.length === 0 &&
                !(isPathCService && treeHasPickLevel) && (
                  <p className="text-sm text-gray-500">
                    {hasTree
                      ? "This isn't open for enrollment yet - please check back soon."
                      : "No courses available yet."}
                  </p>
                )}
              {treeExhausted && !isLoadingCourses && courseDecidedByTree && (
                <p className="text-sm text-gray-600">
                  Fee:{" "}
                  <span className="font-semibold text-green-700">
                    {filteredCourses[0].currency ?? "NGN"} {filteredCourses[0].price?.toLocaleString()}
                  </span>
                </p>
              )}
              {treeExhausted && !courseDecidedByTree && filteredCourses.length > 0 && (
                <Label>{hasTree ? "Choose one *" : "Course *"}</Label>
              )}
              <div className="grid gap-3">
                {treeExhausted && !courseDecidedByTree && filteredCourses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-start justify-between border rounded-lg p-3 cursor-pointer ${
                      serviceData.courseIds.includes(course.id) ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type={isMultiCourse ? "checkbox" : "radio"}
                        name="course"
                        className="mt-1"
                        checked={serviceData.courseIds.includes(course.id)}
                        onChange={() => (isMultiCourse ? toggleCourse(course) : handleSelectCourse(course))}
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

          {isPathCService && flowReq.requires_language_selection && (
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
                onSubjectsResolved={(subjects, path) => {
                  setResolvedSubjects(subjects);
                  // Apply the exact path that produced these subjects in the
                  // same callback, rather than relying solely on the
                  // separate onPathChange effect below to have already
                  // landed - see CurriculumDrilldown's onSubjectsResolved
                  // doc for the race this closes (subjects resolving before
                  // country/educationLevel/exam/examCategory actually synced).
                  if (path) handleCurriculumPath(path);
                }}
                onPathChange={handleCurriculumPath}
                initialPath={
                  isPathB
                    ? {
                        country: serviceData.country || undefined,
                        curriculum: serviceData.examPreparationDetails.educationLevel || undefined,
                        level: serviceData.curriculum || undefined,
                        klass: serviceData.examCategory || undefined,
                      }
                    : {
                        country: serviceData.country || undefined,
                        curriculum: serviceData.curriculum || undefined,
                        level: serviceData.gradeLevel || undefined,
                        klass: serviceData.classYear || undefined,
                      }
                }
              />
            </div>
          )}

          {(isPathA || isPathB) && (
            <div className="space-y-2">
              <Label>
                Available Subjects *{" "}
                <span className="text-xs font-normal text-gray-500">
                  {isSingleSelection ? "(choose one)" : "(choose one or more)"}
                </span>
              </Label>
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
                          // A single-selection service swaps the pick instead of adding another.
                          selectedSubjects: checked
                            ? isSingleSelection
                              ? [subject]
                              : [...prev.selectedSubjects, subject]
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
          subjectNodeIds={serviceData.selectedSubjects
            .map((name) => resolvedSubjects.find((n) => n.name === name)?.id)
            .filter((id): id is string => !!id)}
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
      {isPathCService && isCohortBased && (serviceData.courseId || nodeBacked) && (
        <Card>
          <CardHeader><CardTitle>Choose a Class Group</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoadingGroups && <p className="text-sm text-gray-500">Loading available class groups...</p>}
            {!isLoadingGroups && classGroups.length === 0 && (
              <p className="text-sm text-gray-500">No open class groups yet for this - check back soon.</p>
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
                    flexibleSchedule: value === "group" ? false : prev.flexibleSchedule,
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

            {serviceData.classFormat === "one-on-one" && (
              <label className="flex items-start space-x-2">
                <Checkbox
                  className="mt-0.5"
                  checked={serviceData.flexibleSchedule}
                  onCheckedChange={(checked) =>
                    setServiceData((prev) => ({ ...prev, flexibleSchedule: checked === true }))
                  }
                />
                <span className="text-sm text-gray-700">
                  My schedule is flexible - I'd rather agree the exact days/times with an admin after enrolling
                  instead of picking them now.
                </span>
              </label>
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
            ) : serviceData.flexibleSchedule ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  No days/times needed now - an admin will reach out after enrollment to agree a schedule that works
                  for {serviceData.selectedSubjects.join(", ")}.
                </p>
              </div>
            ) : serviceData.classFormat === "group" ? (
              // Group/cohort placement is confirmed after enrollment (see the
              // Class Format card's own "next available group class" note
              // above) - this section used to fall through to the
              // interactive one-on-one day/time builder below regardless of
              // classFormat, silently asking a "Group Class" family to pick
              // specific days/times that nothing downstream ever used.
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  No days/times to pick - you&apos;ll be placed in the next available group class for{" "}
                  {serviceData.selectedSubjects.join(", ")}, and we&apos;ll confirm the schedule after enrollment.
                </p>
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
                        {/* Native picker gives every minute of the day (the
                            browser renders its own locale-appropriate AM/PM
                            or 24-hour clock UI), not just a fixed hourly
                            list - see scheduleTimeTo24Hour/From24Hour, which
                            convert to/from the "8:00am"-style string this
                            actually gets saved as. */}
                        <Input
                          type="time"
                          value={scheduleTimeTo24Hour(item.time)}
                          onChange={(e) => handleScheduleChange(index, "time", scheduleTimeFrom24Hour(e.target.value))}
                        />
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
            {!isPathC && hasHourlySubject && (
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
                {isPathC || !hasHourlySubject ? "" : ` / ${serviceData.billingWeeks} week${serviceData.billingWeeks === 1 ? "" : "s"}`}
              </p>
              <p className="text-sm text-gray-600">
                {isPathC
                  ? hasTree
                    ? "Price for your selection"
                    : "Course price"
                  : hasHourlySubject
                    ? "Based on selected subjects, schedule, and weeks selected above"
                    : "Fixed price for your selection"}
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
