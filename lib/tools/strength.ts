/**
 * Strength estimates from a set you’ve done: estimated one-rep max (e1RM), loads for other rep targets, and RPE.
 *
 * - Epley (1985): 1RM = w × (1 + r / 30). The headline estimate.
 * - Brzycki (1993): 1RM = w × 36 / (37 − r). Shown alongside, so the spread between methods is visible.
 * - RPE uses the reps-in-reserve scale (Zourdos et al. 2016): RPE 10 = no reps left, 9 = one, 8 = two, and so on.
 *   A set of r reps at RPE x counts as r + (10 − x) reps to failure.
 *
 * Estimates are most reliable from sets of about 10 reps or fewer, taken close to failure.
 */

export const MAX_REPS = 20;
export const RELIABLE_REPS = 10;
export const RPE_STEPS = [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6] as const;
export const ROUNDINGS = [2.5, 1, 0.5, 5] as const;

/** Reps to failure that a set represents, given its RPE (10 when not given). */
export const repsToFailure = (reps: number, rpe: number = 10) => reps + (10 - rpe);

export function epley(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

export function brzycki(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (36 / (37 - reps));
}

/** Load for `reps` reps at `rpe`, from an e1RM (Epley, inverted). */
export function loadFor(e1rm: number, reps: number, rpe: number = 10): number {
  const r = repsToFailure(reps, rpe);
  return r <= 1 ? e1rm : e1rm / (1 + r / 30);
}

/** Reps to failure at a fraction of e1RM (Epley, inverted), e.g. 0.8 → 7.5. */
export const repsAt = (fraction: number) => (fraction >= 1 ? 1 : 30 * (1 / fraction - 1));

export const roundTo = (kg: number, step: number) => Math.round(kg / step) * step;

export type StrengthInput = { weight: number; reps: number; rpe?: number; round?: number };
export type StrengthResult =
  | {
      ok: true;
      e1rm: number;
      brzycki: number | null;
      effectiveReps: number;
      reliable: boolean;
      percentages: { percent: number; load: number; reps: number }[];
      repMaxes: { reps: number; load: number }[];
    }
  | { ok: false; error: string };

export function estimate({ weight, reps, rpe = 10, round = 2.5 }: StrengthInput): StrengthResult {
  if (!Number.isFinite(weight) || weight <= 0 || weight > 500) return { ok: false, error: "Enter the weight you lifted, up to 500 kg." };
  if (!Number.isInteger(reps) || reps < 1 || reps > MAX_REPS) return { ok: false, error: `Enter the reps you did, from 1 to ${MAX_REPS}.` };
  if (!RPE_STEPS.includes(rpe as (typeof RPE_STEPS)[number])) return { ok: false, error: "Choose an RPE from 6 to 10." };
  const step = ROUNDINGS.includes(round as (typeof ROUNDINGS)[number]) ? round : 2.5;
  const effectiveReps = repsToFailure(reps, rpe);
  const e1rm = epley(weight, effectiveReps);
  const b = effectiveReps < 37 ? brzycki(weight, effectiveReps) : null;
  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50].map((percent) => ({
    percent,
    load: roundTo((e1rm * percent) / 100, step),
    reps: Math.max(1, Math.round(repsAt(percent / 100) * 2) / 2),
  }));
  const repMaxes = Array.from({ length: 12 }, (_, i) => ({ reps: i + 1, load: roundTo(loadFor(e1rm, i + 1), step) }));
  return { ok: true, e1rm, brzycki: b, effectiveReps, reliable: effectiveReps <= RELIABLE_REPS, percentages, repMaxes };
}

/** The load to use for a planned set: `reps` reps at `rpe`, from an e1RM, rounded to `step`. */
export function plannedLoad(e1rm: number, reps: number, rpe: number, step: number = 2.5): number {
  return roundTo(loadFor(e1rm, reps, rpe), step);
}
