// Run with Node 22.13+: node --experimental-strip-types scripts/check-experience.mjs
import assert from "node:assert/strict";
import { createSession, readSession, recordSet, sessionSummary, validSet } from "../lib/experience/session.ts";

const initial = createSession();
assert.deepEqual(sessionSummary(initial), { completed: 0, reps: 0, volume: 0, total: 9 });
const first = recordSet(initial, 0, 0, 8, 20, 1000);
assert.deepEqual(sessionSummary(first), { completed: 1, reps: 8, volume: 160, total: 9 });
assert.equal(first.restUntil, 61_000);
assert.equal(initial.sets[0][0].done, false, "Logging must not mutate the prior session");
assert.equal(recordSet(first, 0, 0, 10, 40, 2000), first, "Duplicate submission must not add volume");
assert.equal(recordSet(initial, 99, 0, 8, 20), initial, "Invalid exercise must be ignored");
assert.equal(recordSet(initial, 0, 99, 8, 20), initial, "Invalid set must be ignored");
assert.equal(recordSet(initial, 0, 0, 0, 20), initial, "Invalid reps must not be stored");
assert.equal(validSet(1, 0), true);
assert.equal(validSet(100, 500), true);
assert.equal(validSet(8, 20.25), true);
for (const [reps, weight] of [[NaN, 20], [2.5, 20], [2, -1], [2, 0.1], [101, 20], [2, Infinity]]) {
  assert.equal(validSet(reps, weight), false);
}
assert.deepEqual(readSession("broken"), initial);
assert.deepEqual(readSession("null"), initial);
assert.deepEqual(readSession(JSON.stringify({ ...initial, active: 99 })), initial);
assert.deepEqual(readSession(JSON.stringify({ ...initial, sets: [] })), initial);
assert.deepEqual(readSession(JSON.stringify({ ...initial, restDuration: 1 })), initial);
assert.deepEqual(readSession(JSON.stringify({ ...initial, restUntil: 100_000 }), 0), initial);
assert.deepEqual(readSession(JSON.stringify(first), 2000), first);
assert.equal(readSession(JSON.stringify(first), 62_000).restUntil, 0, "Expired rest must not restart after reload");
let full = initial;
for (let exercise = 0; exercise < 3; exercise++) {
  for (let set = 0; set < 3; set++) full = recordSet(full, exercise, set, 10, 10, 1000);
}
assert.deepEqual(sessionSummary(full), { completed: 9, reps: 90, volume: 900, total: 9 });
assert.equal(full.restUntil, 0, "The final set must stop the rest timer");
assert.equal(sessionSummary(recordSet(initial, 2, 0, 10, 0)).volume, 0, "Bodyweight must not be invented in added-load volume");
console.log("Experience session checks passed: validation, immutable logging, duplicate protection, storage recovery, timer deadlines and completion totals.");
