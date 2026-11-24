// Unit tests for the training tools' arithmetic (lib/tools/). Run with `pnpm check:tools`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatKg, nearestLoadable, parseKg, plateLoading } from "../lib/tools/plates.ts";
import { brzycki, epley, estimate, loadFor, plannedLoad, repsAt, repsToFailure } from "../lib/tools/strength.ts";
import { warmup } from "../lib/tools/warmup.ts";
import { EXAMPLE_PLAN, EXERCISES, GUIDE, MUSCLES, statusFor, weeklyVolume } from "../lib/tools/volume.ts";
import { clampBodyweight, denominator, dots, resultFor, score } from "../lib/tools/dots.ts";
import { adjust, clock, clampSeconds, idle, left, pause, remaining, spoken, start } from "../lib/tools/timer.ts";

const side = (r) => r.loading.perSide.map((p) => `${p.count}×${p.kg}`).join(" ");

test("plates: exact loads on a 20 kg bar", () => {
  const r = plateLoading(100);
  assert.equal(r.ok, true);
  assert.equal(r.exact, true);
  assert.equal(r.loading.total, 100);
  assert.equal(side(r), "1×25 1×15");
  assert.equal(side(plateLoading(142.5)), "2×25 1×10 1×1.25");
  assert.equal(side(plateLoading(20)), "");
  assert.equal(plateLoading(20).loading.plateCount, 0);
  assert.equal(side(plateLoading(62.5, 20, "standard", true)), "1×15 1×2.5 1×1.25", "collars take 2.5 kg a side");
});

test("plates: no floating-point drift with small plates", () => {
  for (let kg = 20; kg <= 300; kg += 2.5) {
    const r = plateLoading(kg);
    assert.equal(r.ok && r.exact, true, `${kg} kg should be exact`);
    const sum = 20 + 2 * r.loading.perSide.reduce((n, p) => n + p.kg * p.count, 0);
    assert.equal(Math.round(sum * 1000), Math.round(kg * 1000), `${kg} kg adds up`);
  }
  const f = plateLoading(60.5, 20, "fractional");
  assert.equal(f.ok && f.exact, true);
  assert.equal(side(f), "1×20 1×0.25");
});

test("plates: impossible targets give the nearest loads either side", () => {
  const r = plateLoading(101);
  assert.equal(r.ok, true);
  assert.equal(r.exact, false);
  assert.equal(r.below.total, 100);
  assert.equal(r.above.total, 102.5);
  assert.equal(r.loading.total, 100, "the shown loading is the nearest without going over");
});

test("plates: bad input is explained, not computed", () => {
  assert.equal(plateLoading(10).ok, false);
  assert.match(plateLoading(10).error, /empty bar/);
  assert.equal(plateLoading(-5).ok, false);
  assert.equal(plateLoading(NaN).ok, false);
  assert.equal(plateLoading(501).ok, false);
  assert.equal(plateLoading(500).ok, true);
});

test("plates: other bars, plate sets and helpers", () => {
  assert.equal(side(plateLoading(55, 15)), "1×20");
  assert.equal(side(plateLoading(50, 20, "home")), "1×10 1×5");
  assert.equal(nearestLoadable(51.2).total, 50);
  assert.equal(nearestLoadable(51.3).total, 52.5);
  assert.equal(nearestLoadable(10).total, 20, "never below the empty bar");
  assert.equal(parseKg("102,5"), 102.5);
  assert.equal(parseKg(" 80 "), 80);
  assert.equal(parseKg("abc"), null);
  assert.equal(formatKg(102.5), "102.5 kg");
  assert.equal(formatKg(1.25), "1.25 kg");
});

test("strength: Epley and Brzycki", () => {
  assert.equal(epley(100, 1), 100);
  assert.equal(epley(100, 5), 100 * (1 + 5 / 30));
  assert.ok(Math.abs(brzycki(100, 10) - 400 / 3) < 1e-9);
  assert.equal(repsToFailure(5, 8), 7);
  assert.equal(loadFor(120, 1), 120);
  assert.ok(Math.abs(repsAt(0.8) - 7.5) < 1e-9);
});

