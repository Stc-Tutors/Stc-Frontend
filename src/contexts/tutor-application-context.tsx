"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  FinalizeTutorApplicationSubmissionAction,
  GetTutorApplicationDraftAction,
  ResubmitTutorApplicationAction,
  SearchTutorsForReferralAction,
  StartTutorApplicationAction,
  UpdateTutorApplicationStep2Action,
  UpdateTutorApplicationStep3Action,
  UpdateTutorApplicationStep4Action,
  UpdateTutorApplicationStep5Action,
  UpdateTutorApplicationStep6Action,
  UpdateTutorApplicationStep7Action,
  UpdateTutorApplicationStep8Action,
  UpdateTutorApplicationStep9Action,
  UpdateTutorApplicationStep10Action,
} from "@/server/tutor-application";
import {
  StartTutorApplicationPayload,
  TutorApplicationStatus,
  TutorApplicationStep2Payload,
  TutorApplicationStep3Payload,
  TutorApplicationStep4Payload,
  TutorApplicationStep5Payload,
  TutorApplicationStep6Payload,
  TutorApplicationStep7Payload,
  TutorApplicationStep8Payload,
  TutorApplicationStep9Payload,
  TutorApplicationStep10Payload,
  TutorSearchResult,
} from "@/types/tutor-application";
import { CustomFieldResponses } from "@/types/service-catalog";

const DRAFT_STORAGE_KEY = "stc_tutor_application_draft";
const STATUS_STORAGE_KEY = "stc_tutor_application_status";

type SubmitResult = { success: boolean; error?: string };

// Everything the applicant has entered so far, kept in one place so a step
// can be revisited (Previous) without losing what was typed, and so the
// Final Review step can summarize steps 1-9. `applicationId`/`draftToken`
// only exist once step 1 has succeeded - see submitStep1 below.
export type TutorApplicationDraftState = {
  applicationId?: string;
  draftToken?: string;
  currentStep: number;
  step1: Partial<StartTutorApplicationPayload>;
  step2: Partial<TutorApplicationStep2Payload>;
  step3: Partial<TutorApplicationStep3Payload>;
  step4: Partial<TutorApplicationStep4Payload>;
  step5: Partial<TutorApplicationStep5Payload>;
  step6: Partial<TutorApplicationStep6Payload>;
  step7: Partial<TutorApplicationStep7Payload>;
  step8: Partial<TutorApplicationStep8Payload>;
  step9: Partial<TutorApplicationStep9Payload>;
  step10: Partial<TutorApplicationStep10Payload>;
  customFieldResponses: CustomFieldResponses;
  submitted: boolean;
  statusToken?: string;
  // Set on resume from the loaded application's own status. NEEDS_MORE_INFO
  // means this is an edit-after-flagged session, not a fresh draft - see
  // resubmit below and the "Resubmit for Review" affordance in
  // tutor-application-flow.tsx, shown instead of the normal step10 submit flow.
  applicationStatus?: TutorApplicationStatus;
  flaggedFields?: string[];
  needsMoreInfoNote?: string;
};

const initialState: TutorApplicationDraftState = {
  currentStep: 1,
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {},
  step6: {},
  step7: {},
  step8: {},
  step9: {},
  step10: {},
  customFieldResponses: {},
  submitted: false,
};

