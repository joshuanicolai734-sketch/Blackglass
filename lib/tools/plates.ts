/**
 * Barbell loading: which plates go on each side for a target weight, in kilograms.
 * All arithmetic is in grams (integers), so 2.5 and 1.25 kg plates never drift through floating point.
 */

export const PLATE_SETS = {
  standard: [25, 20, 15, 10, 5, 2.5, 1.25],
  fractional: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25],
  home: [20, 10, 5, 2.5, 1.25],
} as const;
export type PlateSetId = keyof typeof PLATE_SETS;

export const BARS = [20, 15, 10] as const;
export const COLLAR_KG = 2.5; // a competition collar, each side
export const MAX_KG = 500;

export type PlateCount = { kg: number; count: number };
export type Loading = {
  /** What actually goes on the bar, in kg. */
  total: number;
  /** Plates for ONE side, heaviest first. */
  perSide: PlateCount[];
  plateCount: number;
};
export type PlateResult =
  | { ok: true; exact: boolean; target: number; empty: number; loading: Loading; below: Loading | null; above: Loading | null }
  | { ok: false; error: string };

const g = (kg: number) => Math.round(kg * 1000);
const kgOf = (grams: number) => grams / 1000;

/** Greedy loading of one side, heaviest plate first. Exact for these plate sets, each being a canonical series. */
function loadSide(sideGrams: number, plates: readonly number[]): { used: PlateCount[]; left: number } {
  let left = sideGrams;
  const used: PlateCount[] = [];
  for (const kg of [...plates].sort((a, b) => b - a)) {
    const count = Math.floor(left / g(kg));
    if (count > 0) {
      used.push({ kg, count });
      left -= count * g(kg);
    }
  }
  return { used, left };
}

function loadingFor(sideGrams: number, emptyGrams: number, plates: readonly number[]): Loading {
  const { used, left } = loadSide(sideGrams, plates);
  const sideLoaded = sideGrams - left;
  return { total: kgOf(emptyGrams + 2 * sideLoaded), perSide: used, plateCount: used.reduce((n, p) => n + p.count, 0) };
}

export function parseKg(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const n = typeof value === "number" ? value : Number(value.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Plates per side for `target` kg on a `bar` kg bar, with optional collars.
 * When the exact weight can’t be made, `loading` is the nearest achievable load at or below the target, and
 * `below`/`above` give the nearest loads either side.
 */
export function plateLoading(target: number, bar: number = 20, setId: PlateSetId = "standard", collars = false): PlateResult {
  if (!Number.isFinite(target) || target <= 0) return { ok: false, error: "Enter a target weight in kilograms." };
  if (target > MAX_KG) return { ok: false, error: `Enter ${MAX_KG} kg or less.` };
  const plates = PLATE_SETS[setId] ?? PLATE_SETS.standard;
  const emptyGrams = g(bar) + (collars ? 2 * g(COLLAR_KG) : 0);
  if (g(target) < emptyGrams) return { ok: false, error: `That’s lighter than the empty bar${collars ? " and collars" : ""} (${kgOf(emptyGrams)} kg).` };

  const smallest = g(Math.min(...plates));
  const side = (g(target) - emptyGrams) / 2;
  const downSide = Math.floor(side / smallest) * smallest;
  const down = loadingFor(downSide, emptyGrams, plates);
  const exact = down.total === target;
  const up = exact ? null : loadingFor(downSide + smallest, emptyGrams, plates);
  return {
    ok: true,
    exact,
    target,
    empty: kgOf(emptyGrams),
    loading: down,
    below: exact ? null : down,
    above: up && up.total <= MAX_KG ? up : null,
  };
}

/** The loadable weight nearest to `kg` (ties go to the lighter), never below the empty bar. */
export function nearestLoadable(kg: number, bar: number = 20, setId: PlateSetId = "standard", collars = false): Loading {
  const plates = PLATE_SETS[setId] ?? PLATE_SETS.standard;
  const emptyGrams = g(bar) + (collars ? 2 * g(COLLAR_KG) : 0);
  const smallest = g(Math.min(...plates));
  const side = Math.max(0, (g(kg) - emptyGrams) / 2);
  const lower = Math.floor(side / smallest) * smallest;
  const pick = side - lower > lower + smallest - side ? lower + smallest : lower;
  return loadingFor(pick, emptyGrams, plates);
}

export const formatKg = (kg: number) => `${Number.isInteger(kg) ? kg : Number(kg.toFixed(2))} kg`;
