# BG-002 review: mobile hook, accent cohesion and opening motion

- GitHub issue URL: none yet. Coordination thread: [issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7). Original comment: [PR #8 review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5956480876)
- Reviewer: Claude (independent critic), at Josh's request, 2 October 2026
- Status: findings only. Josh has not approved an implementation brief; see the proposed brief in `studio/briefs/BG-002-mobile-hook-and-cohesion.md`

## Status on 3 October 2026

Claude checked the live public site (v33) in headless Chromium, with all `/api/*` calls intercepted. Staging items are as reported by Gamma, not checked by Claude. Evidence: [website audit](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5960225658), [journey review](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967090047), [PR #11 review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/11#issuecomment-5967085635).

| Finding | Live v33 (seen) | Staged or proposed |
| --- | --- | --- |
| 1. Hook | Mostly addressed: the H1 is "One session. Then the next." on a full-bleed hero, fully visible about 0.3 s after load. Still open: inconsistent CTA labels and styles, small desktop hero CTA | CTA label and style unification proposed to Gamma |
| 2. Accent | Open: lime is the primary action colour, while `AGENTS.md` still names crimson | Needs Josh's decision (brief item B) |
| 3. Floating controls | Not reproduced: the mobile sticky bar hides while a form field is focused. The recording's chevron and pencil overlays didn't appear (still unverified on Samsung Browser) | none |
| 4. Opening motion | Partly reproduced (corrected 3 Oct): with normal motion, the first visit of each browser session plays a skippable intro (loading line, wordmark, right-to-left wipe). The hero is readable about 1.3–1.4 s after first paint. One mid-wipe frame shows the fading wordmark beside slices of hero text, and "Skip intro" stays over the page for about 0.1 s. No intro with reduced motion. Lighthouse mobile LCP is 3.7–3.9 s, with the intro the likely main cause (not proven) | Make the H1 paint in the first frame, or overlay the intro on already-painted content |
| 5. Labels and feedback | Partly open: 10–11 px labels on `/movements` and `/links` | Targeted 12 px labels and 44 px clip controls are staged privately |
| 320 px overflow (this repo) | Not seen on live at 360 px | Fixed in draft PR #11 |

## Evidence and limits

| Source | What it covers | What it does not |
| --- | --- | --- |
| Owner-supplied phone screen recording (about 2 min 10 s, Samsung Browser, portrait), sampled every 3 s and every 0.5 s across the homepage opening | Newer owner-review homepage, film and wallpaper studies, the Android development build | No interaction by the reviewer. Timings are approximate. No reduced-motion, keyboard, screen-reader, loading/error or performance checks |
| This GitHub checkout, default head `b87393d`, rendered with the production build at 320 and 360 CSS px in headless Chromium | The older public baseline (crimson accent, "Know what today asks of you." hero) | Not the source shown in the recording. Headless Chromium, not a phone |

The recording and this repository are different sources (see `studio/collaboration/CURRENT_STATE.md`). Findings 1–4 describe the newer review source and can't be fixed by editing this checkout alone. The recording itself, frames from it and private URLs are deliberately left out of this public repository.

## Findings, ranked by impact

### 1. The customer hook arrives late and low
- **Seen:** the first viewport opens on a descriptive sentence, then the CTA, a disclaimer and two links. "One session. Then the next." starts around 3.0 s in the bottom quarter and settles around 5.0 s, partly under the fold edge. The strongest line ("Walk in. Know what's next. Leave with a record.") only appears in the film, far down the page.
- **Assumed:** most phone visitors decide on the first viewport.

### 2. The accent system is fragmented
- **Seen:** lime is the primary action on the site and in the app. The in-app "Log set 1" button is lavender. Crimson appears only as a launcher-icon corner and in one vortex study. One wallpaper study is cobalt blue. `AGENTS.md` and `app/tokens.css` here still name crimson `#F43F46` as the action signal. PR #8's design guidance loosens that without naming a replacement.

### 3. Floating controls cover content and CTAs
- **Seen:** a scroll-to-top chevron sits over body copy and the sticky CTA ("JOIN THE PREVIEW LIS…" at about 0:18). A blue pencil button on the left edge overlaps labels in nearly every frame.
- **Assumed:** both belong to the browser or an editing overlay, not the site. Not verified.

### 4. Opening motion is long and has an overlap state
- **Seen:** at about 3.0 s the splash wordmark is still on top of the hero's meta row. The second headline line takes about 2 s to slide in, so the hook is legible only around 5 s. The motion studies use three unrelated visual languages.
- **Assumed:** the splash runs on every visit.

### 5. Truth labels and in-app feedback are hard to read
- **Seen:** uppercase, wide-tracked mono labels carry the honesty claims ("Graphic example / not a capture", "Demonstration only. Nothing is saved.") and are the smallest text on screen. In the app, a native browser validation bubble overlaps the next set row.
- **In this checkout (the older GitHub baseline):** BG-002's one code change raises the *default* label token `--fs-label` from 11 px to 12 px on phones; it was already 12 px from 900 px. It's not a universal label floor. Two explicit phone exceptions remain below 420 px, at `app/site.css:676-680`: Movement Studio exercise labels (`.ms-exercises .label`) and playback status (`.ms-state`) at 10 px. They're **deferred**, not changed here, until a scope is agreed.
- **Newer v33 source:** Gamma reports, by source inspection, that v33 already sets the shared token to 12 px through `performance.css`. So for v33 this change reconciles the underlying token rather than enlarging labels. I haven't inspected v33 myself.

### Additional observation (this checkout, already present before BG-002)
- At 320 CSS px the homepage is 331 px wide. The overflow comes from the two offer cards (`app/page.tsx:172-186`, `.offer-card`), which extend to 331 px. I didn't isolate which child sets their width. The width is identical with 11 px and 12 px labels, and `/coaching`, `/get` and `/movements` stay at 320 px.
- Correction: the first version of this review blamed the menu's "Email Josh" link. That was wrong: the closed menu is positioned off-canvas, and the same menu is on `/coaching`, which doesn't overflow. Not fixed here, to keep the change bounded.

## Verification of the BG-002 code change
- `pnpm lint && pnpm exec tsc --noEmit && pnpm build`: passed. GitHub CI `verify` also passed on `5a4d6e7`
- Production server, headless Chromium, 320 and 360 CSS px. Routes `/`, `/coaching`, `/get` and `/movements`, plus the open mobile menu on `/`
  - Default labels compute to 12 px. On `/movements` the deferred 10 px exceptions also render.
  - No `.label` element has hidden overflow.
  - Page widths match the 11 px baseline on every route. The only overflow is the existing 331 px homepage case above.
- Not tested: physical phones, Samsung Browser, reduced motion, other routes. These are headless renders, not visual acceptance.
