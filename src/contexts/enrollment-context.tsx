"use client";

import {
  EnrollAction,
  EnrollmentResponse,
  FinalizeEnrollmentAction,
  GetEnrollmentAction,
  SaveDraftEnrollmentAction,
  UpdateDraftEnrollmentAction,
} from "@/server/enrollment";
import { GetServicePricingAction } from "@/server/service-pricing";
import { GetServicesAction } from "@/server/service-catalog";
import { ServicePricing } from "@/types/service-pricing";
import { IService, CustomFieldResponses, ArchitecturalPath } from "@/types/service-catalog";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

// Was a fixed union of the old hardcoded service list - now the service
// catalog (GET /api/public/services) is the source of truth, so this is
// just IService["slug"]. Kept as a named type (rather than inlining
// `string`) so call sites documenting "this is a service slug" still read
// clearly.
export type ServiceType = string;
export type UserType = "parent" | "student";

export type ChildInfo = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  countryOfResidence: string;
  primaryLanguage: string;
  userType: UserType;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  countryCode?: string;
  countryFlag?: string;
};

export type SubjectPerformance = {
  subject: string;
  currentScore?: string;
  targetScore?: string;
};

// Everything here is optional - richer context a student can fill in now or
// complete later for a tutor match, not a checkout blocker. Mirrors stcbe's
// IExamPreparationDetails.
export type ExamPreparationDetails = {
  educationLevel?: string;
  exam?: string;
  examYear?: number;
  examMonth?: string;
  currentGrade?: string;
  schoolName?: string;
  targetGrade?: string;
  subjectPerformance?: SubjectPerformance[];
  topicsOfDifficulty?: string;
  previousAttempts?: number;
  preferredClassType?: "one-on-one" | "group";
  preferredLearningMode?: "live-online" | "recorded";
  weeklyHours?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialLearningNeeds?: string;
  courseCombination?: string;
};

export type ClassFormat = "one-on-one" | "group";

export type ServiceDetails = {
  serviceType: ServiceType;
  learningFocus: string;
  // Path A grade-level leaf name OR Path C age range value
  // (flowRequirements.requires_age_range) - see CreateStudentDto.serviceDetails.ageLevel.
  ageLevel?: string;
  selectedSubjects: string[];
  // Same order/index as selectedSubjects - the CurriculumNode ids behind
  // each name, so the backend can price by the exact node (generalizes
  // beyond the curriculum/country/gradeLevel fields below, which only cover
  // academic-tutoring/exam-preparation's own shapes - see stcbe's
  // ServicePricingRepository.findMatching taxonomyNodeId dimension).
  selectedSubjectNodeIds?: string[];
  learningGoals: string;
  // General, service-agnostic note for the assigned tutor - accommodations,
  // learning differences, anything they should know going in. Distinct from
  // examPreparationDetails.specialLearningNeeds, which only ever exists for
  // exam-preparation enrollments.
  specialNeeds?: string;
  tutorGender: string;
  curriculum: string;
  // Country resolved from the curriculum drill-down - only meaningful for
  // academic-tutoring/exam-preparation, which price by curriculum and
  // country of residence (see ServicePricingRepository.findMatching).
  country?: string;
  // Path A only (flowRequirements.requires_grade_level/requires_class_year) -
  // the CurriculumNode LEVEL/CLASS names, distinct from `curriculum`.
  gradeLevel?: string;
  classYear?: string;
  // Path B only (flowRequirements.requires_category) - the CurriculumNode
  // CATEGORY name (educationLevel/exam live in examPreparationDetails).
  examCategory?: string;
  // Path C only (flowRequirements.requires_course_selection/requires_language_selection).
  courseId?: string;
  language?: string;
  // Task 5 - required whenever flowRequirements.requires_cohort is false.
  classFormat?: ClassFormat;
  // One-on-one only - ISO string, must be >=24h from now.
  startDate?: string;
  // One-on-one only - family wants to agree exact days/times with an admin
  // instead of picking them upfront (see stcbe's IServiceDetails.flexibleSchedule).
  flexibleSchedule?: boolean;
  // Required whenever flowRequirements.requires_cohort is true - the
  // IClassGroup the student picked from GET /public/class-groups.
  classGroupId?: string;
  examPreparationDetails?: ExamPreparationDetails;
  totalCost?: number;
  // How many weeks of tuition this enrollment's charge covers (hourly-rate
  // subjects only - flat-rate subjects are unaffected). Defaults to 4.
  billingWeeks?: number;
};

