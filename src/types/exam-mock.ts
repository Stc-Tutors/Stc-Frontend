// Shapes of STC Exams' school mock-exam API (see its "Mock exams (schools)" reference). Kept identical in Stc-Frontend and Stc-SuperAdmin.
export interface MockCatalogExam {
  id: number;
  name: string;
  country_name?: string;
  access_enabled: boolean;
  question_source: "stc" | "own" | "both";
  stc_bank_unlocked: boolean;
  stc_bank_price: number;
  ready: boolean;
}

export interface MockCatalog {
  currency: string;
  exams: MockCatalogExam[];
}

export interface MockTopic {
  id: number;
  name: string;
  stc_questions?: number;
  own_questions?: number;
  available?: number;
}

export interface MockSubject {
  id: number;
  name: string;
  available?: number;
  topics: MockTopic[];
}

export interface MockExamSubjects {
  exam: { id: number; name: string };
  enabled?: boolean;
  question_source?: string;
  subjects: MockSubject[];
}

export interface MockOwnQuestion {
  id: number;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  difficulty?: string;
  marks?: number;
}

export interface MockStcStudent {
  id: number;
  external_id: string;
  name: string;
  email?: string;
  allowed_subject_ids: number[] | null;
  coins_granted_total: number;
  coin_balance: number;
}

export interface MockCoinPackages {
  currency: string;
  coin_pool_balance: number;
  packages: { id: number; label: string; coin_amount: number; price: number }[];
}

export interface MockAttempt {
  attempt_id: number;
  student?: { external_id?: string; name?: string; email?: string };
  scope?: string;
  exam?: { id: number; name: string };
  subject?: { id: number; name: string };
  topic?: { id: number; name: string };
  status: string;
  score?: number;
  total_marks?: number;
  percentage?: number;
  late_submission?: boolean;
  started_at?: string;
  submitted_at?: string;
}

// The LMS-side per-student switch (stcbe ExamMockAccess).
export interface MockAccessRow {
  id: string;
  learnerKey: string;
  fullName: string;
  enabled: boolean;
  allowedSubjectIds: number[] | null;
}

export interface MockLearnerHit {
  key: string;
  fullName: string;
  grade?: string;
}

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

// Learner side.
export interface MyMockLearner {
  key: string;
  fullName: string;
  enabled: boolean;
  allowedSubjectIds: number[] | null;
}

export interface MyMockExam {
  id: number;
  name: string;
  country?: string;
  question_source?: string;
  ready: boolean;
}
