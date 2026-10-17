/**
 * Blackglass cut protocol, web edition.
 *
 * A port of the cut protocol in the Blackglass Android app (CutProtocol, Physique and Energy, September 2026) for
 * the free calculator on /cut. Pure functions: no DOM, no network, nothing stored. Node runs it directly
 * (`node --test lib/cut/`), and the page bundles it.
 *
 * What it encodes:
 * - Rate 0.5–1.0 % of bodyweight a week, scaled to body fat and recomputed every week, so it slows as you lean
 *   out (Helms et al. 2014; Garthe et al. 2011: 0.7 %/wk lost more fat than 1.4 %/wk and kept more muscle).
 * - Protein anchored to fat-free mass, 2.2 g/kg rising to 2.6 g/kg as you get lean, capped at 3.1 g/kg
 *   (2025 meta-regression; Helms 2014 put the range at 2.3–3.1 g/kg FFM).
 * - At least 10 hard sets per muscle a week, 14 targeted (Roth et al. 2022).
 * - A maintenance week after every 8 weeks of deficit (MATADOR, Byrne 2018). Modest, not magic.
 * - A calorie floor of 1,400 kcal or 22 kcal per kg of bodyweight, whichever is higher.
 *
 * Changes from the app, both on the cautious side:
 * - The projection uses the calories actually prescribed. When the floor raises a target, the planned loss
 *   shrinks to match instead of assuming the full rate.
 * - A self-serve minimum target body fat (10 % male, 18 % female). Below that, someone should be watching.
 */

export type Sex = "male" | "female";

/** Rate bounds, % of bodyweight a week. */
export const RATE_FLOOR_PCT = 0.5;
export const RATE_CEILING_PCT = 1.0;

/** Body-fat levels where the usable rate changes, male-referenced. Women run about 9 points higher. */
export const BF_HIGH_MALE = 25;
export const BF_LEAN_MALE = 10;
export const BF_OFFSET_FEMALE = 9;

/** Protein, g per kg of fat-free mass. */
export const PROTEIN_FFM_BASE = 2.2;
export const PROTEIN_FFM_LEAN = 2.6;
export const PROTEIN_FFM_CEILING = 3.1;

/** Hard sets per muscle a week. */
export const SETS_PER_MUSCLE_MIN = 10;
export const SETS_PER_MUSCLE_TARGET = 14;

/** A maintenance week after this many deficit weeks; the longest run worth doing before a real reset. */
export const WEEKS_BEFORE_BREAK = 8;
export const MAX_DEFICIT_WEEKS = 20;

/** Energy in a kilogram of bodyweight change, as the app uses it. */
export const KCAL_PER_KG = 7700;

/** The calorie floor: never below this, or below 22 kcal per kg of bodyweight. */
export const KCAL_FLOOR = 1400;
export const KCAL_FLOOR_PER_KG = 22;

/** The lowest body fat this self-serve plan will aim for. */
export const MIN_TARGET_BF: Record<Sex, number> = { male: 10, female: 18 };

/** Partition model bounds (app: Physique). */
export const FAT_SHARE_BEST = 0.95;
export const FAT_SHARE_WORST = 0.45;
export const PROTEIN_FLOOR_G_PER_KG = 1.6;
export const PROTEIN_SATURATION_G_PER_KG = 2.2;
export const SUSTAINABLE_MAX_PCT = 1.0;
export const AGGRESSIVE_PCT = 1.5;

/** Day-to-day activity, including training. Multipliers on resting energy (Katch–McArdle). */
export const ACTIVITY = [
  { id: "desk", factor: 1.375, label: "Mostly sitting", detail: "Desk job, under about 7,000 steps, training 3–4 days" },
  { id: "mixed", factor: 1.465, label: "Some time on your feet", detail: "Desk job with walking, or training 5–6 days" },
  { id: "feet", factor: 1.55, label: "On your feet most of the day", detail: "Retail, hospitality, teaching, plus training" },
  { id: "physical", factor: 1.725, label: "Physical work", detail: "Trades, labouring, farm work, plus training" },
] as const;

export type ActivityId = (typeof ACTIVITY)[number]["id"];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const finite = (...v: number[]) => v.every((n) => Number.isFinite(n));

/** Female body fat expressed on the male scale the thresholds use. */
function normalise(bodyFatPct: number, sex: Sex): number {
  return sex === "female" ? bodyFatPct - BF_OFFSET_FEMALE : bodyFatPct;
}

/**
 * The fastest weekly rate that still preserves lean mass, as % of bodyweight. Someone at 30 % body fat can run the
 * ceiling; someone at 10 % cannot.
 */
