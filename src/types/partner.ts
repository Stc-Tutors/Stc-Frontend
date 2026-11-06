// Mirrors stcbe's src/core/interfaces/partner.ts and the shapes in src/api/partner/partner-calc.ts.

export type PartnerEffectiveStatus = "PROBATION" | "PROBATION_REVIEW" | "ACTIVE" | "EXPIRED" | "TERMINATED";
export type PartnerEarningsModel = "PERCENT" | "FIXED" | "PERCENT_PLUS_BONUS";

export const PARTNER_STATUS_LABEL: Record<PartnerEffectiveStatus, string> = {
  PROBATION: "Probation (Acting Head)",
  PROBATION_REVIEW: "Probation ended - awaiting STC's decision",
  ACTIVE: "Operating Partner",
  EXPIRED: "Contract ended - access paused",
  TERMINATED: "Terminated",
};

export const PARTNER_EARNINGS_LABEL: Record<PartnerEarningsModel, string> = {
  PERCENT: "Percentage of scope revenue",
  FIXED: "Fixed monthly amount",
  PERCENT_PLUS_BONUS: "Percentage plus target bonus",
};

export interface PartnerKpiTargets {
  newEnrollmentsPerMonth?: number;
  maxDaysToAllocate?: number;
  minClassCompletionRate?: number;
}

export interface PartnerEarnings {
  model: PartnerEarningsModel;
  percent?: number;
  fixedAmount?: number;
  bonusAmount?: number;
  currency?: string;
}

export interface PartnerContract {
  id: string;
  user: string;
  userName?: string;
  title?: string;
  status: "PROBATION" | "ACTIVE" | "TERMINATED";
  effectiveStatus: PartnerEffectiveStatus;
  locked: boolean;
  startDate: string;
  probationEndsAt: string;
  termMonths: number;
  termEndsAt: string;
  reviewAt?: string;
  kpiTargets: PartnerKpiTargets;
  earnings: PartnerEarnings;
  maxDiscountPercent: number;
  notes?: string;
  terminationReason?: string;
}

export interface PartnerPeriod {
  label: string;
  from: string;
  to: string;
}

export interface KpiLine {
  key: "newEnrollments" | "daysToAllocate" | "classCompletion";
  label: string;
  actual: number | null;
  target: number | null;
  unit: string;
  met: boolean | null;
}

export interface PartnerKpiReport {
  period: PartnerPeriod;
  activeLearners: number;
  tutors: number;
  newEnrollments: number;
  classesHeld: number;
  classesDue: number;
  classCompletionRate: number | null;
  unassignedWaiting: number | null;
  oldestWaitDays: number | null;
  lines: KpiLine[];
}

export interface RevenueRow {
  currency: string;
  total: number;
}

export interface PartnerRevenueReport {
  period: PartnerPeriod;
  total: RevenueRow[];
  byScope: { scopeLabel: string; rows: RevenueRow[] }[];
}

export interface EarningsLine {
  label: string;
  currency: string;
  amount: number;
}

export interface PartnerEarningsStatement {
  period: PartnerPeriod;
  model: PartnerEarningsModel;
  percent?: number;
  revenue: RevenueRow[];
  lines: EarningsLine[];
  totals: RevenueRow[];
  bonusEarned: boolean | null;
  note: string;
}

export type PartnerProposalType = "PRICING" | "PROMOTION" | "CURRICULUM" | "TUTOR";
export type PartnerProposalStatus = "PENDING" | "APPROVED" | "REJECTED" | "IMPLEMENTED" | "WITHDRAWN";

export const PARTNER_PROPOSAL_TYPE_LABEL: Record<PartnerProposalType, string> = {
  PRICING: "Pricing change",
  PROMOTION: "Promotion / discount",
  CURRICULUM: "New curriculum or course",
  TUTOR: "Tutor recommendation",
};

export interface PartnerProposal {
  id: string;
  proposer: string;
  proposerName?: string;
  type: PartnerProposalType;
  title: string;
  details: string;
  service?: string;
  country?: string;
  payload: Record<string, unknown>;
  status: PartnerProposalStatus;
  decisionNote?: string;
  decidedAt?: string;
  implementedAt?: string;
  createdAt: string;
}

// Amounts are in the currency they came in - different currencies are never added together.
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