export type Schedule = {
  subject: string;
  days: string[];
  time: string;
  duration: number;
};

export type EnrollmentData = {
  id?: string;
  childInfo: ChildInfo;
  serviceDetails: ServiceDetails;
  schedule: Schedule[];
  totalCost: number;
  status: "draft" | "pending_payment" | "paid" | "active";
  // The full IService picked in Service Selection - later steps branch on
  // its architecturalPath/flowRequirements rather than hardcoding per-slug
  // checks. serviceDetails.serviceType only stores the slug (what the
  // backend needs); this is the richer object the UI branches on.
  selectedService?: IService;
  // Task 6 - answers to every active ICustomFormField across all stages,
  // keyed by field id, merged into the final submission as-is.
  customFieldResponses: CustomFieldResponses;
  // Optional Super Admin-issued single-use code (see stcbe's
  // generatePaymentBypassToken) that skips the payment gateway entirely on
  // finalize - scholarship/discounted students. Entered by the family at
  // Review, not shown/set anywhere else.
  bypassToken?: string;
  // Present = this is another service enrollment for a child the parent/
  // student already has (see stcbe's IStudent.childId) - the backend links
  // the new enrollment to that existing Child instead of creating a
  // lookalike duplicate. Set by enrollment-flow.tsx's prefillChildId flow
  // (Marketplace's "continue enrollment for this child"); absent for a
  // brand-new child, where the backend creates a fresh Child from childInfo.
  childId?: string;
};