export function optimalRatePct(bodyFatPct: number, sex: Sex): number {
  const bf = normalise(bodyFatPct, sex);
  if (bf >= BF_HIGH_MALE) return RATE_CEILING_PCT;
  if (bf <= BF_LEAN_MALE) return RATE_FLOOR_PCT;
  const t = (bf - BF_LEAN_MALE) / (BF_HIGH_MALE - BF_LEAN_MALE);
  return RATE_FLOOR_PCT + (RATE_CEILING_PCT - RATE_FLOOR_PCT) * t;
}

/** Protein per kg of fat-free mass for this body fat. */
export function proteinPerKgFfm(bodyFatPct: number, sex: Sex): number {
  const bf = normalise(bodyFatPct, sex);
  let perKg: number;
  if (bf <= BF_LEAN_MALE) perKg = PROTEIN_FFM_LEAN;
  else if (bf >= BF_HIGH_MALE) perKg = PROTEIN_FFM_BASE;
  else perKg = PROTEIN_FFM_BASE + (PROTEIN_FFM_LEAN - PROTEIN_FFM_BASE) * ((BF_HIGH_MALE - bf) / (BF_HIGH_MALE - BF_LEAN_MALE));
  return Math.min(perKg, PROTEIN_FFM_CEILING);
}

/** Daily protein in grams, scaled to fat-free mass and raised as you get leaner. 0 for unusable input. */
export function proteinGrams(weightKg: number, bodyFatPct: number, sex: Sex): number {
  if (!finite(weightKg, bodyFatPct) || weightKg <= 0 || bodyFatPct <= 0 || bodyFatPct >= 75) return 0;
  return weightKg * (1 - bodyFatPct / 100) * proteinPerKgFfm(bodyFatPct, sex);
}

/** Resting energy from lean mass (Katch–McArdle). */
export function restingKcal(leanKg: number): number {
  return 370 + 21.6 * leanKg;
}

/** Estimated maintenance: resting energy times the activity multiplier. */
export function maintenanceKcal(weightKg: number, bodyFatPct: number, factor: number): number {
  return Math.round(restingKcal(weightKg * (1 - bodyFatPct / 100)) * factor);
}

/** The floor every target respects. */
export function calorieFloor(weightKg: number): number {
  return Math.round(Math.max(KCAL_FLOOR, weightKg * KCAL_FLOOR_PER_KG));
}

/**
 * Share of weight lost that comes from fat rather than lean tissue (app: Physique.fatShareOfLoss). Flat up to the
 * sustainable ceiling, then it falls away: this is where the cost of hurrying shows up.
 */
export function fatShareOfLoss(pctPerWeek: number, proteinGPerKg: number, resistanceTrained: boolean): number {
  const rate = Math.abs(pctPerWeek);
  let base: number;
  if (rate <= SUSTAINABLE_MAX_PCT) base = 0.92;
  else if (rate <= AGGRESSIVE_PCT) base = 0.92 - 0.14 * ((rate - SUSTAINABLE_MAX_PCT) / (AGGRESSIVE_PCT - SUSTAINABLE_MAX_PCT));
  else base = 0.78 - 0.28 * Math.min(1, (rate - AGGRESSIVE_PCT) / 1.5);

  const p = Math.max(0, proteinGPerKg);
  let proteinAdj: number;
  if (p >= PROTEIN_SATURATION_G_PER_KG) proteinAdj = 0.03;
  else if (p >= PROTEIN_FLOOR_G_PER_KG) proteinAdj = 0.03 * ((p - PROTEIN_FLOOR_G_PER_KG) / (PROTEIN_SATURATION_G_PER_KG - PROTEIN_FLOOR_G_PER_KG));
  else proteinAdj = -0.1 * (1 - p / PROTEIN_FLOOR_G_PER_KG);

  return clamp(base + proteinAdj + (resistanceTrained ? 0 : -0.18), FAT_SHARE_WORST, FAT_SHARE_BEST);
}

/** Composition after a period at a steady rate (app: Physique.project). Used by the tests to reproduce Garthe. */
export function project(startKg: number, startBfPct: number, kgPerWeek: number, weeks: number, proteinGPerKg: number, trained: boolean) {
  const delta = kgPerWeek * weeks;
  const end = Math.max(1, startKg + delta);
  let fat = startKg * startBfPct / 100;
  let lean = startKg - fat;
  if (delta < 0) {
    const share = fatShareOfLoss((kgPerWeek / startKg) * 100, proteinGPerKg, trained);
    fat -= -delta * share;
    lean -= -delta * (1 - share);
  }
  const essential = end * 0.03;
  if (fat < essential) { lean -= essential - fat; fat = essential; }
  lean = Math.max(1, lean);
  return { weightKg: end, leanKg: lean, fatKg: fat, bodyFatPct: (fat / end) * 100 };
}

