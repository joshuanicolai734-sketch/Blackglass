/**
 * The force opening's geometry (Sites v34): one plane is loaded, pressed three times and settles into a set record.
 * Pure functions of progress (0–1) and layout, shared by the opening (force-opening.tsx) and the scroll handoff
 * into the Today screen (force-product-handoff.tsx). No DOM access.
 *
 * Rebuilt on 7 November 2026 from the compiled chunk the public site served (studio/reference/sites-v34-2026-11-07/):
 * names are new, the maths and numbers are unchanged.
 */

export type ForceLayout = "desktop" | "mobile";

/** Full sequence length in milliseconds. */
export const FORCE_DURATION: Record<ForceLayout, number> = { desktop: 6400, mobile: 6000 };

/** The three chapters, with the progress each chapter button seeks to. */
export const FORCE_PHASES = [
  { id: "load", label: "Load", at: 0.18, title: "One session.", text: "A deliberate starting point." },
  { id: "repeat", label: "Repeat", at: 0.36, title: "Then the next.", text: "Three returns. Each one leaves a mark." },
  { id: "record", label: "Record", at: 1, title: "Work, recorded.", text: "Illustrative set. Nothing saved." },
] as const;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smoothstep = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));
const easeOutQuart = (t: number) => 1 - (1 - clamp(t)) ** 4;
const between = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const svgTransform = (x: number, y: number, angle: number, sx: number, sy = sx) =>
  `translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${angle.toFixed(3)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`;

/** Every attribute the opening sets for one moment of the sequence. */
export function forceFrame(progress: number, layout: ForceLayout = "desktop") {
  const p = clamp(progress);
  const mobile = layout === "mobile";
  const w = mobile ? 390 : 1440;
  const h = mobile ? 348 : 680;
  const load = smoothstep(between(p, 0, 0.25));
  const settle = easeOutQuart(between(p, 0.71875, 0.9));
  const reps = between(p, 0.25, 0.71875) * 3;
  const repPart = reps >= 3 ? 1 : reps - Math.min(2, Math.floor(reps));
  const press = repPart < 0.46 ? smoothstep(repPart / 0.46) : repPart < 0.74 ? 1 - easeOutQuart((repPart - 0.46) / 0.28) : 0;
  const pressing = p >= 0.25 && p <= 0.71875 ? press : 0;
  const count = p < 0.25 ? 0 : Math.min(3, Math.floor(reps) + Number(repPart >= 0.74));
  const reveal = smoothstep(between(p, 0.19, 0.35));

  // The plane: centre, scale and tilt.
  const x = lerp(mobile ? 224 : 850, mobile ? 195 : 720, settle);
  const y = lerp((mobile ? 255 : 452) + load * (mobile ? 9 : 21) - pressing * (mobile ? 17 : 47), mobile ? 259 : 480, settle);
  const sx = lerp(lerp(mobile ? 2.7 : 8.1, mobile ? 2.49 : 7.5, load), mobile ? 1.9888889 : 7.2888889, settle);
  const sy = lerp(lerp(mobile ? 0.98 : 2.05, mobile ? 0.77 : 1.7, load), mobile ? 0.4555556 : 0.65, settle);
  const angle = lerp(lerp(mobile ? -7 : -8, mobile ? -2 : -3, load), 0, settle);
  const radians = (angle * Math.PI) / 180;

  // The headline rides the plane's top-left corner until the record settles it.
  const cornerX = x - 90 * sx * Math.cos(radians) + 90 * sy * Math.sin(radians);
  const cornerY = y - 90 * sx * Math.sin(radians) - 90 * sy * Math.cos(radians);
  const textX = Math.max(mobile ? 18 : 64, cornerX + 12);
  const textY = cornerY - (mobile ? 12 : 22);
  const firstX = lerp(textX, mobile ? 18 : 64, settle);
  const firstY = lerp(textY - reveal * (mobile ? 62 : 136), mobile ? 72 : 147, settle);
  const secondX = lerp(textX + (mobile ? 0 : 24) * (1 - reveal), mobile ? 18 : 64, settle);
  const secondY = lerp(textY + (mobile ? 63 : 144) * (1 - reveal), mobile ? 128 : 278, settle);
  const firstScale = lerp(lerp(1.04, 0.68, reveal), mobile ? 0.91 : 0.76, settle);
  const secondScale = lerp(lerp(0.85, 1.02 + count * 0.012, reveal), mobile ? 0.94 : 0.98, settle);
  const textAngle = angle * (1 - settle) * (1 - reveal * 0.62);

  // The paper ground rises and the headline turns from bone to ink.
  const paper = smoothstep(between(p, 0.735, 0.9));
  const ink = smoothstep(between(p, 0.8, 0.895));
  const titleRgb = [236, 239, 232].map((from, i) => Math.round(lerp(from, [20, 25, 22][i], ink)));

  const countX = lerp(mobile ? 353 : 1334, mobile ? 340 : 1318, settle);
  const countY = lerp((mobile ? 315 : 613) - pressing * (mobile ? 10 : 25), mobile ? 282 : 513, settle);
  const countSize = lerp(mobile ? 91 : 172, mobile ? 46 : 66, settle);
  const phase = p < 0.25 ? 0 : p < 0.71875 ? 1 : 2;
  const pressure = load * (1 - pressing) * (1 - settle);
  const shadow = {
    x,
    y: lerp(mobile ? 335 : 650, mobile ? 306 : 548, settle),
    rx: lerp(180 * sx * (0.53 - 0.075 * pressure), 180 * sx * 0.5, settle),
    ry: lerp((mobile ? 13 : 25) * (1 - 0.54 * pressure), mobile ? 5 : 8, settle),
    opacity: lerp(0.2 + 0.24 * pressure, mobile ? 0.21 : 0.24, settle),
  };

  return {
    p,
    w,
    h,
    x,
    y,
    sx,
    sy,
    angle,
    depth: 1 - settle,
    phase,
    count,
    settle,
    paper,
    pressure,
    shadow,
    highlight: 0.22 + 0.16 * pressure,
    transform: svgTransform(x, y, angle, sx, sy),
    edge: `M ${lerp(90, -90, settle).toFixed(3)} -90 H -90 V ${lerp(-90, 90, settle).toFixed(3)}`,
    firstTransform: svgTransform(firstX, firstY, textAngle, firstScale),
    secondTransform: svgTransform(secondX, secondY, textAngle, secondScale),
    titleFill: `rgb(${titleRgb.join(",")})`,
    secondOpacity: lerp(0.34, 1, reveal),
    countX,
    countY,
    countSize,
    countOpacity: smoothstep(between(p, 0.25, 0.3)),
    countTransform: svgTransform(countX, countY, angle * (1 - settle), 1),
    proof: smoothstep(between(p, 0.835, 0.9)),
    paperY: h * (1 - paper),
    notchOpacity: [0, 1, 2].map((i) => Number(count > i)),
    frontWidth: 180 * sx,
    frontHeight: 180 * sy,
  };
}

