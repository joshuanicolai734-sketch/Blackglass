/**
 * Weekly volume per muscle: hard sets from a week of training, counted per muscle group.
 * A set counts 1 for the muscles an exercise mainly trains and 0.5 for the ones it helps with.
 * The guide range: Schoenfeld, Ogborn & Krieger (2017) found more growth from 10 or more hard sets per muscle a week
 * than from fewer; about 20 is a common coaching upper end, not a finding of that study. A starting point, not a rule.
 */

export const MUSCLES = ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "core"] as const;
export type Muscle = (typeof MUSCLES)[number];
export const MUSCLE_NAMES: Record<Muscle, string> = {
  chest: "Chest", back: "Back", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
  quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes", calves: "Calves", core: "Core",
};
export const GUIDE = { low: 10, high: 20 } as const;
export const MAX_ROWS = 10;
export const MAX_SETS = 40;

type Exercise = { id: string; name: string; primary: Muscle[]; secondary: Muscle[] };

export const EXERCISES: Exercise[] = [
  { id: "back-squat", name: "Back squat", primary: ["quads", "glutes"], secondary: ["core"] },
  { id: "front-squat", name: "Front squat", primary: ["quads"], secondary: ["glutes", "core"] },
  { id: "leg-press", name: "Leg press", primary: ["quads"], secondary: ["glutes"] },
  { id: "split-squat", name: "Split squat or lunge", primary: ["quads", "glutes"], secondary: [] },
  { id: "leg-extension", name: "Leg extension", primary: ["quads"], secondary: [] },
  { id: "deadlift", name: "Deadlift", primary: ["glutes", "hamstrings"], secondary: ["back", "quads", "core"] },
  { id: "romanian-deadlift", name: "Romanian deadlift", primary: ["hamstrings"], secondary: ["glutes", "back"] },
  { id: "hip-thrust", name: "Hip thrust", primary: ["glutes"], secondary: ["hamstrings"] },
  { id: "leg-curl", name: "Leg curl", primary: ["hamstrings"], secondary: [] },
  { id: "calf-raise", name: "Calf raise", primary: ["calves"], secondary: [] },
  { id: "bench-press", name: "Bench press", primary: ["chest"], secondary: ["triceps", "shoulders"] },
  { id: "incline-press", name: "Incline press", primary: ["chest"], secondary: ["shoulders", "triceps"] },
  { id: "push-up", name: "Push-up", primary: ["chest"], secondary: ["triceps", "shoulders"] },
  { id: "dip", name: "Dip", primary: ["triceps"], secondary: ["chest", "shoulders"] },
  { id: "overhead-press", name: "Overhead press", primary: ["shoulders"], secondary: ["triceps"] },
  { id: "lateral-raise", name: "Lateral raise", primary: ["shoulders"], secondary: [] },
  { id: "rear-delt", name: "Face pull or rear-delt fly", primary: ["shoulders"], secondary: ["back"] },
  { id: "pull-up", name: "Pull-up or chin-up", primary: ["back"], secondary: ["biceps"] },
  { id: "lat-pulldown", name: "Lat pulldown", primary: ["back"], secondary: ["biceps"] },
  { id: "row", name: "Row (any kind)", primary: ["back"], secondary: ["biceps", "shoulders"] },
  { id: "curl", name: "Biceps curl", primary: ["biceps"], secondary: [] },
  { id: "triceps-extension", name: "Triceps isolation", primary: ["triceps"], secondary: [] },
  { id: "plank", name: "Plank or ab wheel", primary: ["core"], secondary: [] },
  { id: "leg-raise", name: "Hanging leg raise", primary: ["core"], secondary: [] },
];
const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));
export const exerciseName = (id: string) => BY_ID.get(id)?.name ?? null;

export type PlanRow = { exercise: string; sets: number };
export type MuscleTotal = { muscle: Muscle; name: string; sets: number; status: "none" | "low" | "in-range" | "high" };
export type VolumeResult = { rows: PlanRow[]; totals: MuscleTotal[]; totalSets: number; errors: string[] };

export function statusFor(sets: number): MuscleTotal["status"] {
  if (sets === 0) return "none";
  if (sets < GUIDE.low) return "low";
  if (sets > GUIDE.high) return "high";
  return "in-range";
}

/** Rows with an unknown exercise or an invalid set count are dropped and reported; empty rows are ignored. */
export function weeklyVolume(rows: { exercise?: string; sets?: string | number }[]): VolumeResult {
  const clean: PlanRow[] = [];
  const errors: string[] = [];
  rows.slice(0, MAX_ROWS).forEach((row, i) => {
    const exercise = (row.exercise ?? "").trim();
    const raw = typeof row.sets === "number" ? String(row.sets) : (row.sets ?? "").trim();
    if (!exercise && !raw) return;
    if (!BY_ID.has(exercise)) return void errors.push(`Row ${i + 1}: choose an exercise.`);
    const sets = Number(raw);
    if (!Number.isInteger(sets) || sets < 1 || sets > MAX_SETS) return void errors.push(`Row ${i + 1}: enter 1 to ${MAX_SETS} sets.`);
    clean.push({ exercise, sets });
  });
  const totals = new Map<Muscle, number>(MUSCLES.map((m) => [m, 0]));
  for (const { exercise, sets } of clean) {
    const e = BY_ID.get(exercise)!;
    e.primary.forEach((m) => totals.set(m, totals.get(m)! + sets));
    e.secondary.forEach((m) => totals.set(m, totals.get(m)! + sets / 2));
  }
  return {
    rows: clean,
    totals: MUSCLES.map((muscle) => ({ muscle, name: MUSCLE_NAMES[muscle], sets: totals.get(muscle)!, status: statusFor(totals.get(muscle)!) })),
    totalSets: clean.reduce((n, r) => n + r.sets, 0),
    errors,
  };
}

/** A week to start from when the page opens empty: a simple upper/lower split. */
export const EXAMPLE_PLAN: PlanRow[] = [
  { exercise: "back-squat", sets: 6 },
  { exercise: "romanian-deadlift", sets: 6 },
  { exercise: "bench-press", sets: 8 },
  { exercise: "row", sets: 8 },
  { exercise: "overhead-press", sets: 4 },
  { exercise: "pull-up", sets: 4 },
  { exercise: "curl", sets: 4 },
  { exercise: "calf-raise", sets: 4 },
];
