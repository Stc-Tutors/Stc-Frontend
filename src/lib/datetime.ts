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
