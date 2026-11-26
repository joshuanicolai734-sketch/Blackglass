/**
 * Warm-up sets for a working weight: a standard ramp from the empty bar to about 90% of the work weight, with fewer
 * reps as the load rises. Each set is rounded to a weight the plates can actually make.
 */
import { MAX_KG, nearestLoadable, type PlateCount, type PlateSetId } from "./plates";

export type WarmupSet = { load: number; reps: number; percent: number; perSide: PlateCount[]; bar: boolean };
export type WarmupResult = { ok: true; sets: WarmupSet[]; work: number } | { ok: false; error: string };

/** The ramp: fraction of the work weight → reps. Heavy, low-rep work gets the extra single near the top. */
const RAMP: [number, number][] = [
  [0.4, 5],
  [0.6, 3],
  [0.8, 2],
];
const TOP_SINGLE: [number, number] = [0.9, 1];

export function warmup(work: number, workReps = 5, bar: number = 20, setId: PlateSetId = "standard"): WarmupResult {
  if (!Number.isFinite(work) || work <= 0 || work > MAX_KG) return { ok: false, error: `Enter your working weight, up to ${MAX_KG} kg.` };
  if (work <= bar) return { ok: false, error: `Your working weight is the empty bar (${bar} kg) or lighter, so start with it.` };
  if (!Number.isInteger(workReps) || workReps < 1 || workReps > 20) return { ok: false, error: "Enter the reps of your work sets, from 1 to 20." };

  const steps = workReps <= 5 ? [...RAMP, TOP_SINGLE] : RAMP;
  const sets: WarmupSet[] = [{ load: bar, reps: 10, percent: Math.round((bar / work) * 100), perSide: [], bar: true }];
  for (const [fraction, reps] of steps) {
    const loading = nearestLoadable(work * fraction, bar, setId);
    const last = sets[sets.length - 1];
    // Skip a step that rounds onto the previous one, or that would be as heavy as the work itself.
    if (loading.total <= last.load || loading.total >= work) continue;
    sets.push({ load: loading.total, reps, percent: Math.round((loading.total / work) * 100), perSide: loading.perSide, bar: false });
  }
  return { ok: true, sets, work };
}
