// STC Exams' mock-exam responses are only loosely documented, so every read below tries the likely field names and falls back to
// nothing rather than assuming one shape.
const text = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v : undefined);
const rec = (v: unknown): Record<string, unknown> | undefined => (v && typeof v === "object" ? (v as Record<string, unknown>) : undefined);
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

export function mockExamName(exam: Record<string, unknown>): string {
  return text(exam.name) ?? text(exam.title) ?? text(exam.exam_name) ?? text(exam.exam) ?? text(exam.code) ?? "Mock exam";
}

// false only when STC says the question bank still needs its one-time fee (`ready: false`).
export function mockExamReady(exam: Record<string, unknown>): boolean {
  return exam.ready !== false;
}

export function mockCoinBalance(account: Record<string, unknown> | null | undefined): number | undefined {
  if (!account) return undefined;
  return num(account.balance) ?? num(account.coins) ?? num(account.coin_balance) ?? num(rec(account.student)?.balance);
}

export function mockPoolBalance(account: Record<string, unknown> | null | undefined): number | undefined {
  if (!account) return undefined;
  return num(account.pool) ?? num(account.pool_balance) ?? num(rec(account.pool)?.balance);
}
