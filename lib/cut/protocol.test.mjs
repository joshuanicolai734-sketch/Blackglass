// Tests for the cut protocol against the evidence it claims to encode. Run: pnpm test
// The load-bearing test reproduces Garthe et al. (2011) through the partition model: if the slower route
// doesn't end leaner, the protocol is arithmetic with citations attached, not evidence-based.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPlan, calorieFloor, macros, measuredMaintenance, MIN_TARGET_BF, navyBodyFat, optimalRatePct, project,
  PROTEIN_FFM_CEILING, proteinGrams, RATE_CEILING_PCT, RATE_FLOOR_PCT, screen, SETS_PER_MUSCLE_MIN,
  WEEKS_BEFORE_BREAK, weeksToGoal,
} from "./protocol.ts";

const plan = (over = {}) => buildPlan({
  sex: "male", weightKg: 95, bodyFatPct: 28, goalBodyFatPct: 12, maintenanceKcal: 2900, weeks: 26, ...over,
});

test("faster is not better for fat loss (Garthe 2011)", () => {
  const slow = project(80, 20, -80 * 0.007, 16, 2.2, true);
  const fast = project(80, 20, -80 * 0.014, 8, 2.2, true);
  assert.ok(Math.abs(slow.weightKg - fast.weightKg) < 0.5, "same total weight lost");
  assert.ok(slow.leanKg > fast.leanKg, "the slower route keeps more lean mass");
  assert.ok(slow.bodyFatPct < fast.bodyFatPct, "and ends leaner");
});

test("rate scales with body fat and stays inside 0.5–1.0 %/wk", () => {
  assert.equal(optimalRatePct(30, "male"), RATE_CEILING_PCT);
  assert.equal(optimalRatePct(9, "male"), RATE_FLOOR_PCT);
  const mid = optimalRatePct(18, "male");
  assert.ok(mid > RATE_FLOOR_PCT && mid < RATE_CEILING_PCT);
  for (let bf = 5; bf <= 45; bf++) {
    for (const sex of ["male", "female"]) {
      const r = optimalRatePct(bf, sex);
      assert.ok(r >= RATE_FLOOR_PCT && r <= RATE_CEILING_PCT, `${sex} ${bf}%: ${r}`);
    }
  }
});

test("rate is sex-adjusted: equal leanness, equal rate", () => {
  assert.ok(Math.abs(optimalRatePct(20, "male") - optimalRatePct(29, "female")) < 0.02);
  assert.ok(optimalRatePct(20, "female") < optimalRatePct(20, "male"));
});

test("protein scales to lean mass, rises with leanness, never passes 3.1 g/kg FFM", () => {
  const fatter = proteinGrams(95, 30, "male") / (95 * 0.7);
  const leaner = proteinGrams(80, 10, "male") / (80 * 0.9);
  assert.ok(leaner > fatter);
  assert.ok(fatter >= 2.0 && fatter <= 2.8);
  assert.ok(leaner >= 2.3 && leaner <= 3.1);
  for (let kg = 45; kg <= 130; kg += 5) {
    for (let bf = 5; bf <= 45; bf += 5) {
      for (const sex of ["male", "female"]) {
        assert.ok(proteinGrams(kg, bf, sex) <= kg * (1 - bf / 100) * PROTEIN_FFM_CEILING + 0.01);
      }
    }
  }
  assert.equal(proteinGrams(0, 20, "male"), 0);
  assert.equal(proteinGrams(80, 0, "male"), 0);
});

test("the plan decelerates as it leans out", () => {
  const p = plan();
  const loss = p.weeks.filter((w) => w.lossKg > 0).map((w) => w.lossKg);
  assert.ok(loss[loss.length - 1] < loss[0], `${loss[0]} -> ${loss[loss.length - 1]}`);
  for (let i = 1; i < p.weeks.length; i++) {
    assert.ok(p.weeks[i].bodyFatPct <= p.weeks[i - 1].bodyFatPct + 1e-9, "body fat never rises");
  }
});

