// Mirrors LessonService's RESCHEDULE_GATE_MS - used only for UI hints (when
// to show/require a reason before submitting); the backend re-validates and
// is the actual source of truth.
export const RESCHEDULE_GATE_MS = 24 * 60 * 60 * 1000;

export function isInsideRescheduleGate(scheduledDate: string, now: number = Date.now()): boolean {
  return new Date(scheduledDate).getTime() - now < RESCHEDULE_GATE_MS;
}

// Mirrors LessonService's TUTOR_RESCHEDULE_NOTICE_MS - a tutor/HOD reschedule
// always goes tutor -> admin -> parent, and can't even be requested inside 48h.
export const TUTOR_RESCHEDULE_NOTICE_MS = 48 * 60 * 60 * 1000;

export function isInsideTutorRescheduleGate(scheduledDate: string, now: number = Date.now()): boolean {
  return new Date(scheduledDate).getTime() - now < TUTOR_RESCHEDULE_NOTICE_MS;
}
