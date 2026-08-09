// Mirrors stcbe's core/utils/schedule-overlap.ts - kept in sync manually
// since the two repos don't share code. Used to warn/block at the Subjects &
// Schedule step before submission; the backend re-checks the same thing
// authoritatively (StudentService.enroll's validateCreateEnrollment), so this
// is a UX improvement, not the source of truth.

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(time.trim());
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toLowerCase();
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  if (meridiem === "pm" && hours !== 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export interface ScheduleSlot {
  subject: string;
  days: string[];
  time: string;
  duration: number;
}

export interface ScheduleOverlap {
  day: string;
  subjectA: string;
  subjectB: string;
}

export function findScheduleOverlap(schedule: ScheduleSlot[]): ScheduleOverlap | null {
  for (let i = 0; i < schedule.length; i++) {
    const a = schedule[i];
    const aStart = parseTimeToMinutes(a.time);
    if (aStart == null) continue;
    const aEnd = aStart + a.duration;

    for (let j = i + 1; j < schedule.length; j++) {
      const b = schedule[j];
      const bStart = parseTimeToMinutes(b.time);
      if (bStart == null) continue;
      const bEnd = bStart + b.duration;

      const sharedDay = a.days.find((day) => b.days.includes(day));
      if (!sharedDay) continue;

      if (aStart < bEnd && bStart < aEnd) {
        return { day: sharedDay, subjectA: a.subject, subjectB: b.subject };
      }
    }
  }
  return null;
}