/** Where the record's labels and values sit, per layout ([x, y] in the art's viewBox). */
export function receiptAnchors(layout: ForceLayout = "desktop"): Record<string, [number, number]> {
  return layout === "mobile"
    ? { set: [36, 236], "set-value": [36, 282], weight: [195, 236], value: [195, 282], reps: [340, 236], foot: [16, 329] }
    : { set: [108, 456], "set-value": [108, 513], weight: [720, 456], value: [720, 513], reps: [1318, 456], foot: [64, 620] };
}

/**
 * Playback state. `intent` is the visitor's (or autoplay's) wish to play; blockers (hidden tab, offscreen, the brand
 * intro, page hide) pause it without losing that wish. It starts complete, so the still is the default.
 */
export class ForceTimeline {
  layout: ForceLayout;
  progress = 1;
  intent = false;
  blockers = new Set<string>();

  constructor({ layout = "desktop" }: { layout?: ForceLayout } = {}) {
    this.layout = layout;
  }
  get duration() {
    return FORCE_DURATION[this.layout];
  }
  get running() {
    return this.intent && !this.blockers.size && this.progress < 1;
  }
  play() {
    if (this.progress >= 1) this.progress = 0;
    this.intent = true;
  }
  pause() {
    this.intent = false;
  }
  seek(progress: number) {
    this.intent = false;
    this.progress = clamp(progress);
  }
  finish() {
    this.seek(1);
  }
  block(reason: string, on: boolean) {
    if (on) this.blockers.add(reason);
    else this.blockers.delete(reason);
  }
  advance(ms: number) {
    if (!this.running || !Number.isFinite(ms) || ms < 0) return;
    this.progress = clamp(this.progress + ms / this.duration);
    if (this.progress === 1) this.intent = false;
  }
}