/**
 * Daily fat and carbohydrate around a protein target (app: MacroTargets.fromBodyweight). Fat gets the greater of
 * 0.8 g/kg and 25 % of calories; carbohydrate takes what is left, because it is the macro with no minimum. If protein
 * and fat would pass 85 % of calories, fat comes down first (not below 0.6 g/kg), then both scale back.
 */
export function macros(kcal: number, proteinG: number, weightKg: number) {
  let protein = proteinG;
  let fat = Math.max(0.8 * weightKg, (kcal * 0.25) / 9);
  const cap = kcal * 0.85;
  if (protein * 4 + fat * 9 > cap) fat = Math.max(0.6 * weightKg, (cap - protein * 4) / 9);
  if (protein * 4 + fat * 9 > cap) {
    const scale = cap / (protein * 4 + fat * 9);
    protein *= scale;
    fat *= scale;
  }
  const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
  return { proteinG: Math.round(protein), fatG: Math.round(fat), carbsG: Math.round(carbs) };
}

export type Week = {
  /** 1-based. */
  week: number;
  /** A maintenance week. */
  maintenance: boolean;
  /** Reached the target: holding at maintenance. */
  holding: boolean;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  /** Projected bodyweight at the start of the week. */
  weightKg: number;
  /** Projected body fat at the start of the week. */
  bodyFatPct: number;
  /** The protocol's rate for this body fat, % a week. */
  ratePct: number;
  /** The loss the prescribed calories actually allow, kg this week. */
  lossKg: number;
  /** True when the calorie floor raised this week's target above the protocol's. */
  floored: boolean;
  setsPerMuscle: number;
};

export type PlanInput = {
  sex: Sex;
  weightKg: number;
  bodyFatPct: number;
  goalBodyFatPct: number;
  /** Maintenance calories: estimated from activity, or measured from a check-in. */
  maintenanceKcal: number;
  /** Weeks to lay out. The plan stops early after MAX_DEFICIT_WEEKS of deficit. */
  weeks: number;
};

export type Plan = {
  weeks: Week[];
  startKg: number;
  endKg: number;
  startBodyFatPct: number;
  endBodyFatPct: number;
  /** The goal after the self-serve minimum is applied. */
  targetBodyFatPct: number;
  /** True when the requested goal was below the self-serve minimum and was raised to it. */
  goalRaised: boolean;
  deficitWeeks: number;
  maintenanceWeeks: number;
  /** Week the goal is reached, or null when it lies beyond the plan. */
  weeksToGoal: number | null;
  /** True when the calorie floor slowed at least one week. */
  floorSlowed: boolean;
};

/**
 * Builds a week-by-week cut. The rate is recomputed from each week's projected body composition, expenditure falls
 * with lean mass (Katch–McArdle at the activity level implied by the starting maintenance), the floor always wins, and
 * the projection follows the calories actually prescribed. Returns null for unusable input.
 */
export function buildPlan(input: PlanInput): Plan | null {
  const { sex, weightKg, bodyFatPct, goalBodyFatPct, maintenanceKcal: tdee, weeks } = input;
  if (!finite(weightKg, bodyFatPct, goalBodyFatPct, tdee, weeks)) return null;
  if (weightKg < 30 || weightKg > 300 || bodyFatPct <= 3 || bodyFatPct >= 70 || tdee <= 0 || weeks < 1) return null;

  const minimum = MIN_TARGET_BF[sex];
  const target = Math.max(goalBodyFatPct, minimum);
  let w = weightKg;
  let lean = weightKg * (1 - bodyFatPct / 100);
  let fat = weightKg - lean;
  // Expenditure falls as lean mass falls. Activity is held at what the starting figure implies, never below sedentary.
  const activity = Math.max(1.2, tdee / restingKcal(lean));

  const out: Week[] = [];
  let deficitWeeks = 0;
  let maintenanceWeeks = 0;
  let sinceBreak = 0;
  let weeksToGoal: number | null = null;
  let floorSlowed = false;

  for (let i = 1; i <= Math.min(weeks, 52); i++) {
    const bf = (fat / w) * 100;
    const reached = bf <= target + 0.2;
    if (reached && weeksToGoal === null) weeksToGoal = i - 1;
    const maintenance = !reached && sinceBreak >= WEEKS_BEFORE_BREAK;
    if (maintenance) { maintenanceWeeks++; sinceBreak = 0; }

    const rate = optimalRatePct(bf, sex);
    const weekTdee = Math.round(restingKcal(lean) * activity);
    const floor = calorieFloor(w);
    let kcal: number;
    let lossKg = 0;
    let floored = false;
    if (reached || maintenance) {
      kcal = Math.max(weekTdee, floor);
    } else {
      const plannedLoss = (w * rate) / 100;
      const protocolKcal = Math.round(weekTdee - (plannedLoss * KCAL_PER_KG) / 7);
      kcal = Math.max(protocolKcal, floor);
      floored = kcal > protocolKcal;
      if (floored) floorSlowed = true;
      lossKg = Math.max(0, ((weekTdee - kcal) * 7) / KCAL_PER_KG);
      deficitWeeks++;
      sinceBreak++;
    }

    const protein = proteinGrams(w, bf, sex);
    const m = macros(kcal, protein, w);
    out.push({
      week: i, maintenance, holding: reached && !maintenance, kcal, ...m,
      weightKg: w, bodyFatPct: bf, ratePct: rate, lossKg, floored, setsPerMuscle: SETS_PER_MUSCLE_TARGET,
    });

    if (lossKg > 0) {
      const share = fatShareOfLoss((lossKg / w) * 100, protein / Math.max(1, w), true);
      fat = Math.max(w * 0.03, fat - lossKg * share);
      lean = Math.max(1, lean - lossKg * (1 - share));
      w = fat + lean;
    }
    if (deficitWeeks >= MAX_DEFICIT_WEEKS) break;
  }

  return {
    weeks: out, startKg: weightKg, endKg: w, startBodyFatPct: bodyFatPct, endBodyFatPct: (fat / w) * 100,
    targetBodyFatPct: target, goalRaised: goalBodyFatPct < minimum,
    deficitWeeks, maintenanceWeeks, weeksToGoal, floorSlowed,
  };
}

