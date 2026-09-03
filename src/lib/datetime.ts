// All schedule timestamps come from the backend as UTC ISO strings. These
// helpers render them in the viewer's browser-detected local timezone -
// Intl.DateTimeFormat already does this by default when no `timeZone` option
// is passed, so there's nothing to auto-detect ourselves. `timeZoneName:
// 'short'` surfaces the zone abbreviation so it's clear the time shown is
// localized rather than the raw UTC value.

export function formatScheduleTime(value: string | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

export function formatScheduleDate(value: string | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatScheduleDateTime(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    ...opts,
  }).format(new Date(value));
}

// A weekly schedule slot's `time` (ISchedule.time - the recurring day/time a
// student picks a subject for, distinct from the UTC ISO timestamps above)
// is stored as "H:MMam"/"H:MMpm" - see stcbe's parseTimeToMinutes, which
// requires exactly this format for conflict detection and Lesson generation.
// These convert to/from the 24-hour "HH:MM" value a native
// <input type="time"> produces, so a picker can offer every minute of the
// day (the browser renders its own locale-appropriate AM/PM or 24-hour
// clock UI) instead of a fixed list of preset options, without changing
// what actually gets saved or how the backend parses it.
export function scheduleTimeTo24Hour(time12: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(time12.trim());
  if (!match) return '';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3].toLowerCase();
  if (meridiem === 'pm' && hours !== 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

export function scheduleTimeFrom24Hour(time24: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time24.trim());
  if (!match) return '';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes}${meridiem}`;
}
