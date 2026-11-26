/**
 * Rest timer arithmetic. The timer stores when the rest ends, not a ticking count, so it stays right after the
 * phone sleeps, the tab is hidden or the page reloads.
 */

export const PRESETS = [60, 90, 120, 180, 240] as const;
export const MIN_SECONDS = 5;
export const MAX_SECONDS = 15 * 60;

export const clampSeconds = (s: number) => Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.round(Number.isFinite(s) ? s : 90)));

/** Seconds left, rounded up, so a timer never shows 0:00 before it has actually ended. */
export const remaining = (endsAt: number, now: number) => Math.max(0, Math.ceil((endsAt - now) / 1000));

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Spoken label, e.g. "1 minute 30 seconds". */
export function spoken(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const parts = [m ? `${m} minute${m === 1 ? "" : "s"}` : "", s ? `${s} second${s === 1 ? "" : "s"}` : ""].filter(Boolean);
  return parts.join(" ") || "0 seconds";
}

/** Moments worth announcing to a screen reader while counting down. */
export const ANNOUNCE_AT = new Set([60, 30, 10, 0]);

export type TimerState = { duration: number; endsAt: number | null; pausedLeft: number | null };
export const idle = (duration: number): TimerState => ({ duration: clampSeconds(duration), endsAt: null, pausedLeft: null });
export const start = (s: TimerState, now: number): TimerState => ({ ...s, endsAt: now + (s.pausedLeft ?? s.duration) * 1000, pausedLeft: null });
export const pause = (s: TimerState, now: number): TimerState =>
  s.endsAt === null ? s : { ...s, endsAt: null, pausedLeft: remaining(s.endsAt, now) };
export const adjust = (s: TimerState, delta: number, now: number): TimerState => {
  if (s.endsAt !== null) {
    const left = remaining(s.endsAt, now) + delta;
    return left <= 0 ? { ...s, endsAt: now } : { ...s, endsAt: s.endsAt + delta * 1000 };
  }
  if (s.pausedLeft !== null) return { ...s, pausedLeft: Math.max(MIN_SECONDS, s.pausedLeft + delta) };
  return { ...s, duration: clampSeconds(s.duration + delta) };
};
export const left = (s: TimerState, now: number) => (s.endsAt !== null ? remaining(s.endsAt, now) : (s.pausedLeft ?? s.duration));
