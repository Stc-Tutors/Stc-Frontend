// "150" -> "2h 30m", "45" -> "45m", "0" -> "0m". Whole minutes only - that's
// the unit hours are tracked in.
export function formatMinutes(minutes: number | null | undefined): string {
  const total = Math.round(Number(minutes ?? 0));
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(total);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  return m === 0 ? `${sign}${h}h` : `${sign}${h}h ${m}m`;
}

export function percent(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
}