type TutorApplicationContextType = {
  draft: TutorApplicationDraftState;
  isLoading: boolean;
  isSubmitting: boolean;
  // Services step (intro_services) doesn't hit the API on its own - it just
  // stashes servicesOffered locally, then submitStep1 (personal info) sends
  // both together as one StartTutorApplicationPayload.
  setServicesOffered: (servicesOffered: string[]) => void;
  submitStep1: (data: Omit<StartTutorApplicationPayload, "servicesOffered">) => Promise<SubmitResult>;
  submitStep2: (data: TutorApplicationStep2Payload) => Promise<SubmitResult>;
  submitStep3: (data: TutorApplicationStep3Payload) => Promise<SubmitResult>;
  submitStep4: (data: TutorApplicationStep4Payload) => Promise<SubmitResult>;
  submitStep5: (data: TutorApplicationStep5Payload) => Promise<SubmitResult>;
  submitStep6: (data: TutorApplicationStep6Payload) => Promise<SubmitResult>;
  submitStep7: (data: TutorApplicationStep7Payload) => Promise<SubmitResult>;
  submitStep8: (data: TutorApplicationStep8Payload) => Promise<SubmitResult>;
  submitStep9: (data: TutorApplicationStep9Payload) => Promise<SubmitResult>;
  // Saves Agreements fields and advances to Review & Submit - does NOT
  // finalize (see finalizeSubmission below).
  submitStep10: (data: TutorApplicationStep10Payload) => Promise<SubmitResult>;
  // The wizard's actual last action, called from the Review & Submit step -
  // moves DRAFT -> PENDING server-side.
  finalizeSubmission: () => Promise<SubmitResult>;
  // NEEDS_MORE_INFO -> PENDING, once the applicant has fixed whatever was
  // flagged (via the normal submitStep2-9 calls above, which work in this
  // mode too - see stcbe's tutorApplicationEditMiddleware).
  submitResubmit: () => Promise<SubmitResult>;
  searchReferringTutors: (query: string) => Promise<TutorSearchResult[]>;
  updateCustomFieldResponse: (fieldId: string, value: CustomFieldResponses[string] | undefined) => void;
  goToStep: (step: number) => void;
};

const TutorApplicationContext = createContext<TutorApplicationContextType | undefined>(undefined);

function persistDraftRef(applicationId: string, draftToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ applicationId, draftToken }));
}

function clearDraftRef() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

function readDraftRef(): { applicationId: string; draftToken: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.applicationId && parsed?.draftToken) return parsed;
    return null;
  } catch {
    return null;
  }
}

// The applicant can't log in until APPROVED (see auth.service.ts), so
// "check my application status / message admin" is backed by this separate,
// longer-lived token rather than a session - see the tutor-application-status
// page and GetTutorApplicationStatusAction.
function persistStatusRef(applicationId: string, statusToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify({ applicationId, statusToken }));
}