test("a maintenance week after every 8 deficit weeks", () => {
  const p = plan();
  assert.ok(p.maintenanceWeeks >= 1);
  assert.equal(p.weeks[WEEKS_BEFORE_BREAK].maintenance, true, "week 9 is maintenance");
  let run = 0;
  for (const w of p.weeks) {
    run = w.maintenance || w.holding ? 0 : run + 1;
    assert.ok(run <= WEEKS_BEFORE_BREAK, `week ${w.week}: ${run} straight deficit weeks`);
  }
});

test("maintenance weeks eat more than the week before and hold weight", () => {
  const p = plan();
  for (let i = 1; i < p.weeks.length; i++) {
    if (!p.weeks[i].maintenance) continue;
    assert.ok(p.weeks[i].kcal > p.weeks[i - 1].kcal);
    assert.equal(p.weeks[i].lossKg, 0);
    if (p.weeks[i + 1]) assert.ok(Math.abs(p.weeks[i + 1].weightKg - p.weeks[i].weightKg) < 1e-9);
  }
});

test("the calorie floor holds every week of every plan", () => {
  for (let kg = 50; kg <= 140; kg += 10) {
    for (let bf = 12; bf <= 40; bf += 4) {
      for (const sex of ["male", "female"]) {
        for (const tdee of [1600, 2200, 2800, 3400]) {
          const p = buildPlan({ sex, weightKg: kg, bodyFatPct: bf, goalBodyFatPct: 10, maintenanceKcal: tdee, weeks: 20 });
          assert.ok(p, `${kg}/${bf}/${sex}/${tdee}`);
          for (const w of p.weeks) {
            assert.ok(w.kcal >= 1400, `1400 floor, ${kg}/${bf}/${sex}/${tdee} wk${w.week}`);
            assert.ok(w.kcal >= calorieFloor(w.weightKg), `22 kcal/kg floor wk${w.week}`);
          }
        }
      }
    }
  }
});

test("the projection follows the calories actually prescribed", () => {
  // Heavy enough that the 22 kcal/kg floor binds: the projected loss must shrink to match.
  const p = buildPlan({ sex: "male", weightKg: 120, bodyFatPct: 34, goalBodyFatPct: 20, maintenanceKcal: 3200, weeks: 8 });
  assert.ok(p.floorSlowed);
  for (let i = 0; i < p.weeks.length - 1; i++) {
    const w = p.weeks[i];
    assert.ok(Math.abs(p.weeks[i + 1].weightKg - (w.weightKg - w.lossKg)) < 1e-9, `week ${w.week} weight bookkeeping`);
    if (w.floored) assert.ok(w.lossKg < (w.weightKg * w.ratePct) / 100, "floored weeks lose less than the rate");
    assert.ok((w.lossKg / w.weightKg) * 100 <= RATE_CEILING_PCT + 1e-9, "never faster than the ceiling");
  }
});

test("the self-serve minimum body fat holds", () => {
  const m = buildPlan({ sex: "male", weightKg: 80, bodyFatPct: 14, goalBodyFatPct: 4, maintenanceKcal: 2700, weeks: 40 });
  assert.equal(m.targetBodyFatPct, MIN_TARGET_BF.male);
  assert.equal(m.goalRaised, true);
  assert.ok(m.endBodyFatPct >= MIN_TARGET_BF.male - 0.5);
  const f = buildPlan({ sex: "female", weightKg: 65, bodyFatPct: 27, goalBodyFatPct: 10, maintenanceKcal: 2100, weeks: 40 });
  assert.equal(f.targetBodyFatPct, MIN_TARGET_BF.female);
  assert.ok(f.endBodyFatPct >= MIN_TARGET_BF.female - 0.5);
});

