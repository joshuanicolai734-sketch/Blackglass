/**
 * DOTS: a bodyweight-adjusted strength score, used in powerlifting to compare lifters of different bodyweights.
 *
 *   DOTS = result × 500 / (a·bw⁴ + b·bw³ + c·bw² + d·bw + e)
 *
 * The coefficients are the published DOTS values (as used by OpenPowerlifting), with bodyweight held inside the range
 * the formula was fitted for: 40–210 kg with the men’s coefficients, 40–150 kg with the women’s.
 *
 * DOTS was made for totals (squat + bench press + deadlift). A score for one lift only compares with the same lift.
 */

export const COEFFICIENTS = {
  men: { a: -0.000001093, b: 0.0007391293, c: -0.1918759221, d: 24.0900756, e: -307.75076, min: 40, max: 210 },
  women: { a: -0.0000010706, b: 0.0005158568, c: -0.1126655495, d: 13.6175032, e: -57.96288, min: 40, max: 150 },
} as const;

export type Formula = keyof typeof COEFFICIENTS;
export const FORMULAS = ["men", "women"] as const satisfies readonly Formula[];
export const LIFTS = ["total", "squat", "bench", "deadlift"] as const;
export type Lift = (typeof LIFTS)[number];

/** Bodyweight as the formula uses it: held inside its fitted range. */
export function clampBodyweight(bw: number, formula: Formula): number {
  const { min, max } = COEFFICIENTS[formula];
  return Math.min(max, Math.max(min, bw));
}

/** The denominator of the DOTS formula at a bodyweight (clamped). */
export function denominator(bw: number, formula: Formula): number {
  const { a, b, c, d, e } = COEFFICIENTS[formula];
  const x = clampBodyweight(bw, formula);
  return a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + e;
}

export const dots = (result: number, bw: number, formula: Formula) => (result * 500) / denominator(bw, formula);

/** The result that gives `score` at bodyweight `bw`: the formula run backwards. */
export const resultFor = (score: number, bw: number, formula: Formula) => (score * denominator(bw, formula)) / 500;

export type DotsInput = { bodyweight: number; result: number; formula?: Formula; lift?: Lift };
export type DotsResult =
  | {
      ok: true;
      score: number;
      clamped: boolean;
      /** The same score at five nearby bodyweights in 5 kg steps, kept inside the formula’s range, plus the lifter’s own
          bodyweight (`own`), where the score was worked out. */
      equivalents: { bodyweight: number; result: number; own?: boolean }[];
    }
  | { ok: false; error: string; field: "bw" | "kg" | "f" };

export function score({ bodyweight, result, formula = "men" }: DotsInput): DotsResult {
  if (!FORMULAS.includes(formula)) return { ok: false, error: "Choose which coefficients to use.", field: "f" };
  if (!Number.isFinite(bodyweight) || bodyweight < 30 || bodyweight > 250) return { ok: false, error: "Enter your bodyweight, from 30 to 250 kg.", field: "bw" };
  if (!Number.isFinite(result) || result <= 0 || result > 1500) return { ok: false, error: "Enter the weight lifted, up to 1500 kg.", field: "kg" };
  const s = dots(result, bodyweight, formula);
  const { min, max } = COEFFICIENTS[formula];
  const scored = clampBodyweight(bodyweight, formula);
  // Five 5 kg steps around the bodyweight the score used, shifted to stay inside the range near its edges.
  const start = Math.min(Math.max(Math.round(scored / 5) * 5 - 10, min), max - 20);
  const steps = [0, 5, 10, 15, 20].map((k) => start + k);
  const rows = steps.includes(scored) ? steps : [...steps, scored].sort((a, b) => a - b);
  const equivalents = rows.map((bw) =>
    bw === scored ? { bodyweight: bw, result, own: true } : { bodyweight: bw, result: Math.round(resultFor(s, bw, formula) * 2) / 2 });
  return { ok: true, score: s, clamped: scored !== bodyweight, equivalents };
}
