"use client";

import { EnrollAction, EnrollmentResponse, GetEnrollmentsAction } from "@/server/enrollment";
import { createContext, useContext, useState, type ReactNode } from "react";

export type ServiceType = "academic-tutoring" | "exam-preparation" | "tech-bootcamp";
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

export type ServiceDetails = {
  serviceType: ServiceType;
  learningFocus: string;
  ageLevel?: string;
  selectedSubjects: string[];
  learningGoals: string;
  tutorGender: string;
  curriculum: string;
  totalCost?: number;
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
};

type EnrollmentContextType = {
  enrollmentData: Partial<EnrollmentData>;
  updateChildInfo: (data: Partial<ChildInfo>) => void;
  updateServiceDetails: (data: Partial<ServiceDetails>) => void;
  updateSchedule: (schedule: Schedule[]) => void;
  calculateCost: () => number;
  saveEnrollment: () => Promise<{ success: boolean; data?: EnrollmentResponse; error?: string }>;
  loadEnrollment: (id: string) => Promise<void>;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollmentData, setEnrollmentData] = useState<Partial<EnrollmentData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const updateSchedule = (schedule: Schedule[]) => {
    setEnrollmentData(prev => ({
      ...prev,
      schedule,
    }));
    const totalCost = calculateCost();
    updateServiceDetails({ totalCost });
  };

  const calculateCost = () => {
    if (!enrollmentData.schedule) return 0;

    const ratePerHour = 1000;
    const totalWeekly = enrollmentData.schedule.reduce((total, subject) => {
      const hoursPerDay = subject.duration / 60;
      const totalHours = subject.days.length * hoursPerDay;
      return total + totalHours * ratePerHour;
    }, 0);

    return totalWeekly * 4;
  };

  const saveEnrollment = async (): Promise<{ success: boolean; data?: EnrollmentResponse; error?: string }> => {
    setIsLoading(true);

    try {
      const totalCost = calculateCost();
      updateServiceDetails({ totalCost });
      const dataToSave = {
        ...enrollmentData.childInfo,
        ...enrollmentData.serviceDetails,
        ...enrollmentData.schedule,
        ...enrollmentData,
      };

      const [res, error] = await EnrollAction(dataToSave);

      if (!res || error) {
        throw new Error(error || "Failed to save enrollment");
      }

      // console.log("Enrollment saved successfully:", res.data)
      // setEnrollmentData((prev) => ({ ...prev, id: enrollmentId }))

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Save enrollment error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrollment = async (id: string) => {
    setIsLoading(true);
    try {
      const [res, error] = await GetEnrollmentsAction();
      if (!res || error) {
        throw new Error(error || "Failed to load enrollment data");
      }
    } catch (error) {
      console.error("Load enrollment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EnrollmentContext.Provider
      value={{
        enrollmentData,
        updateChildInfo,
        updateServiceDetails,
        updateSchedule,
        calculateCost,
        saveEnrollment,
        loadEnrollment,
        isLoading,
        currentStep,
        setCurrentStep,
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
