# App tools spec (proposal)

**Status: proposal, not built.** Docs only. Nothing here describes the Android app as it is today, beyond what the three
public screens in `public/assets/` show. Every number is synthetic.

- **Approved by:** the Claude lead on issue #7, 26 Nov 2026 (proposal 2 of Claude Builder's 24 Nov comment).
- **Base:** PR #9 head `c185665`.
- **Owned paths:** this folder only.
- **Reviewers:** the Claude critic, then the Claude lead.

## Why

The website has six free training tools at `/tools` (PR #9). Three of them are most useful mid-session, with the phone
on the bench: the **plate calculator**, the **warm-up builder** and the **rest timer**. This spec says where they could
sit in the app, how they should behave, and how the app can stay in step with the website's maths. It's ready for
whoever builds them once the Android source is reachable. That source isn't in this public repository and must never
be added here.

## What the public screens show (seen)

These come from `public/assets/` only. They're the limit of what this spec may describe as existing.

| Screen | File | What it shows |
| --- | --- | --- |
| Today | `dashboard.webp` | A "Session in progress" card: "MON · Push A", "05 exercises / 12 sets", **Resume workout**, "Preview session +". Below it, a Nutrition card. |
| Train | `program.webp` | Heading "Train". Sub-tabs **Plan · Library · Build · Generate · Forge**. A lime **Start today — WED · Legs A** button. An active programme, "LEAN / 55 · Strength & aesthetics", "6 days per week", "Week 1 of 6 · Build", with a list of six days. |
| Exercise guide | `movement.webp` | **Back**, then tabs **Movement · Muscles · My Record**. "Ab Wheel Rollout", **Add to my program**, an animated movement with Brace · Reach · Return phases. |

**Navigation differs between sources.** The screens show a bottom bar of Today · Train · Fuel · Progress · More. The
owner decision of 4 Oct 2026 is **Today · Train · Learn · Fuel · More, with Progress inside More**. This spec follows
the owner decision and doesn't depend on either: everything below lives inside Train or a session.

**Not seen:** the workout session screen that **Resume workout** and **Start today** open. What Build, Generate,
Forge and My Record do is also unverified (see `docs/DIRECTION.md`). Where this spec places a tool inside a session,
that's a proposal for a screen nobody in this repository has seen. Check it against the Android source first.

## Proposed placement

Read these as "if the session screen has sets with a load and reps, then…". The lead or Josh decides.

### 1. Warm-up ramp: before the first working set of a barbell lift

- **Where:** a collapsed "Warm-up" row above the first working set of a barbell exercise in a session. It opens to
  the ramp. The same ramp could appear in Train → Plan on a day's detail, read-only.
- **Input:** the first working set's load and reps, the bar (20, 15 or 10 kg) and the plate set. No typing is needed if the
  session already knows the working set.
- **Output:** the same ramp as `/tools/warm-up`: the empty bar × 10, then about 40 % × 5, 60 % × 3, 80 % × 2, and
  90 % × 1 when the work is 5 reps or fewer. Each set is rounded to a load the plates can make, with the plates per side.
- **Done:** warm-up sets are ticked off but **don't count** as working sets. They aren't in "05 exercises / 12 sets".
- **Hidden** for bodyweight and machine exercises (the Ab Wheel Rollout, for example) and when the work is the empty bar
  or lighter. In that case `warmup()` already returns the message "start with it".

### 2. Plates: on every barbell set

- **Where:** a small "plates" line under the load of each barbell set, for example "25 + 15 a side". Tapping it opens the
  full breakdown in a bottom sheet with the bar, collars and plate set.
- **When the load can't be made exactly** (101 kg on standard plates): show what it can be, "100 kg or 102.5 kg", as
  two buttons that set the load. Never round the logged load without asking.
- **Settings, once per person:** bar weight, plate set (standard, fractional or home) and collars. These match the
  website's options, so the maths is identical.

### 3. Rest timer: starts when a set is ticked off

- **Where:** a bar pinned above the bottom navigation during a session. It shows the countdown, **−15 s**, **+15 s**
  and **Skip**. Tapping it opens a full-screen countdown that can be read from the bench.
- **Default rest:** per exercise if the programme sets one. Otherwise one of the website's presets (1:00, 1:30, 2:00,
  3:00, 4:00), chosen once in settings. The 5 s to 15 min range matches `clampSeconds()`.
- **Keeps time correctly:** store the **end time**, not a ticking count (as `lib/tools/timer.ts` does). Then the
  timer is right after the screen locks, the app is backgrounded or the process is killed. On Android, the end should be a
  scheduled notification or alarm, so it fires with the app closed.
