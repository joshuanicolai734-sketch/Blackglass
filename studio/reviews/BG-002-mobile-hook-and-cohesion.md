# BG-002 review: mobile hook, accent cohesion and opening motion

- GitHub issue URL: none yet. Coordination thread: [issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7). Original comment: [PR #8 review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5956480876)
- Reviewer: Claude (independent critic), at Josh's request, 2 October 2026
- Status: findings only. Josh has not approved an implementation brief; see the proposed brief in `studio/briefs/BG-002-mobile-hook-and-cohesion.md`

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
- **In this checkout:** `--fs-label` was 11 px on phones. BG-002's one code change raises it to 12 px at every width. At 320 and 360 CSS px no label clips (headless Chromium, `/` and `/coaching`).

### Additional observation (this checkout, already present before BG-002)
- At 320 CSS px the homepage is 331 px wide. The cause is the menu note's "Email Josh" link (`components/site/chrome.tsx`), which ends at about 324 px with 11 px labels and about 327 px with 12 px. The same width was measured both with and without the label change. Not fixed here, to keep the change bounded.

## Verification of the BG-002 code change
- `pnpm lint && pnpm exec tsc --noEmit && pnpm build`: passed
- Production server rendered at 320 and 360 CSS px: labels compute to 12 px, and no `.label` element has hidden overflow
- Not tested: physical phones, Samsung Browser, reduced motion, other routes