test("an out-of-reach goal is reported, not faked", () => {
  const p = plan({ weeks: 12 });
  assert.equal(p.weeksToGoal, null);
  assert.ok(p.endBodyFatPct > 12);
  const near = weeksToGoal({ sex: "male", weightKg: 82, bodyFatPct: 16, goalBodyFatPct: 13, maintenanceKcal: 2700 });
  assert.ok(near !== null && near > 0 && near < 20, `weeks to goal ${near}`);
});

test("training volume meets the retention threshold every week", () => {
  for (const w of plan().weeks) assert.ok(w.setsPerMuscle >= SETS_PER_MUSCLE_MIN);
});

test("macros: carbs never negative, protein and fat within 85 % of calories", () => {
  for (const kcal of [1400, 1800, 2400, 3200]) {
    for (const kg of [50, 80, 110, 140]) {
      for (const protein of [80, 150, 220]) {
        const m = macros(kcal, protein, kg);
        assert.ok(m.carbsG >= 0);
        assert.ok(m.proteinG * 4 + m.fatG * 9 <= kcal * 0.85 + 13, `${kcal}/${kg}/${protein}`);
      }
    }
  }
  const typical = macros(2090, 150, 95);
  assert.equal(typical.proteinG, 150);
  assert.equal(typical.fatG, 76);
});

test("Navy tape estimate matches the published formula", () => {
  const m = navyBodyFat("male", 178, 86, 38);
  assert.ok(m > 16 && m < 18.5, `male ${m}`);
  const f = navyBodyFat("female", 165, 72, 33, 98);
  assert.ok(f > 25.5 && f < 28.5, `female ${f}`);
  assert.equal(navyBodyFat("male", 178, 30, 38), null, "waist under neck");
  assert.equal(navyBodyFat("female", 165, 72, 33), null, "women need hips");
  assert.equal(navyBodyFat("male", 90, 86, 38), null, "implausible height");
});

test("measured maintenance from a check-in", () => {
  assert.equal(measuredMaintenance(2000, 82.0, 81.3, 14), 2385);
  assert.equal(measuredMaintenance(2400, 82.0, 82.5, 14), 2125);
  assert.equal(measuredMaintenance(2400, 82, 82, 10), null, "under 14 days");
  assert.equal(measuredMaintenance(900, 82, 82, 14), null, "implausible");
});

test("screen: who this self-serve plan is for", () => {
  const base = { age: 30, pregnancy: false, eatingDisorder: false, medical: false, heightCm: 178, weightKg: 85 };
  assert.deepEqual(screen(base), { ok: true });
  assert.equal(screen({ ...base, age: 17 }).reason, "age");
  assert.equal(screen({ ...base, pregnancy: true }).reason, "pregnancy");
  assert.equal(screen({ ...base, eatingDisorder: true }).reason, "eating");
  assert.equal(screen({ ...base, medical: true }).reason, "medical");
  assert.equal(screen({ ...base, weightKg: 60 }).reason, "underweight");
  assert.equal(screen({ ...base, weightKg: 130 }).reason, "bmi");
});

test("unusable input returns null", () => {
  assert.equal(buildPlan({ sex: "male", weightKg: 0, bodyFatPct: 20, goalBodyFatPct: 12, maintenanceKcal: 2600, weeks: 8 }), null);
  assert.equal(buildPlan({ sex: "male", weightKg: 80, bodyFatPct: 0, goalBodyFatPct: 12, maintenanceKcal: 2600, weeks: 8 }), null);
  assert.equal(buildPlan({ sex: "male", weightKg: 80, bodyFatPct: 20, goalBodyFatPct: 12, maintenanceKcal: 0, weeks: 8 }), null);
  assert.equal(buildPlan({ sex: "male", weightKg: 80, bodyFatPct: 20, goalBodyFatPct: 12, maintenanceKcal: 2600, weeks: 0 }), null);
  assert.equal(buildPlan({ sex: "male", weightKg: Number.NaN, bodyFatPct: 20, goalBodyFatPct: 12, maintenanceKcal: 2600, weeks: 8 }), null);
});
