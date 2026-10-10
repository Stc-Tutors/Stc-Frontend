"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import type { PaymentRequest } from "@/types/payment";
import type {
  Exam,
  ExamCourseOption,
  ExamLaunchResult,
  ExamLearnerHit,
  ExamQuestion,
  MyExam,
  ExamStatus,
  NewExamQuestion,
} from "@/types/exam";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function call<T>(
  url: string,
  method: string,
  body?: unknown
): Promise<[ApiResponse<T> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url,
    request: { method, headers: JSON_HEADERS, body: body === undefined ? undefined : JSON.stringify(body) },
  });
  return [res ? ((await res.json()) as ApiResponse<T>) : null, error];
}

// ---- admin (MANAGE_EXAMS) ----
export const GetExamStatusAction = async () => call<ExamStatus>("/admin/exams/status", "GET");
export const GetExamCoursesAction = async () => call<ExamCourseOption[]>("/admin/exams/courses", "GET");
export const ApproveExamAction = async (id: string, acceptFeatureAddon = false) =>
  call<Exam>(`/admin/exams/${id}/approve`, "POST", { acceptFeatureAddon });
export const RejectExamAction = async (id: string, reason: string) => call<Exam>(`/admin/exams/${id}/reject`, "POST", { reason });
export const GetExamsAction = async () => call<Exam[]>("/admin/exams", "GET");
export const GetExamAction = async (id: string) => call<Exam>(`/admin/exams/${id}`, "GET");
export const CreateExamAction = async (body: {
  title: string;
  description?: string;
  expectedParticipantCount: number;
  durationMinutes?: number;
  proctoring?: Record<string, boolean>;
  launchMode?: string;
  audienceType?: string;
  courseIds?: string[];
  acceptFeatureAddon?: boolean;
}) => call<Exam>("/admin/exams", "POST", body);
export const UpdateExamAction = async (id: string, body: Partial<Exam>) => call<Exam>(`/admin/exams/${id}`, "PUT", body);
export const DeleteExamAction = async (id: string) => call<null>(`/admin/exams/${id}`, "DELETE");
export const RefreshExamPaymentAction = async (id: string) => call<Exam>(`/admin/exams/${id}/refresh-payment`, "POST");
export const GetExamQuestionsAction = async (id: string) => call<ExamQuestion[]>(`/admin/exams/${id}/questions`, "GET");
export const AddExamQuestionsAction = async (id: string, questions: NewExamQuestion[]) =>
  call<{ created: number }>(`/admin/exams/${id}/questions`, "POST", { questions });
export const DeleteExamQuestionAction = async (id: string, questionId: number) =>
  call<null>(`/admin/exams/${id}/questions/${questionId}`, "DELETE");
export const SearchExamLearnersAction = async (q: string) =>
  call<ExamLearnerHit[]>(`/admin/exams/learners?q=${encodeURIComponent(q)}`, "GET");
export const AssignExamAction = async (id: string, learnerKeys: string[]) =>
  call<{ assigned: number; alreadyAssigned: number; unknown: number }>(`/admin/exams/${id}/assign`, "POST", {
    learnerKeys,
  });
export const UnassignExamAction = async (id: string, seatId: string) =>
  call<null>(`/admin/exams/${id}/assignments/${seatId}`, "DELETE");
export const SyncExamResultsAction = async (id: string) =>
  call<{ matched: number; total: number }>(`/admin/exams/${id}/sync-results`, "POST");

// ---- learner (STUDENT / PARENT) ----
export const GetMyExamsAction = async () => call<MyExam[]>("/exams/mine", "GET");
export const LaunchExamAction = async (id: string, learnerKey: string) =>
  call<ExamLaunchResult>(`/exams/${id}/launch`, "POST", { learnerKey });

// ---- school mock exams ----
// STC Exams' own response shapes for these are loosely documented, so they are passed through untyped and read defensively in the UI.
export const GetMockLearnersAction = async () => call<{ key: string; fullName: string }[]>("/exams/mock/learners", "GET");
export const GetMockCatalogAction = async () => call<Record<string, unknown>[]>("/exams/mock/catalog", "GET");
export const GetMockBalanceAction = async (learnerKey: string) =>
  call<Record<string, unknown> | null>(`/exams/mock/balance?learnerKey=${encodeURIComponent(learnerKey)}`, "GET");
export const LaunchMockAction = async (learnerKey: string) => call<{ launchUrl: string }>("/exams/mock/launch", "POST", { learnerKey });
export const GetMockStudentAction = async (learnerKey: string) =>
  call<{ learner: { key: string; fullName: string }; account: Record<string, unknown> | null }>(
    `/admin/exams/mock/students/${encodeURIComponent(learnerKey)}`,
    "GET"
  );
export const AllocateMockCoinsAction = async (learnerKey: string, coins: number) =>
  call<{ learner: { key: string; fullName: string }; coins: number }>("/admin/exams/mock/allocate", "POST", { learnerKey, coins });

// ---- buying mock coins ----
export interface MockPricing {
  pricePerCoin: number;
  currency: string;
  minCoins: number;
  maxCoins: number;
}

export interface MockPurchase {
  id: string;
  learnerName: string;
  coins: number;
  amount: number;
  currency: string;
  status: "PROCESSING" | "ALLOCATED" | "FAILED";
  error?: string;
  createdAt: string;
}

export const GetMockPricingAction = async () => call<MockPricing>("/exams/mock/pricing", "GET");
export const BuyMockCoinsAction = async (learnerKey: string, coins: number) =>
  call<PaymentRequest>("/exams/mock/buy-coins", "POST", { learnerKey, coins });
export const UpdateMockPricingAction = async (body: MockPricing) => call<MockPricing>("/admin/exams/mock/pricing", "PUT", body);
export const GetMockPurchasesAction = async () => call<MockPurchase[]>("/admin/exams/mock/purchases", "GET");
export const RetryMockPurchaseAction = async (id: string) => call<MockPurchase>(`/admin/exams/mock/purchases/${id}/retry`, "POST");

// Admin-side reads of the same data (the learner routes above are STUDENT/PARENT only).
export const GetMockCatalogAdminAction = async () => call<Record<string, unknown>[]>("/admin/exams/mock/catalog", "GET");
export const GetMockPricingAdminAction = async () => call<MockPricing>("/admin/exams/mock/pricing", "GET");
