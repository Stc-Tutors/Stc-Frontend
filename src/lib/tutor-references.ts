import type { TutorApplication } from "@/types/tutor-application";

export interface PendingReference {
  slot: 1 | 2;
  name: string;
  contact: string;
}

// The referees a tutor named who haven't replied yet.
export function pendingReferences(app: TutorApplication | null | undefined): PendingReference[] {
  if (!app) return [];
  const out: PendingReference[] = [];
  if (app.reference1Contact && !app.reference1Response) out.push({ slot: 1, name: app.reference1Name || "Reference 1", contact: app.reference1Contact });
  if (app.reference2Contact && !app.reference2Response) out.push({ slot: 2, name: app.reference2Name || "Reference 2", contact: app.reference2Contact });
  return out;
}

// Whole days left until the references deadline (negative once it has passed); null when there is no deadline.
export function referenceDaysLeft(app: TutorApplication | null | undefined): number | null {
  if (!app?.referenceDeadline) return null;
  return Math.ceil((new Date(app.referenceDeadline).getTime() - Date.now()) / 86400000);
}

const APPROVED = ["APPROVED_PENDING_VETTING", "VETTING_SUBMITTED", "APPROVED"];

// How an approved tutor's references stand, for the badges on the review list; null when nothing is outstanding.
export function referenceState(app: TutorApplication): { label: string; tone: "warn" | "danger" | "muted" } | null {
  if (!APPROVED.includes(app.status) || pendingReferences(app).length === 0) return null;
  if (app.referenceWaived) return { label: "References outstanding (waived)", tone: "muted" };
  const left = referenceDaysLeft(app);
  if (left === null) return { label: "References outstanding", tone: "warn" };
  return left < 0 || new Date(app.referenceDeadline!).getTime() < Date.now()
    ? { label: "References overdue - tutor locked", tone: "danger" }
    : { label: `References due in ${left}d`, tone: "warn" };
}

export function referencesLocked(app: TutorApplication | null | undefined): boolean {
  const left = referenceDaysLeft(app);
  return left !== null && new Date(app!.referenceDeadline!).getTime() < Date.now() && pendingReferences(app).length > 0;
}
