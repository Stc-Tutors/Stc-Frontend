import { RateStatus } from "./payout";

// A tutor's pay rate for one scope of work - a row with every scope field
// unset is this tutor's default/fallback rate. See stcbe's
// core/interfaces/tutor-rate.ts for the full matching rules.
export interface TutorRate {
  id: string;
  tutor: string;
  serviceType?: string;
  curriculum?: string;
  subject?: string;
  courseId?: string;
  country?: string;
  gradeLevel?: string;
  taxonomyNodeId?: string;
  currency: string;
  ratePerHour?: number;
  flatRate?: number;
  rateStatus: RateStatus;
  proposedRatePerHour?: number;
  proposedFlatRate?: number;
  // Compare to `tutor` (your own id) to tell whose turn it is: equal means
  // this is your own counter-offer, awaiting the admin; anything else means
  // an admin proposal is awaiting your response.
  proposedBy?: string;
  // Admin-controlled: whether you're allowed to counter-offer this rate
  // instead of only accept/reject it.
  negotiable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