/** Weeks to reach a goal at the protocol's rate, or null if it takes longer than `horizon` weeks. */
export function weeksToGoal(input: Omit<PlanInput, "weeks">, horizon = 40): number | null {
  const p = buildPlan({ ...input, weeks: horizon });
  return p ? p.weeksToGoal : null;
}

/**
 * Body fat from tape measurements, U.S. Navy method (Hodgdon & Beckett 1984), in centimetres. Typically within a
 * few points of a lab measure, which is fine here: the weekly check-in corrects the plan, not this estimate.
 * Returns null when the measurements can't be right.
 */
export function navyBodyFat(sex: Sex, heightCm: number, waistCm: number, neckCm: number, hipCm = 0): number | null {
  if (!finite(heightCm, waistCm, neckCm, hipCm) || heightCm < 120 || heightCm > 230) return null;
  if (neckCm < 20 || waistCm < 40) return null;
  let bf: number;
  if (sex === "male") {
    if (waistCm - neckCm <= 0) return null;
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    if (hipCm < 50 || waistCm + hipCm - neckCm <= 0) return null;
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  }
  return bf >= 3 && bf <= 65 ? bf : null;
}

/**
 * Maintenance measured from a check-in (app: Energy.adaptiveTdee): average intake minus the energy in the weight
 * change. Needs at least 14 days and a plausible result; otherwise null and the estimate stands.
 */
export function measuredMaintenance(avgIntakeKcal: number, startAvgKg: number, endAvgKg: number, days: number): number | null {
  if (!finite(avgIntakeKcal, startAvgKg, endAvgKg, days) || days < 14 || startAvgKg <= 0 || endAvgKg <= 0) return null;
  const tdee = avgIntakeKcal - ((endAvgKg - startAvgKg) * KCAL_PER_KG) / days;
  return tdee >= 1200 && tdee <= 6000 ? Math.round(tdee) : null;
}

export type ScreenAnswers = {
  age: number;
  /** Pregnant, trying to conceive or breastfeeding. */
  pregnancy: boolean;
  /** Any history of an eating disorder or disordered eating. */
  eatingDisorder: boolean;
  /** A medical condition or medication affecting appetite, blood sugar, heart or kidneys. */
  medical: boolean;
  heightCm: number;
  weightKg: number;
};

export type Screen = { ok: true } | { ok: false; reason: "age" | "pregnancy" | "eating" | "medical" | "underweight" | "bmi" };

/**
 * Who this self-serve plan is for. Anyone it screens out is pointed to a GP or a person, never to a workaround.
 * BMI is only used at the edges: below 20 there is nothing to cut, and at 40 and above a GP should be involved.
 */
export function screen(a: ScreenAnswers): Screen {
  if (!finite(a.age) || a.age < 18) return { ok: false, reason: "age" };
  if (a.pregnancy) return { ok: false, reason: "pregnancy" };
  if (a.eatingDisorder) return { ok: false, reason: "eating" };
  if (a.medical) return { ok: false, reason: "medical" };
  const bmi = a.weightKg / Math.pow(a.heightCm / 100, 2);
  if (Number.isFinite(bmi) && bmi < 20) return { ok: false, reason: "underweight" };
  if (Number.isFinite(bmi) && bmi >= 40) return { ok: false, reason: "bmi" };
  return { ok: true };
}