test("strength: estimate with RPE and the tables", () => {
  const r = estimate({ weight: 100, reps: 5, rpe: 8 });
  assert.equal(r.ok, true);
  assert.equal(r.effectiveReps, 7);
  assert.ok(Math.abs(r.e1rm - 100 * (1 + 7 / 30)) < 1e-9);
  assert.equal(r.reliable, true);
  assert.equal(r.percentages[0].percent, 100);
  assert.equal(r.percentages[0].load, 122.5, "123.3 kg rounds to 122.5");
  assert.equal(r.repMaxes.length, 12);
  assert.equal(r.repMaxes[0].load, r.percentages[0].load);
  assert.ok(r.repMaxes.every((m, i, a) => i === 0 || m.load <= a[i - 1].load), "rep maxes fall as reps rise");
  assert.equal(estimate({ weight: 100, reps: 12 }).reliable, false);
  assert.equal(plannedLoad(140, 5, 8), 112.5);
  assert.equal(estimate({ weight: 100, reps: 5, round: 1 }).percentages[0].load, 117);
});

test("strength: bad input is explained", () => {
  assert.equal(estimate({ weight: 0, reps: 5 }).ok, false);
  assert.equal(estimate({ weight: 100, reps: 0 }).ok, false);
  assert.equal(estimate({ weight: 100, reps: 21 }).ok, false);
  assert.equal(estimate({ weight: 100, reps: 2.5 }).ok, false);
  assert.equal(estimate({ weight: 100, reps: 5, rpe: 5 }).ok, false);
  assert.equal(estimate({ weight: 100, reps: 5, rpe: 7.5 }).ok, true);
});

test("warm-up: a ramp of loadable sets below the work weight", () => {
  const r = warmup(140, 5);
  assert.equal(r.ok, true);
  assert.deepEqual(r.sets.map((s) => `${s.load}×${s.reps}`), ["20×10", "55×5", "85×3", "112.5×2", "125×1"]);
  assert.ok(r.sets.every((s) => s.load < 140));
  assert.ok(r.sets.every((s, i, a) => i === 0 || s.load > a[i - 1].load), "every set is heavier than the last");
  assert.equal(warmup(140, 8).sets.length, 4, "no single before higher-rep work");
  assert.deepEqual(warmup(40, 5).sets.map((s) => s.load), [20, 25, 32.5, 35]);
  assert.deepEqual(warmup(22.5, 5).sets.map((s) => s.load), [20], "steps that round onto the bar are dropped");
  assert.equal(warmup(20).ok, false);
  assert.equal(warmup(100, 0).ok, false);
});

test("volume: sets per muscle with half credit for helpers", () => {
  const r = weeklyVolume([{ exercise: "bench-press", sets: "10" }, { exercise: "dip", sets: "4" }]);
  const t = Object.fromEntries(r.totals.map((m) => [m.muscle, m.sets]));
  assert.equal(t.chest, 12);
  assert.equal(t.triceps, 9);
  assert.equal(t.shoulders, 7);
  assert.equal(r.totalSets, 14);
  assert.equal(r.totals.find((m) => m.muscle === "chest").status, "in-range");
  assert.equal(statusFor(0), "none");
  assert.equal(statusFor(GUIDE.low - 0.5), "low");
  assert.equal(statusFor(GUIDE.high + 0.5), "high");
});

test("volume: bad rows are reported and skipped, empty rows ignored", () => {
  const r = weeklyVolume([{ exercise: "nope", sets: "3" }, { exercise: "curl", sets: "0" }, {}, { exercise: "curl", sets: "6" }]);
  assert.equal(r.rows.length, 1);
  assert.equal(r.errors.length, 2);
  assert.match(r.errors[0], /Row 1/);
});

test("volume: the library and the example plan are consistent", () => {
  assert.equal(new Set(EXERCISES.map((e) => e.id)).size, EXERCISES.length, "unique ids");
  for (const e of EXERCISES) {
    assert.ok(e.primary.length > 0, `${e.id} trains something`);
    for (const m of [...e.primary, ...e.secondary]) assert.ok(MUSCLES.includes(m), `${e.id}: ${m}`);
  }
  const r = weeklyVolume(EXAMPLE_PLAN);
  assert.equal(r.errors.length, 0);
  assert.equal(r.rows.length, EXAMPLE_PLAN.length);
});

