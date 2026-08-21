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

export interface AvailabilityBlock {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// "HH:MM" -> minutes since midnight, or null if unparseable. Mirrors
// stcbe's parseHHMMToMinutes (core/utils/schedule-overlap.ts).
function parseHHMMToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// Mirrors LessonService.isWithinAvailability - UI-side check so a parent/
// student gets immediate feedback on an out-of-availability pick instead of
// a rejected request; the backend re-validates and is the actual source of
// truth. No availability configured for the tutor = nothing to check
// against, so this returns true (don't block on missing data).
export function isWithinTutorAvailability(
  availability: AvailabilityBlock[] | undefined,
  requestedDateLocal: string, // datetime-local input value, e.g. "2026-08-20T14:00"
  durationMinutes: number,
  timezone?: string
): boolean {
  if (!availability || availability.length === 0) return true;
  if (!requestedDateLocal) return true;

  const requestedDate = new Date(requestedDateLocal);
  if (Number.isNaN(requestedDate.getTime())) return true;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || "UTC",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(requestedDate);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const requestedStart = hour * 60 + minute;
  const requestedEnd = requestedStart + durationMinutes;

  return availability.some((block) => {
    if (block.dayOfWeek !== weekday) return false;
    const blockStart = parseHHMMToMinutes(block.startTime);
    const blockEnd = parseHHMMToMinutes(block.endTime);
    if (blockStart === null || blockEnd === null) return false;
    return requestedStart >= blockStart && requestedEnd <= blockEnd;
  });
}

export function formatAvailability(availability: AvailabilityBlock[] | undefined): string {
  if (!availability || availability.length === 0) return "No availability on file for this tutor yet.";
  return availability.map((b) => `${b.dayOfWeek} ${b.startTime}-${b.endTime}`).join(", ");
}
