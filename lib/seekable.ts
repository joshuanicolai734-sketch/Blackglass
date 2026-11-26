/**
 * Seeking a Movement Studio clip only where the browser can actually go (Sites v34, "seekable-range-v7").
 *
 * A video can only jump to a time inside its `seekable` ranges. On a host that ignores byte-range requests those
 * ranges stay empty until the whole file has arrived, so the studio checks before it seeks, keeps the request
 * pending, and retries while the clip loads (components/site/movement-studio.tsx).
 */

/** Close enough to count as there: one frame at 24 fps, plus 10 ms. */
export const SETTLED = 1 / 24 + 0.01;

/** True when `time` (seconds) lies inside one of the video's seekable ranges and a frame is decoded. */
export function isSeekable(video: HTMLVideoElement, time: number) {
  if (video.readyState < 2 || !Number.isFinite(time)) return false;
  const ranges = video.seekable;
  for (let i = 0; i < ranges.length; i++) if (time >= ranges.start(i) && time <= ranges.end(i)) return true;
  return false;
}

/** The time (seconds) for a progress of 0–1, kept one frame short of the end so a looping clip doesn't wrap. */
export function targetTime(duration: number, progress: number) {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(progress)) return null;
  return Math.max(0, Math.min(duration - Math.min(1 / 24, duration / 2), Math.max(0, Math.min(1, progress)) * duration));
}

/** True when the video shows the requested progress: decoded, not mid-seek and within one frame of it. */
export function atPosition(video: HTMLVideoElement, progress: number) {
  const time = targetTime(video.duration, progress);
  return time !== null && video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - time) <= SETTLED;
}