- **At the end:** a sound and a vibration, each of which can be turned off. A notification fires if the app isn't in front. Screen
  readers hear the time left at 60, 30 and 10 seconds and at the end (`ANNOUNCE_AT`), not every second.
- **Reduced motion:** no ring or sweep animation. The numbers change, and that's all.

### Also worth considering (lower priority)

- **Next-set load from RPE** (`estimate`, `plannedLoad`): after a logged set with an RPE, suggest the load for the
  next set's target reps and RPE. It's a suggestion the lifter accepts, never an automatic change.
- **Weekly volume** (`weeklyVolume`): on Train → Plan, hard sets per muscle for the active programme's week, against the
  10 to 20 guide. This needs each app exercise mapped to the website's muscle list. The Exercise guide's **Muscles** tab
  suggests the app has that data, but this is **unverified**.
- **DOTS** is left out of the app on purpose. It needs bodyweight and a choice of coefficients, which is more personal
  data than a session needs. The website tool is enough.

## Worked example (synthetic)

This is a session day with back squat 3 × 5 at 100 kg, a 20 kg bar, standard plates and no collars. The numbers are
computed by `examples.mjs` in this folder using `lib/tools/`. Re-run it with:

```sh
node --experimental-strip-types --no-warnings --import ./tests/ts-resolve.mjs studio/experiments/app-tools-spec/examples.mjs
```

| Step | Shown |
| --- | --- |
| Warm-up | 20 kg × 10 (empty bar) · 40 kg × 5 (10 a side) · 60 kg × 3 (20) · 80 kg × 2 (25 + 5) · 90 kg × 1 (25 + 10) |
| Working set | 100 kg × 5: 25 + 15 a side |
| Load typed as 101 kg | "Can't make 101 kg: use 100 kg or 102.5 kg" |
| After 100 × 5 at RPE 8 | e1RM about 123.3 kg; 3 reps at RPE 8 suggests 105 kg |
| Rest | 3:00 preset. After two taps of +15 s at the one-minute mark, 1:30 is left two minutes in |

## Keeping the app and the website in step

The app can't import TypeScript, so the maths will be ported. To stop it drifting:

1. **Port these behaviours exactly:**
   - **Plates:** all arithmetic in **grams, as integers**, so 2.5 kg and 1.25 kg plates never drift. Load
     heaviest-first. When a load can't be made exactly, give the nearest load below and above.
   - **Warm-up:** skip a step that rounds onto the previous one or reaches the working load.
   - **Timer:** time left is rounded **up**, so it never shows 0:00 before it has ended.
   - **Strength:** Epley for the headline estimate. Brzycki only from 10 or fewer reps to failure.
2. **Share test vectors, not code.** `tests/tools.test.mjs` and the table above are the conformance cases. A port passes
   when it gives the same outputs. Any change to `lib/tools/` that changes an output should update both.
3. **Same limits and messages:** 500 kg maximum load, 1 to 20 reps for warm-ups, RPE 6 to 10, and the same plain error
   wording.

## Privacy and measurement

- Everything runs on the phone and works offline. No loads, reps or timings leave the device for these tools.
- The website counts only event names (`tool_<name>_view`, `tool_<name>_used`). Whether the app measures anything at
  all is Josh's decision. This spec assumes nothing is sent.

## Acceptance for a future build

The implementer records evidence for each item:

- The three tools match the worked example and the conformance cases.
- The rest timer is right after locking the phone for its whole length, after backgrounding the app and after force-stopping it.
  It fires its end alert with the app closed. **This must be tested on a real phone.**
- Warm-up sets are excluded from set counts and from any progress figures.
- An unmakeable load is never changed without the lifter's tap.
- TalkBack: every control has a label, the timer announces only at 60, 30, 10 and 0 seconds, and targets are at least 48 dp.
- With "remove animations" on, nothing animates. Text scales to 200 % without clipping the countdown or the plates line.
- The lime signal colour is used only for the primary action on each surface. Crimson isn't used (it was retired on 4 Oct).

## Open questions

1. **Josh:** does the session screen look the way placement 1 to 3 assumes, with a load and reps per set and a tick to
   finish a set? Only the Android source can answer this.
2. **Josh:** should the app measure tool use at all? If yes, should it use the same event names as the website?
3. **Lead:** are "Next-set load" and "Weekly volume" in scope for a first build, or later?
4. **Lead:** does PR #14's Today module come back alongside this, or stay parked? (It's parked as of 26 Nov.)