type EnrollmentContextType = {
  enrollmentData: Partial<EnrollmentData>;
  updateChildInfo: (data: Partial<ChildInfo>) => void;
  updateServiceDetails: (data: Partial<ServiceDetails>) => void;
  updateSchedule: (schedule: Schedule[]) => void;
  updateSelectedService: (service: IService | undefined) => void;
  updateCustomFieldResponse: (fieldId: string, value: CustomFieldResponses[string] | undefined) => void;
  calculateCost: (schedule?: Schedule[], serviceDetails?: Partial<ServiceDetails>) => number;
  getUnpricedSubjects: (schedule?: Schedule[], serviceDetails?: Partial<ServiceDetails>) => string[];
  saveEnrollment: () => Promise<{ success: boolean; data?: EnrollmentResponse; error?: string }>;
  loadEnrollment: (id: string) => Promise<void>;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setTotalCost: (amount: number) => void;
  setEnrollmentData: React.Dispatch<React.SetStateAction<Partial<EnrollmentData>>>;
  pricing: ServicePricing[];
};

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollmentData, setEnrollmentData] = useState<Partial<EnrollmentData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [pricing, setPricing] = useState<ServicePricing[]>([]);

  useEffect(() => {
    GetServicePricingAction().then(([res]) => {
      if (res?.data) setPricing(res.data);
    });
  }, []);

  const updateChildInfo = (data: Partial<ChildInfo>) => {
    setEnrollmentData(prev => ({
      ...prev,
      childInfo: { ...prev.childInfo, ...data } as ChildInfo,
    }));
  };

  const updateServiceDetails = (data: Partial<ServiceDetails>) => {
    setEnrollmentData(prev => ({
      ...prev,
      serviceDetails: { ...prev.serviceDetails, ...data } as ServiceDetails,
    }));
  };

  // Task 1 - the full IService selected in Service Selection, so later steps
  // (Subjects & Schedule, custom-question fetches) can branch on its
  // architecturalPath/flowRequirements instead of hardcoding per-slug checks.
  const updateSelectedService = (service: IService | undefined) => {
    setEnrollmentData(prev => ({ ...prev, selectedService: service }));
  };

  // Task 6 - merges one dynamic custom-question answer in by field id.
  // Passing `undefined` clears the answer (e.g. the field's parent option
  // no longer applies).
  const updateCustomFieldResponse = (fieldId: string, value: CustomFieldResponses[string] | undefined) => {
    setEnrollmentData(prev => {
      const next = { ...(prev.customFieldResponses ?? {}) };
      if (value === undefined) {
        delete next[fieldId];
      } else {
        next[fieldId] = value;
      }
      return { ...prev, customFieldResponses: next };
    });
  };

  const updateSchedule = (schedule: Schedule[]) => {
    setEnrollmentData(prev => ({
      ...prev,
      schedule,
    }));
    // Pass the schedule in directly rather than relying on `enrollmentData.schedule` -
    // that state update above hasn't committed yet, so reading it back here would
    // compute cost off the *previous* schedule (always one edit behind).
    const totalCost = calculateCost(schedule);
    setTotalCost(totalCost);
  };

  // A pricing row now carries a price per currency (ServicePricing.prices -
  // see PricePoint) instead of one flat ratePerHour/flatRate, so a currency
  // has to be picked before a number can be read off it. This is only a
  // client-side estimate shown during enrollment - the backend recomputes
  // the actual authoritative charge server-side via PricingService.getQuote
  // at payment time (StudentService.enroll never trusts this value) - so
  // "prefer NGN, else whatever's first" is a reasonable display default
  // rather than something that needs real currency-detection here.
  const pickPrice = (row: ServicePricing | undefined): { ratePerHour?: number; flatRate?: number } | undefined => {
    if (!row || row.prices.length === 0) return undefined;
    return row.prices.find((p) => p.currency === "NGN") ?? row.prices[0];
  };

  // Every priced combination is its own explicit row (see stcbe's
  // ServicePricingRepository.findMatching, which this mirrors) - so for
  // academic-tutoring/exam-preparation, which can price by
  // subject/curriculum/gradeLevel/country independently, look up the most
  // specific row available for the dimensions actually set (largest subset
  // first) rather than a single flat per-service rate. A dimension NOT in
  // the subset being tried must be ABSENT on the candidate row (not just
  // unspecified in the query), so a row scoped to a narrower combination
  // than the tier being tried is correctly skipped.
  const findRateRow = (
    candidates: ServicePricing[],
    values: { subject?: string; curriculum?: string; gradeLevel?: string; country?: string; classFormat?: string }
  ): ServicePricing | undefined => {
    const allKeys = ["subject", "curriculum", "gradeLevel", "country", "classFormat"] as const;
    const keys = allKeys.filter((k) => !!values[k]);

    const subsets: (typeof keys)[] = [];
    for (let mask = (1 << keys.length) - 1; mask >= 0; mask--) {
      subsets.push(keys.filter((_, i) => mask & (1 << i)));
    }
    subsets.sort((a, b) => b.length - a.length);

    for (const subset of subsets) {
      const row = candidates.find((p) =>
        keys.every((k) => (subset.includes(k) ? p[k] === values[k] : !p[k]))
      );
      if (row) return row;
    }
    return undefined;
  };

  // Rates come from the admin-editable /public/service-pricing endpoint
  // (fetched into `pricing` on mount). This is only a display estimate - the
  // backend recomputes the actual authoritative charge server-side (see
  // StudentService.enroll/PricingService.getEnrollmentQuote), which is also
  // where an unpriced subject/grade combination is actually rejected. No
  // hardcoded fallback rate here anymore: a subject with no matching pricing
  // row contributes 0 rather than a fake number - see getUnpricedSubjects,
  // which the Subjects & Schedule step uses to block proceeding until every
  // selected subject actually has a price configured.
  //
  // Accepts optional overrides so callers that hold not-yet-committed
  // schedule/serviceDetails updates (e.g. mid-render state in the
  // Subjects & Schedule step) can compute against the current values instead
  // of the stale `enrollmentData` snapshot from context.
  const calculateCost = (scheduleOverride?: Schedule[], serviceDetailsOverride?: Partial<ServiceDetails>) => {
    const serviceDetails = { ...enrollmentData.serviceDetails, ...serviceDetailsOverride };
    const schedule = scheduleOverride ?? enrollmentData.schedule;
    const serviceType = serviceDetails.serviceType;
    const curriculum = serviceDetails.curriculum;
    const country = serviceDetails.country;
    const gradeLevel = serviceDetails.gradeLevel;
    const classFormat = serviceDetails.classFormat;
    const weeks = serviceDetails.billingWeeks && serviceDetails.billingWeeks > 0 ? serviceDetails.billingWeeks : 4;

    if (serviceType === "tech-bootcamp") {
      const bucket = (curriculum || "").trim().toLowerCase() === "nigerian" ? "Nigerian" : "International";
      const rateRow = pricing.find((p) => p.serviceType === "tech-bootcamp" && p.curriculum === bucket);
      const price = pickPrice(rateRow);
      if (price?.flatRate != null) return price.flatRate;
      return bucket === "Nigerian" ? 25000 : 50000;
    }

    if (!schedule) return 0;

    const candidates = pricing.filter((p) => p.serviceType === serviceType);

    return schedule.reduce((total, subject) => {
      const price = pickPrice(findRateRow(candidates, { subject: subject.subject, curriculum, gradeLevel, country, classFormat }));
      if (!price) return total;
      // A flat price already covers the whole billing period for this
      // subject - it isn't a rate to multiply by hours or weeks.
      if (price.flatRate != null) return total + price.flatRate;
      const hoursPerWeek = subject.days.length * (subject.duration / 60);
      return total + (price.ratePerHour ?? 0) * hoursPerWeek * weeks;
    }, 0);
  };

  // Subjects in `schedule` with no matching, priceable ServicePricing row -
  // used to block enrollment on an accurate ₦0 estimate instead of letting
  // it through only to fail at StudentService.enroll's authoritative quote.
  const getUnpricedSubjects = (scheduleOverride?: Schedule[], serviceDetailsOverride?: Partial<ServiceDetails>): string[] => {
    const serviceDetails = { ...enrollmentData.serviceDetails, ...serviceDetailsOverride };
    const schedule = scheduleOverride ?? enrollmentData.schedule;
    if (!schedule || serviceDetails.serviceType === "tech-bootcamp") return [];

    const candidates = pricing.filter((p) => p.serviceType === serviceDetails.serviceType);
    const { curriculum, country, gradeLevel, classFormat } = serviceDetails;

    return schedule
      .filter((subject) => !pickPrice(findRateRow(candidates, { subject: subject.subject, curriculum, gradeLevel, country, classFormat })))
      .map((subject) => subject.subject);
  };

  const saveEnrollment = async (): Promise<{ success: boolean; data?: EnrollmentResponse; error?: string }> => {
    setIsLoading(true);

    try {
      // Path C (Course Module) prices directly off the selected course/class
      // group, already computed and stored via setTotalCost in Subjects &
      // Schedule - the generic schedule/curriculum pricing formula below
      // doesn't know about course prices, so recomputing here would silently
      // clobber it with a wrong (or zero) number.
      const isCourseModule = enrollmentData.selectedService?.architecturalPath === ArchitecturalPath.COURSE_MODULE;
      const totalCost = isCourseModule ? enrollmentData.totalCost ?? 0 : calculateCost();
      setTotalCost(totalCost);

      // Build the payload's serviceDetails from this totalCost directly instead
      // of reading enrollmentData.serviceDetails right after updateServiceDetails()
      // - that state update hasn't committed yet, so the request would go out
      // with no totalCost and fail the backend's "must be > 0" validation.
      const serviceDetails = { ...enrollmentData.serviceDetails, totalCost };
      updateServiceDetails({ totalCost });

      const dataToSave = {
        ...enrollmentData.childInfo,
        childId: enrollmentData.childId || undefined,
        serviceDetails,
        schedule: enrollmentData.schedule,
        // IANA timezone the `schedule` times above were entered in - captured
        // silently (no picker UI) so the backend's tutor-allocation/suggestion
        // conflict checks can resolve a real UTC instant. See stcbe's
        // IStudent.timezone.
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        customFieldResponses: enrollmentData.customFieldResponses,
        // Only honored by finalizeEnrollment (the FinalizeEnrollmentAction
        // branch below) - see stcbe's StudentService.finalizeEnrollment.
        // Harmless to include on a bare EnrollAction call too (that path
        // simply doesn't read it), which in practice never happens anyway
        // since autosave-as-draft starts as soon as Child Info is filled in.
        bypassToken: enrollmentData.bypassToken || undefined,
      };

      // If this enrollment was autosaved as a draft along the way (see the
      // debounced-autosave effect below), finalize that same record instead
      // of creating a brand-new one - keeps a resumed/edited enrollment as
      // one record rather than spawning a duplicate Student/Payment.
      const [res, error] = enrollmentData.id
        ? await FinalizeEnrollmentAction(enrollmentData.id, dataToSave)
        : await EnrollAction(dataToSave);

      if (!res || error) {
        throw new Error(error || "Failed to save enrollment");
      }

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Save enrollment error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      setIsLoading(false);
    }
  };

  // Pulls a previously-autosaved draft (or a submitted-but-unpaid
  // enrollment) back into the wizard, so "Continue Enrollment" actually
  // resumes instead of starting over. Also resolves the full IService for
  // `selectedService`, since later steps branch on its
  // architecturalPath/flowRequirements, not just serviceDetails.serviceType.
  // Wrapped in useCallback so its identity is stable across renders - it's
  // listed as a dependency in EnrollmentFlow's "resume a draft" effect, and
  // a plain (non-memoized) function here gets a new reference every time
  // this provider re-renders. Since setEnrollmentData below always sets a
  // brand-new object, every call re-renders the provider, which would
  // otherwise recreate loadEnrollment, which would re-trigger that effect,
  // which would call loadEnrollment again - an infinite reload loop that
  // left isLoading (and therefore the wizard's Next/Save & Continue button)
  // effectively stuck.
  const loadEnrollment = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const [res, error] = await GetEnrollmentAction(id);
      if (!res || error || !res.data) {
        throw new Error(error || "Failed to load enrollment data");
      }
      const student = res.data;

      const childInfo: ChildInfo = {
        fullName: student.fullName,
        gender: student.gender || "",
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : "",
        phone: student.phone || "",
        countryOfResidence: student.countryOfResidence || "",
        primaryLanguage: student.primaryLanguage || "",
        // Not stored explicitly - approximated from which owner link is
        // set, the same distinction StudentService.enroll writes it from.
        userType: student.parentUser ? "parent" : "student",
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
      };

      const serviceDetails = student.serviceDetails
        ? {
            ...student.serviceDetails,
            startDate: student.serviceDetails.startDate ? String(student.serviceDetails.startDate) : undefined,
          }
        : undefined;

      let selectedService: IService | undefined;
      if (serviceDetails?.serviceType) {
        const [servicesRes] = await GetServicesAction();
        selectedService = servicesRes?.data?.find((s) => s.slug === serviceDetails.serviceType);
      }

      setEnrollmentData({
        id: student.id,
        childInfo,
        serviceDetails: serviceDetails as ServiceDetails | undefined,
        schedule: student.schedule ?? [],
        totalCost: serviceDetails?.totalCost ?? 0,
        selectedService,
        customFieldResponses: (student as any).customFieldResponses ?? {},
      });
    } catch (error) {
      console.error("Load enrollment error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Autosaves wizard progress as EnrollmentStatus.DRAFT so a closed
  // tab/refresh doesn't lose it - starts the first time Child Info is filled
  // in (fullName is the earliest point a valid Student record can exist at
  // all) and re-saves (debounced) on every change after. Also covers editing
  // an already-submitted-but-unpaid (PENDING) enrollment pulled back in via
  // loadEnrollment - same lenient update endpoint either way. Best-effort:
  // a failed autosave is logged, not surfaced - the wizard's in-memory state
  // is unaffected either way, so it shouldn't interrupt the parent.
  const draftSaveInFlight = useRef(false);
  useEffect(() => {
    if (!enrollmentData.childInfo?.fullName) return;
    const timeout = setTimeout(async () => {
      if (draftSaveInFlight.current) return;
      draftSaveInFlight.current = true;
      const payload = {
        ...enrollmentData.childInfo,
        serviceDetails: enrollmentData.serviceDetails,
        schedule: enrollmentData.schedule,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        customFieldResponses: enrollmentData.customFieldResponses,
      };
      try {
        if (enrollmentData.id) {
          await UpdateDraftEnrollmentAction(enrollmentData.id, payload);
        } else {
          const [res, error] = await SaveDraftEnrollmentAction(payload);
          if (res?.data && !error) {
            setEnrollmentData((prev) => ({ ...prev, id: res.data!.id }));
          }
        }
      } catch (error) {
        console.error("Autosave draft error:", error);
      } finally {
        draftSaveInFlight.current = false;
      }
    }, 1500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentData.childInfo, enrollmentData.serviceDetails, enrollmentData.schedule, enrollmentData.customFieldResponses]);

  const setTotalCost = (amount: number) => {
    setEnrollmentData(prev => ({
      ...prev,
      totalCost: amount,
    }));
  };

  return (
    <EnrollmentContext.Provider
      value={{
        enrollmentData,
        updateChildInfo,
        updateServiceDetails,
        updateSchedule,
        updateSelectedService,
        updateCustomFieldResponse,
        calculateCost,
        getUnpricedSubjects,
        saveEnrollment,
        loadEnrollment,
        isLoading,
        currentStep,
        setCurrentStep,
        setTotalCost,
        setEnrollmentData,
        pricing,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within EnrollmentProvider");
  }
  return context;
}
