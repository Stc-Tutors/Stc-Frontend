"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
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
export const GetExamStatusAction = () => call<ExamStatus>("/admin/exams/status", "GET");
export const GetExamCoursesAction = () => call<ExamCourseOption[]>("/admin/exams/courses", "GET");
export const ApproveExamAction = (id: string, acceptFeatureAddon = false) =>
  call<Exam>(`/admin/exams/${id}/approve`, "POST", { acceptFeatureAddon });
export const RejectExamAction = (id: string, reason: string) => call<Exam>(`/admin/exams/${id}/reject`, "POST", { reason });
export const GetExamsAction = () => call<Exam[]>("/admin/exams", "GET");
export const GetExamAction = (id: string) => call<Exam>(`/admin/exams/${id}`, "GET");
export const CreateExamAction = (body: {
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
export const UpdateExamAction = (id: string, body: Partial<Exam>) => call<Exam>(`/admin/exams/${id}`, "PUT", body);
export const DeleteExamAction = (id: string) => call<null>(`/admin/exams/${id}`, "DELETE");
export const RefreshExamPaymentAction = (id: string) => call<Exam>(`/admin/exams/${id}/refresh-payment`, "POST");
export const GetExamQuestionsAction = (id: string) => call<ExamQuestion[]>(`/admin/exams/${id}/questions`, "GET");
export const AddExamQuestionsAction = (id: string, questions: NewExamQuestion[]) =>
  call<{ created: number }>(`/admin/exams/${id}/questions`, "POST", { questions });
export const DeleteExamQuestionAction = (id: string, questionId: number) =>
  call<null>(`/admin/exams/${id}/questions/${questionId}`, "DELETE");
export const SearchExamLearnersAction = (q: string) =>
  call<ExamLearnerHit[]>(`/admin/exams/learners?q=${encodeURIComponent(q)}`, "GET");
export const AssignExamAction = (id: string, learnerKeys: string[]) =>
  call<{ assigned: number; alreadyAssigned: number; unknown: number }>(`/admin/exams/${id}/assign`, "POST", {
    learnerKeys,
  });
export const UnassignExamAction = (id: string, seatId: string) =>
  call<null>(`/admin/exams/${id}/assignments/${seatId}`, "DELETE");
export const SyncExamResultsAction = (id: string) =>
  call<{ matched: number; total: number }>(`/admin/exams/${id}/sync-results`, "POST");

// ---- learner (STUDENT / PARENT) ----
export const GetMyExamsAction = () => call<MyExam[]>("/exams/mine", "GET");
export const LaunchExamAction = (id: string, learnerKey: string) =>
  call<ExamLaunchResult>(`/exams/${id}/launch`, "POST", { learnerKey });
