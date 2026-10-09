/** Date/time formatting shared by list rows, bubbles and dividers. */

export function sameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function dayLabel(ts: number): string {
  if (sameDay(ts, Date.now())) return "Today";
  if (sameDay(ts, Date.now() - 86_400_000)) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Compact timestamp for conversation list rows. */
export function listTimeLabel(ts: number): string {
  if (sameDay(ts, Date.now())) return timeLabel(ts);
  if (sameDay(ts, Date.now() - 86_400_000)) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function voiceLabel(durationMs: number): string {
  const total = Math.round(durationMs / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
