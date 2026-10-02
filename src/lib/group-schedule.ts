// The recurring day(s) and time a cohort meets - mirrors stcbe's IClassGroupSchedule.
export interface GroupSchedule {
  days: string[];
  time: string;
  durationMinutes: number;
  timezone?: string;
}

// "Sat, Sun at 9:00am (90 min)" - or null when the group has no schedule yet.
export function describeGroupSchedule(schedule?: GroupSchedule | null): string | null {
  if (!schedule || !schedule.days?.length || !schedule.time) return null;
  const days = schedule.days.map((d) => d.trim().slice(0, 3).replace(/^./, (c) => c.toUpperCase())).join(", ");
  return `${days} at ${schedule.time} (${schedule.durationMinutes} min)`;
}
