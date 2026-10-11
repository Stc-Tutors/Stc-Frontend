"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import type {
  MockAccessRow,
  MockAttempt,
  MockCatalog,
  MockCoinPackages,
  MockExamSubjects,
  MockLearnerHit,
  MockOwnQuestion,
  MockPricing,
  MockPurchase,
  MockStcStudent,
  MyMockExam,
  MyMockLearner,
} from "@/types/exam-mock";

// Identical in Stc-Frontend and Stc-SuperAdmin. Everything here goes to stcbe, which holds the STC Exams key - never the browser.
async function call<T>(url: string, method: string, body?: unknown): Promise<[ApiResponse<T> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url,
    request: {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  });
  return [res ? ((await res.json()) as ApiResponse<T>) : null, error];
}

// Guarded gateway to STC Exams' /mock/* (stcbe allow-lists the paths).
const stc = <T>(method: string, path: string, body?: unknown) => call<T>(`/admin/exams/mock/stc/${path}`, method, body);
const qs = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

// ---------------- admin ----------------
export const SearchMockLearnersAction = async (q: string) =>
  call<MockLearnerHit[]>(`/admin/exams/learners?q=${encodeURIComponent(q)}`, "GET");

// Per-student switch
export const ListMockAccessAction = async () => call<MockAccessRow[]>("/admin/exams/mock/access", "GET");
export const SetMockAccessAction = async (learnerKeys: string[], enabled: boolean) =>
  call<{ changed: string[]; failed: { learnerKey: string; error: string }[] }>("/admin/exams/mock/access", "PUT", { learnerKeys, enabled });
export const SetMockStudentSubjectsAction = async (learnerKey: string, allowedSubjectIds: number[] | null) =>
  call<MockAccessRow>(`/admin/exams/mock/access/${encodeURIComponent(learnerKey)}/subjects`, "PUT", { allowedSubjectIds });

// Exams: on/off, question source, one-time bank fee
export const GetMockCatalogAdminAction = async () => stc<MockCatalog>("GET", "catalog");
export const SetMockExamAccessAction = async (examId: number, body: { is_active: boolean; question_source: string }) =>
  stc<unknown>("PUT", `exams/${examId}/access`, body);
export const UnlockMockExamAction = async (examId: number) =>
  stc<{ payment_link: string; tx_ref: string; amount: number; currency: string }>("POST", `exams/${examId}/unlock`);
export const GetMockUnlockStatusAction = async (txRef: string) => stc<{ status: string }>("GET", `exam-unlock-status${qs({ tx_ref: txRef })}`);
export const GetMockExamSubjectsAction = async (examId: number) => stc<MockExamSubjects>("GET", `exams/${examId}/subjects`);

// The school's own question bank
export const ListMockQuestionsAction = async (topicId: number) => stc<MockOwnQuestion[]>("GET", `questions${qs({ topic_id: topicId })}`);
export const AddMockQuestionsAction = async (
  topicId: number,
  questions: { question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: string }[]
) => stc<{ created_count: number }>("POST", "questions/bulk", { topic_id: topicId, questions });
export const ImportMockQuestionsAction = async (csv: string, params: { topicId?: number; examId?: number; dryRun?: boolean; skipInvalid?: boolean }) =>
  stc<{ created?: number; skipped?: number; errors?: { line: number; message: string }[]; valid?: number; invalid?: number }>(
    "POST",
    `questions/import${qs({ topic_id: params.topicId, exam_id: params.examId, dry_run: params.dryRun ? "true" : undefined, skip_invalid: params.skipInvalid ? "true" : undefined })}`,
    { csv }
  );
export const DeleteMockQuestionAction = async (id: number) => stc<{ message: string }>("DELETE", `questions/${id}`);

// Students and coins
export const ListMockStcStudentsAction = async () => stc<MockStcStudent[]>("GET", "students");
export const GetMockCoinPackagesAction = async () => stc<MockCoinPackages>("GET", "coin-packages");
export const CheckoutMockCoinPackageAction = async (id: number) => stc<{ payment_link: string; tx_ref: string }>("POST", `coin-packages/${id}/checkout`);
export const GetMockCoinPurchaseStatusAction = async (txRef: string) => stc<{ status: string }>("GET", `coin-purchase-status${qs({ tx_ref: txRef })}`);
export const GiveMockCoinsAction = async (learnerKey: string, coins: number) =>
  call<{ learner: { key: string; fullName: string }; coins: number }>("/admin/exams/mock/allocate", "POST", { learnerKey, coins });

// Results
export const ListMockResultsAction = async (params: { examId?: number; status?: string; limit?: number }) =>
  stc<{ attempts: MockAttempt[]; next_after_id?: number }>("GET", `results${qs({ exam_id: params.examId, status: params.status, limit: params.limit ?? 100 })}`);

// Price families pay + purchases awaiting allocation
export const GetMockPricingAdmin = async () => call<MockPricing>("/admin/exams/mock/pricing", "GET");
export const SaveMockPricingAction = async (body: MockPricing) => call<MockPricing>("/admin/exams/mock/pricing", "PUT", body);
export const ListMockCoinPurchasesAction = async () => call<MockPurchase[]>("/admin/exams/mock/purchases", "GET");
export const RetryMockCoinPurchaseAction = async (id: string) => call<MockPurchase>(`/admin/exams/mock/purchases/${id}/retry`, "POST");

// ---------------- learner (STUDENT / PARENT) ----------------
export const GetMyMockLearnersAction = async () => call<MyMockLearner[]>("/exams/mock/learners", "GET");
export const GetMyMockExamsAction = async () => call<MyMockExam[]>("/exams/mock/exams", "GET");
export const GetMyMockSubjectsAction = async (examId: number, learnerKey: string) =>
  call<MockExamSubjects>(`/exams/mock/exams/${examId}/subjects${qs({ learnerKey })}`, "GET");
export const GetMyMockAttemptsAction = async (learnerKey: string) =>
  call<{ attempts: MockAttempt[] }>(`/exams/mock/attempts${qs({ learnerKey })}`, "GET");
export const LaunchMyMockAction = async (learnerKey: string, selection: { examId?: number; subjectId?: number; topicId?: number }) =>
  call<{ launchUrl: string }>("/exams/mock/launch", "POST", { learnerKey, ...selection });
