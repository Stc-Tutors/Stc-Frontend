// A live class only becomes joinable this many minutes before it starts -
// the "Join Class" control stays visible but inert before that, matching
// how platforms like Zoom/Meet gate their own waiting rooms.
export const JOIN_WINDOW_MINUTES_BEFORE = 10;

export interface JoinWindow {
  isJoinable: boolean;
  hasEnded: boolean;
  opensAt: number;
  endsAt: number;
}

export function getJoinWindow(scheduledDate: string, durationMinutes: number, now: number = Date.now()): JoinWindow {
  const start = new Date(scheduledDate).getTime();
  const opensAt = start - JOIN_WINDOW_MINUTES_BEFORE * 60000;
  const endsAt = start + durationMinutes * 60000;
  return {
    isJoinable: now >= opensAt && now <= endsAt,
    hasEnded: now > endsAt,
    opensAt,
    endsAt,
  };
}
