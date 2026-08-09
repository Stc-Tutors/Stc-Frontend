"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GetTutorApplicationDraftAction,
  StartTutorApplicationAction,
  SubmitTutorApplicationStep5Action,
  UpdateTutorApplicationStep2Action,
  UpdateTutorApplicationStep3Action,
  UpdateTutorApplicationStep4Action,
} from "@/server/tutor-application";
import {
  StartTutorApplicationPayload,
  TutorApplicationStep2Payload,
  TutorApplicationStep3Payload,
  TutorApplicationStep4Payload,
  TutorApplicationStep5Payload,
} from "@/types/tutor-application";
import { CustomFieldResponses } from "@/types/service-catalog";

const DRAFT_STORAGE_KEY = "stc_tutor_application_draft";

type SubmitResult = { success: boolean; error?: string };

// Everything the applicant has entered so far, kept in one place so a step
// can be revisited (Previous) without losing what was typed, and so the
// Final Review step can summarize steps 1-4. `applicationId`/`draftToken`
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
  customFieldResponses: CustomFieldResponses;
  submitted: boolean;
};

const initialState: TutorApplicationDraftState = {
  currentStep: 1,
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {},
  customFieldResponses: {},
  submitted: false,
};

type TutorApplicationContextType = {
  draft: TutorApplicationDraftState;
  isLoading: boolean;
  isSubmitting: boolean;
  submitStep1: (data: StartTutorApplicationPayload) => Promise<SubmitResult>;
  submitStep2: (data: TutorApplicationStep2Payload) => Promise<SubmitResult>;
  submitStep3: (data: TutorApplicationStep3Payload) => Promise<SubmitResult>;
  submitStep4: (data: TutorApplicationStep4Payload) => Promise<SubmitResult>;
  submitStep5: (data: TutorApplicationStep5Payload) => Promise<SubmitResult>;
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

export function TutorApplicationProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<TutorApplicationDraftState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resume an in-progress draft - the applicant can't log in between steps
  // (their account is PENDING_APPROVAL until step 5 submits - see
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
        currentStep: Math.min((application.currentStep ?? 1) + 1, 5),
        step1: {
          countryOfResidence: application.countryOfResidence,
          preferredLanguages: application.preferredLanguages,
        },
        step2: {
          qualifications: application.qualifications,
          yearsOfExperience: application.yearsOfExperience,
          teachingCombinations: application.teachingCombinations,
          previousPlatforms: application.previousPlatforms,
          availabilitySchedule: application.availabilitySchedule,
          documentUrls: application.documentUrls,
        },
        step3: {
          devices: application.devices,
          internetSpeed: application.internetSpeed,
          toolProficiency: application.toolProficiency,
          hasQuietEnvironment: application.hasQuietEnvironment,
          hasPeripherals: application.hasPeripherals,
        },
        step4: {
          psychConfidenceRating: application.psychConfidenceRating,
          psychDisengagedResponse: application.psychDisengagedResponse,
          psychMotivation: application.psychMotivation,
          psychParentDisagreementResponse: application.psychParentDisagreementResponse,
          personalityType: application.personalityType,
          personalityAdaptabilityRating: application.personalityAdaptabilityRating,
          personalityClassPrep: application.personalityClassPrep,
          personalityAboveAndBeyond: application.personalityAboveAndBeyond,
        },
        step5: {
          finalStrengths: application.finalStrengths,
          finalFeedbackApproach: application.finalFeedbackApproach,
          lessonPlanUrl: application.lessonPlanUrl,
          lessonPlanText: application.lessonPlanText,
        },
        customFieldResponses: application.customFieldResponses ?? {},
        submitted: false,
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

  const submitStep1 = async (data: StartTutorApplicationPayload): Promise<SubmitResult> => {
    setIsSubmitting(true);
    try {
      const [res, error] = await StartTutorApplicationAction(data);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to start application" };
      }
      const { applicationId, draftToken } = res.data;
      persistDraftRef(applicationId, draftToken);
      setDraft((prev) => ({ ...prev, applicationId, draftToken, step1: data, currentStep: 2 }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep2 = async (data: TutorApplicationStep2Payload): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application draft could not be found - please restart the application." };
    }
    setIsSubmitting(true);
    try {
      const [res, error] = await UpdateTutorApplicationStep2Action(draft.applicationId, draft.draftToken, data);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to save this step" };
      }
      setDraft((prev) => ({ ...prev, step2: data, currentStep: 3 }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep3 = async (data: TutorApplicationStep3Payload): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application draft could not be found - please restart the application." };
    }
    setIsSubmitting(true);
    try {
      const [res, error] = await UpdateTutorApplicationStep3Action(draft.applicationId, draft.draftToken, data);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to save this step" };
      }
      setDraft((prev) => ({ ...prev, step3: data, currentStep: 4 }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep4 = async (data: TutorApplicationStep4Payload): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application draft could not be found - please restart the application." };
    }
    setIsSubmitting(true);
    try {
      const [res, error] = await UpdateTutorApplicationStep4Action(draft.applicationId, draft.draftToken, data);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to save this step" };
      }
      setDraft((prev) => ({ ...prev, step4: data, currentStep: 5 }));
      return { success: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep5 = async (data: TutorApplicationStep5Payload): Promise<SubmitResult> => {
    if (!draft.applicationId || !draft.draftToken) {
      return { success: false, error: "Your application draft could not be found - please restart the application." };
    }
    setIsSubmitting(true);
    try {
      const payload: TutorApplicationStep5Payload = { ...data, customFieldResponses: draft.customFieldResponses };
      const [res, error] = await SubmitTutorApplicationStep5Action(draft.applicationId, draft.draftToken, payload);
      if (!res || error || !res.data) {
        return { success: false, error: error || res?.message || "Failed to submit application" };
      }
      // Final submit moves DRAFT -> PENDING server-side; nothing left to
      // resume, so drop the localStorage reference.
      clearDraftRef();
      setDraft((prev) => ({ ...prev, step5: data, submitted: true }));
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
        submitStep1,
        submitStep2,
        submitStep3,
        submitStep4,
        submitStep5,
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
