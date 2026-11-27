// Worked examples for the app tools spec (README.md in this folder), computed with the website's shared maths in
// lib/tools/. Synthetic numbers only. Run from the repository root:
//   node --experimental-strip-types --no-warnings --import ./tests/ts-resolve.mjs studio/experiments/app-tools-spec/examples.mjs
import { plateLoading } from "../../../lib/tools/plates.ts";
import { warmup } from "../../../lib/tools/warmup.ts";
import { estimate, plannedLoad } from "../../../lib/tools/strength.ts";
import { adjust, clock, idle, left, start } from "../../../lib/tools/timer.ts";

const side = (perSide) => perSide.map((p) => `${p.count}×${p.kg}`).join(" + ") || "empty bar";

// 1. Warm-up for a synthetic working set: back squat 100 kg × 5, 20 kg bar, standard plates.
const w = warmup(100, 5, 20, "standard");
console.log("Warm-up, 100 kg × 5:");
for (const s of w.sets) console.log(`  ${s.load} kg × ${s.reps} (${s.percent}%): ${side(s.perSide)}`);

// 2. Plates for the working set, and for a load the plates can't make exactly.
for (const kg of [100, 101]) {
  const r = plateLoading(kg, 20, "standard", false);
  console.log(`Plates for ${kg} kg: ${side(r.loading.perSide)} per side, exact=${r.exact}` +
    (r.exact ? "" : `, below ${r.below.total} kg, above ${r.above?.total} kg`));
}

// 3. Next-set load from a logged set: 100 kg × 5 at RPE 8, then 3 reps at RPE 8.
const e = estimate({ weight: 100, reps: 5, rpe: 8, round: 2.5 });
console.log(`e1RM from 100 × 5 @ RPE 8: ${e.e1rm.toFixed(1)} kg (reliable=${e.reliable})`);
console.log(`Planned 3 @ RPE 8: ${plannedLoad(e.e1rm, 3, 8, 2.5)} kg`);

// 4. Rest timer: 3:00 preset, started at t=0, +30 s at 60 s, read at 120 s.
let t = start(idle(180), 0);
t = adjust(t, 30, 60_000);
console.log(`Rest: ${clock(left(t, 120_000))} left at 2:00 after +30 s`);