export function TutorApplicationProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<TutorApplicationDraftState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resume an in-progress draft - the applicant can't log in between steps
  // (their account is PENDING_APPROVAL until step 10 submits - see
  // tutor-draft.middleware.ts), so "Save and Continue Later" is backed by
  // the applicationId+draftToken pair stashed in localStorage on step 1
  // success, not a normal session/cookie.
  useEffect(() => {
    const ref = readDraftRef();
    if (!ref) {
      setIsLoading(false);
      return;
    }
    GetTutorApplicationDraftAction(ref.applicationId, ref.draftToken).then(([res, error]) => {
      if (error || !res?.data) {
        // Token expired/invalid or the draft was already submitted - drop
        // the stale reference and let the applicant start fresh.
        clearDraftRef();
        setIsLoading(false);
        return;
      }
      const application = res.data;
      setDraft({
        applicationId: ref.applicationId,
        draftToken: ref.draftToken,
        // Backend currentStep (1-10) tracks the last completed backend step
        // (see TutorApplicationService.updateStepN); UI steps run 1-12
        // (Services + Personal Info are UI steps 1-2 but count as backend
        // step 1 together; Review & Submit is UI step 12 with no backend
        // step of its own), so resume two UI steps ahead of it.
        currentStep: Math.min((application.currentStep ?? -1) + 2, 12),
        step1: {
          servicesOffered: application.servicesOffered,
          countryOfResidence: application.countryOfResidence,
          preferredLanguages: application.preferredLanguages,
          dateOfBirth: application.dateOfBirth,
          headshotFile: application.headshotFile,
        },
        step2: {
          qualifications: application.qualifications,
          yearsOfExperience: application.yearsOfExperience,
          yearsOnlineTutoringExperience: application.yearsOnlineTutoringExperience,
          highestQualification: application.highestQualification,
          otherQualificationsHeld: application.otherQualificationsHeld,
          otherCertifications: application.otherCertifications,
          otherCertificationDetail: application.otherCertificationDetail,
          teachingExperienceHistory: application.teachingExperienceHistory,
          previousPlatforms: application.previousPlatforms,
          documentUrls: application.documentUrls,
        },
        step3: {
          teachingCycles: application.teachingCycles,
          digitalSkillsBundles: application.digitalSkillsBundles,
          musicInstruments: application.musicInstruments,
          softSkillsTopics: application.softSkillsTopics,
          careerCoachingTopics: application.careerCoachingTopics,
          selfDevTopics: application.selfDevTopics,
          adultEdFocusAreas: application.adultEdFocusAreas,
        },
        step4: {
          govIdFile: application.govIdFile,
          cvFile: application.cvFile,
          supportingDocumentsFile: application.supportingDocumentsFile,
          certificationProofs: application.certificationProofs,
          backgroundCheckConsent: application.backgroundCheckConsent,
          reference1Name: application.reference1Name,
          reference1Contact: application.reference1Contact,
          reference2Name: application.reference2Name,
          reference2Contact: application.reference2Contact,
        },
        step5: {
          devices: application.devices,
          internetSpeed: application.internetSpeed,
          toolProficiency: application.toolProficiency,
          hasQuietEnvironment: application.hasQuietEnvironment,
          hasPeripherals: application.hasPeripherals,
        },
        step6: {
          timezone: application.timezone,
          availabilitySchedule: application.availabilitySchedule,
          maxWeeklyHours: application.maxWeeklyHours,
          preferredClassFormat: application.preferredClassFormat,
        },
        step7: {
          psychConfidenceRating: application.psychConfidenceRating,
          psychDisengagedResponse: application.psychDisengagedResponse,
          psychMotivation: application.psychMotivation,
          psychParentDisagreementResponse: application.psychParentDisagreementResponse,
          personalityType: application.personalityType,
          personalityAdaptabilityRating: application.personalityAdaptabilityRating,
          personalityClassPrep: application.personalityClassPrep,
          personalityAboveAndBeyond: application.personalityAboveAndBeyond,
          analyticalOrCreative: application.analyticalOrCreative,
        },
        step8: {
          finalStrengths: application.finalStrengths,
          finalFeedbackApproach: application.finalFeedbackApproach,
          lessonPlanUrl: application.lessonPlanUrl,
          lessonPlanText: application.lessonPlanText,
          internalExpectedPayMin: application.internalExpectedPayMin,
          internalExpectedPayMax: application.internalExpectedPayMax,
        },
        step9: {
          payoutMethod: application.payoutMethod,
          bankName: application.bankName,
          accountNumber: application.accountNumber,
          accountName: application.accountName,
          wasReferred: application.wasReferred,
          // Populated to {id, firstName, lastName} for display elsewhere -
          // this step's payload needs just the id back (resubmitted as-is
          // if the applicant edits and re-saves Step 9).
          referringTutorId:
            typeof application.referringTutorId === "string"
              ? application.referringTutorId
              : application.referringTutorId?.id,
        },
        step10: {
          termsAccepted: application.termsAccepted,
          ethicsCommitmentAccepted: application.ethicsCommitmentAccepted,
          dataPrivacyAgreed: application.dataPrivacyAgreed,
          signature: application.signature,
          whatsappChannelJoined: application.whatsappChannelJoined,
        },
        customFieldResponses: application.customFieldResponses ?? {},
        submitted: false,
        applicationStatus: application.status,
        flaggedFields: application.flaggedFields,
        needsMoreInfoNote: application.needsMoreInfoNote,
      });
      setIsLoading(false);
    });
  }, []);

  const updateCustomFieldResponse = (fieldId: string, value: CustomFieldResponses[string] | undefined) => {
    setDraft((prev) => {
      const next = { ...prev.customFieldResponses };
      if (value === undefined) delete next[fieldId];
      else next[fieldId] = value;
      return { ...prev, customFieldResponses: next };
    });
  };

  const goToStep = (step: number) => setDraft((prev) => ({ ...prev, currentStep: step }));

  const setServicesOffered = (servicesOffered: string[]) => {
    setDraft((prev) => ({ ...prev, step1: { ...prev.step1, servicesOffered }, currentStep: 2 }));
  };

  const submitStep1 = async (data: Omit<StartTutorApplicationPayload, "servicesOffered">): Promise<SubmitResult> => {
    setIsSubmitting(true);
    try {
      const payload: StartTutorApplicationPayload = {
        ...data,
        servicesOffered: draft.step1.servicesOffered || [],
      };
      const [res, error] = await StartTutorApplicationAction(payload);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to start application" };
      }
      const { applicationId, draftToken } = res.data;
      persistDraftRef(applicationId, draftToken);
      setDraft((prev) => ({ ...prev, applicationId, draftToken, step1: payload, currentStep: 3 }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  function makeStepSubmitter<TPayload>(
    action: (id: string, draftToken: string, data: TPayload) => ReturnType<typeof UpdateTutorApplicationStep2Action>,
    stepKey: keyof TutorApplicationDraftState,
    nextStep: number
  ) {
    return async (data: TPayload): Promise<SubmitResult> => {
      if (!draft.applicationId || !draft.draftToken) {
        return { success: false, error: "Your application draft could not be found - please restart the application." };
      }
      setIsSubmitting(true);
      try {
        const [res, error] = await action(draft.applicationId, draft.draftToken, data);
        if (!res || error || !res.data) {
          return { success: false, error: error || res?.message || "Failed to save this step" };
        }
        setDraft((prev) => ({ ...prev, [stepKey]: data, currentStep: nextStep }));
        return { success: true };
      } finally {
        setIsSubmitting(false);
      }
    };
  }

  const submitStep2 = makeStepSubmitter(UpdateTutorApplicationStep2Action, "step2", 4);
  const submitStep3 = makeStepSubmitter(UpdateTutorApplicationStep3Action, "step3", 5);
  const submitStep4 = makeStepSubmitter(UpdateTutorApplicationStep4Action, "step4", 6);
  const submitStep5 = makeStepSubmitter(UpdateTutorApplicationStep5Action, "step5", 7);
  const submitStep6 = makeStepSubmitter(UpdateTutorApplicationStep6Action, "step6", 8);
  const submitStep7 = makeStepSubmitter(UpdateTutorApplicationStep7Action, "step7", 9);
  const submitStep8 = makeStepSubmitter(UpdateTutorApplicationStep8Action, "step8", 10);
  const submitStep9 = makeStepSubmitter(UpdateTutorApplicationStep9Action, "step9", 11);

  const searchReferringTutors = async (query: string): Promise<TutorSearchResult[]> => {
    if (!draft.applicationId || !draft.draftToken) return [];
    const [res] = await SearchTutorsForReferralAction(draft.applicationId, draft.draftToken, query);
    return res?.data ?? [];
  };

  const submitStep10 = async (data: TutorApplicationStep10Payload): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application draft could not be found - please restart the application." };
    }
    setIsSubmitting(true);
    try {
      const payload: TutorApplicationStep10Payload = { ...data, customFieldResponses: draft.customFieldResponses };
      const [res, error] = await UpdateTutorApplicationStep10Action(draft.applicationId, draft.draftToken, payload);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to save this step" };
      }
      setDraft((prev) => ({ ...prev, step10: data, currentStep: 12 }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  // The Review & Submit step's actual final action - moves DRAFT -> PENDING
  // server-side. Separate from submitStep10 above (which only saves
  // Agreements) so the tutor can review/edit any section first.
  const finalizeSubmission = async (): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application draft could not be found - please restart the application." };
    }
    setIsSubmitting(true);
    try {
      const [res, error] = await FinalizeTutorApplicationSubmissionAction(draft.applicationId, draft.draftToken);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to submit application" };
      }
      // Nothing left to resume - drop the draft reference and switch to the status token.
      clearDraftRef();
      persistStatusRef(draft.applicationId, res.data.statusToken);
      setDraft((prev) => ({ ...prev, submitted: true, statusToken: res.data!.statusToken }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResubmit = async (): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application could not be found - please log in again." };
    }
    setIsSubmitting(true);
    try {
      const [res, error] = await ResubmitTutorApplicationAction(draft.applicationId, draft.draftToken);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to resubmit application" };
      }
      setDraft((prev) => ({
        ...prev,
        submitted: true,
        applicationStatus: TutorApplicationStatus.PENDING,
        flaggedFields: [],
      }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TutorApplicationContext.Provider
      value={{
        draft,
        isLoading,
        isSubmitting,
        setServicesOffered,
        submitStep1,
        submitStep2,
        submitStep3,
        submitStep4,
        submitStep5,
        submitStep6,
        submitStep7,
        submitStep8,
        submitStep9,
        submitStep10,
        finalizeSubmission,
        submitResubmit,
        searchReferringTutors,
        updateCustomFieldResponse,
        goToStep,
      }}
    >
      {children}
    </TutorApplicationContext.Provider>
  );
}

export function useTutorApplication() {
  const context = useContext(TutorApplicationContext);
  if (!context) {
    throw new Error("useTutorApplication must be used within TutorApplicationProvider");
  }
  return context;
}