test("timer: end-time arithmetic survives sleep and pauses", () => {
  assert.equal(clampSeconds(2), 5);
  assert.equal(clampSeconds(99999), 900);
  assert.equal(clock(90), "1:30");
  assert.equal(clock(5), "0:05");
  assert.equal(spoken(90), "1 minute 30 seconds");
  assert.equal(spoken(60), "1 minute");
  assert.equal(remaining(10_500, 10_000), 1, "rounds up, never shows 0 early");
  let s = start(idle(90), 0);
  assert.equal(left(s, 30_000), 60);
  assert.equal(left(s, 200_000), 0, "a phone asleep past the end shows 0, not a negative");
  s = pause(s, 45_000);
  assert.equal(left(s, 1_000_000), 45, "paused time doesn't drain");
  s = start(s, 100_000);
  assert.equal(left(s, 100_000), 45);
  s = adjust(s, 15, 100_000);
  assert.equal(left(s, 100_000), 60);
  s = adjust(s, -100, 100_000);
  assert.equal(left(s, 100_000), 0);
  assert.equal(left(adjust(idle(90), -15, 0), 0), 75);
});

test("dots: matches the formula by hand", () => {
  // Men's coefficients at 100 kg: -109.3 + 739.1293 - 1918.759221 + 2409.00756 - 307.75076 = 812.3268...
  assert.ok(Math.abs(denominator(100, "men") - 812.32678) < 1e-4);
  assert.ok(Math.abs(dots(700, 100, "men") - 430.865) < 0.01);
  // Women's at 60 kg: -13.8754 + 111.4251 - 405.5960 + 817.0502 - 57.9629 = 451.0410...
  assert.ok(Math.abs(denominator(60, "women") - 451.041) < 0.01);
  assert.ok(Math.abs(dots(400, 60, "women") - 443.42) < 0.01);
});

test("dots: bodyweight is held to the fitted range", () => {
  assert.equal(clampBodyweight(250, "men"), 210);
  assert.equal(clampBodyweight(180, "women"), 150);
  assert.equal(clampBodyweight(35, "women"), 40);
  assert.equal(dots(500, 230, "men"), dots(500, 210, "men"));
  const r = score({ bodyweight: 160, result: 500, formula: "women" });
  assert.equal(r.ok && r.clamped, true);
  assert.equal(score({ bodyweight: 83, result: 500 }).clamped, false);
});

test("dots: the score rises with the lift and falls with bodyweight", () => {
  for (const f of ["men", "women"]) {
    let last = Infinity;
    for (let bw = 40; bw <= (f === "men" ? 210 : 150); bw += 5) {
      const s = dots(500, bw, f);
      assert.ok(s < last, `${f} ${bw} kg scores below ${bw - 5} kg`);
      last = s;
    }
  }
  assert.ok(dots(510, 90, "men") > dots(500, 90, "men"));
});

test("dots: equivalents run the formula backwards", () => {
  assert.ok(Math.abs(resultFor(dots(612.5, 93, "men"), 93, "men") - 612.5) < 1e-9);
  const r = score({ bodyweight: 83, result: 600 });
  assert.equal(r.ok, true);
  assert.deepEqual(r.equivalents.map((e) => e.bodyweight), [75, 80, 85, 90, 95]);
  const own = r.equivalents.find((e) => e.bodyweight === 85);
  assert.ok(own.result > 600, "heavier needs more for the same score");
  assert.equal(own.result % 0.5, 0, "rounded to 0.5 kg");
  // Near the edge, only bodyweights inside the range are listed.
  const edge = score({ bodyweight: 148, result: 400, formula: "women" });
  assert.deepEqual(edge.equivalents.map((e) => e.bodyweight), [140, 145, 150]);
});

test("dots: bad input gets a plain message", () => {
  assert.equal(score({ bodyweight: NaN, result: 500 }).ok, false);
  assert.equal(score({ bodyweight: 20, result: 500 }).ok, false);
  assert.equal(score({ bodyweight: 80, result: 0 }).ok, false);
  assert.equal(score({ bodyweight: 80, result: 2000 }).ok, false);
  assert.equal(score({ bodyweight: 80, result: 500, formula: "other" }).ok, false);
});
