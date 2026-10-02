# BG-002: Phone visitors understand the offer and act within the first viewport

- GitHub issue URL (independent of BG ID): not yet created. Coordination on [issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7)
- Status / brief approval evidence: **proposed by Claude for Gamma, at Josh's request, 2 October 2026.** Josh's approval of the implementation scope is still required. The one code change already made (item E) is a reversible token adjustment Josh asked for
- User/problem: on a phone, the newer homepage's strongest line arrives late, the accent colours disagree across site, app and studies, floating controls cover CTAs, and the honesty labels are the hardest text to read. Evidence: `studio/reviews/BG-002-mobile-hook-and-cohesion.md`
- Why now: preview-list sign-ups depend on the first viewport. The accent decision blocks further motion and wallpaper work
- Source base SHA and release target: GitHub default `b87393d` for item E only. Items A–D target the owner-review website source, which isn't in this repository; name its exact revision before implementation (see BG-007)
- Creative lead/final visual reviewer / implementer / independent reviewer / integrator: Gamma / Codex (proposed) / Claude / Josh or an assigned integrator
- Approved design/motion references and defining interaction to preserve: the force → repeat → record sequence, the light/dark chapters, the octagon mark and the film end card
- Isolated prototype needed? Optional, for A only: two first-viewport variants at 360×640
- Owned files or area: homepage hero, sticky CTA bar, colour and label tokens, film/wallpaper palette. In this checkout, item E touches `app/tokens.css` only
- Dependencies and overlapping tasks: BG-007 source reconciliation must name the target source before A–D. PR #8 owns `studio/DESIGN_SYSTEM.md` and `AGENTS.md` wording, so record the accent decision (B) there or after it merges
- Preserve: truthful availability ("Android app in development", no public download, no iPhone app), the "graphic example / not a capture" labels, reduced-motion and no-JavaScript behaviour, the existing coaching offer wording from `content/site.ts`

## Proposed change (Gamma to direct, in this order)

**A. Hook first (finding 1).**
- Make the poster line the H1 and the visible top of the first viewport.
- Demote the descriptive sentence to a subhead.
- At 360×640 CSS px, the first viewport holds: H1, one primary CTA and the "Android app in development" line.
- Try "Walk in. Leave with a record." as a headline variant.

**B. One accent system (finding 2).**
- Josh chooses one primary-action colour and one secondary signal. Gamma recommends; Claude has no preference beyond consistency.
- Record the choice in the design guidance and `AGENTS.md` so they agree.
- Map the site CTA, in-app primary button, launcher icons, film end card and wallpapers to it.
- Cobalt and lavender are off-system unless deliberately adopted.

**C. Clear floating controls (finding 3).**
- First confirm in a second mobile browser which overlays belong to the site.
- Whatever the answer, give the sticky CTA bar clearance for browser floating controls, keep its full label visible, and keep the left 48 px free of essential labels.

**D. Faster, cleaner opening (finding 4).**
- The headline is readable within about 1.2 s of first paint.
- The splash fully exits before hero type enters, and doesn't repeat on internal navigation.
- One easing family across hero, film and studies, with one shared palette and primitive for the studies.
- A static settled frame under reduced motion.

**E. Readable truth labels (finding 5).**
- Done in this checkout: `--fs-label` is 12 px at every width.
- In the newer source and the app, apply the same 12 px floor with ≥4.5:1 contrast. Use sentence case where a label carries meaning.
- Replace native form validation with an inline, on-system error, shown after an attempted log.

## Explicitly out of scope
- Publishing, Sites deployment, Android distribution, database changes
- Copying private review source or media into this repository
- New claims about features, users or results

## Acceptance scenarios
- 320, 360 and 430 CSS px: no horizontal scroll, full CTA label visible, H1 and CTA in the first viewport
- Opening captured at start, mid, settled and reduced-motion states, with no overlapping type layers
- Accent audit: every primary action on site and app uses the chosen token
- App set logging: an empty weight shows an inline error after an attempted log, never before

## Evidence required
- Lint, type check and build for repository changes
- Rendered screenshots with synthetic data only, plus a physical-phone check stating device and browser
- Gamma's final visual review against this brief

## Data/privacy/permission risks
None expected. Keep recordings, private URLs and owner-only assets out of GitHub.

## Rollback
Each item is a separate, revertible commit. Item E reverts by restoring the 11 px phone value in `app/tokens.css`.

## Completion and handoff condition
A–E accepted or explicitly deferred by Josh, with Gamma's final visual review recorded on the issue.
