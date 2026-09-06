// Default student/parent notice window, in hours - mirrors
// RescheduleNoticeSettings' defaults. Only a fallback for the brief window
// before GetRescheduleNoticeSettingsAction resolves, or if it fails - the
// admin-configured value (fetched per page) is the real one; the backend
// re-validates against it regardless and is the actual source of truth.
export const DEFAULT_FAMILY_NOTICE_HOURS = 12;

export function isInsideRescheduleGate(
  scheduledDate: string,
  now: number = Date.now(),
  noticeHours: number = DEFAULT_FAMILY_NOTICE_HOURS
): boolean {
  return new Date(scheduledDate).getTime() - now < noticeHours * 60 * 60 * 1000;
}

// Default tutor/HOD notice window, in hours - a tutor/HOD reschedule always
// goes tutor -> admin -> parent. Inside this window a late-notice surcharge
// applies (see RescheduleSurchargeSettings) rather than a flat block; the
// request is only actually refused inside the shorter hard floor below.
export const DEFAULT_TUTOR_NOTICE_HOURS = 24;

// Mirrors LessonService's TUTOR_RESCHEDULE_HARD_FLOOR_MS - below this there's
// no realistic way to relay a reschedule to admin and get parent
// confirmation before the lesson starts, so it's refused outright regardless
// of surcharge. Not admin-configurable, unlike the two notice windows above.
export const TUTOR_RESCHEDULE_HARD_FLOOR_MS = 2 * 60 * 60 * 1000;

// True once a tutor reschedule request would carry a late-notice surcharge.
export function isInsideTutorRescheduleGate(
  scheduledDate: string,
  now: number = Date.now(),
  noticeHours: number = DEFAULT_TUTOR_NOTICE_HOURS
): boolean {
  return new Date(scheduledDate).getTime() - now < noticeHours * 60 * 60 * 1000;
}

// True once a tutor reschedule request is refused outright, no matter the surcharge.
export function isInsideTutorRescheduleHardFloor(scheduledDate: string, now: number = Date.now()): boolean {
  return new Date(scheduledDate).getTime() - now < TUTOR_RESCHEDULE_HARD_FLOOR_MS;
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
