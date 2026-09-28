# Phase 4: verification

Every page was captured viewport by viewport at 390×844 and 1440×900, as a visitor scrolls: 58 viewports in all. The sheets are here (`<page>-390.webp`, `<page>-1440.webp`), plus the showreel at both aspects (`reel-beats-9x16.webp`, `reel-beats-16x9.webp`).

## Hard limits, per viewport

| Page | Width | Viewports | Least empty space | Most annotation marks | Violations |
|---|---|---|---|---|---|
| Home | 390 | 11 | 69% | 2 | 0 |
| Home | 1440 | 9 | 81% | 3 | 0 |
| Get | 390 | 5 | 72% | 1 | 0 |
| Get | 1440 | 4 | 85% | 2 | 0 |
| Coaching | 390 | 7 | 46% | 1 | 0 |
| Coaching | 1440 | 6 | 82% | 3 | 0 |
| Links | 390 / 1440 | 2 / 2 | 88% / 96% | 0 | 0 |
| Privacy | 390 / 1440 | 4 / 3 | 86% / 94% | 1 / 2 | 0 |
| 404 | 390 / 1440 | 3 / 2 | 95% / 97% | 1 | 0 |

How each limit was measured:
- **Empty space:** the share of pixels at the ground colour (Glass `#101113`, or Paper `#ECEAE3` with its grain).
- **Marks:** counted from the page itself. Visible signal squares, visible bracket sets, section-header rules, and the scroll gauge counted as one tick scale with its marker.
- **Loud colour:** volt and ember pixel counts. No static viewport contains ember.
- **Dominant shape:** one per viewport, checked by eye on the sheets.

The audit found one real violation, which has been fixed. The reel's resting lockup sat on the ember field while the volt CTAs were on screen. Now:
- The poster and resting frame are the lockup on Glass.
- Ember appears only in motion (19–22 s).
- The reel only plays while at least half of it is visible.
- The header CTA is a hairline chamfer, so volt is reserved for the in-content primary button.

## Showreel

- **Loop seam:** the frame at 24.0 s is pixel-identical to the frame at 0.0 s at both aspects (max difference 0).
- **Poster handoff:** the static poster matches the live frame at 22.25 s, where playback starts. Only the beat label and pause control differ.
- **Frame rate:** a full 24 s loop at 4× CPU throttle averages 59.9 fps at 390 (DPR 2.6) and 59.7 fps at 1440. The 95th-percentile frame is 16.8 ms.
- **Reduced motion:** the reel never loads, and the static lockup poster shows. Site motion is limited to opacity and colour.
- **Control:** a visible Pause/Play button with a changing label. It also pauses offscreen (under 50% visible) and in hidden tabs.

## Lighthouse (mobile, production build)

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | 98 (was 96) | 100 | 100 | 100 | 2.2 s (was 2.6 s) | 0 |
| Get | 98 | 100 | 100 | 100 | 2.1 s | 0.021 |
| Coaching | 99 | 100 | 100 | 100 | 2.0 s | 0 |

There's no regression. Home improved, because the hero no longer waits on a screenshot and the WebGL ambient light is gone.

## Tests

- 37 journey checks pass, including axe (WCAG 2.1 AA and best practice) on every page.
- The reel checks cover: poster first paint, start after load, pause control, loop seam, and reduced motion.
- The scroll-gauge checks cover: one tick per section, the marker following the section in view, and hidden from assistive tech.

## Same school, not same piece

Our frames were held against each ref. The comparison image isn't committed, because the refs are third-party work.
- **Ref 1** (spec sheets) against "Why it helps" on Paper: the same label–value grammar, with no tickets, badges or livery.
- **Ref 2** (extreme scale) against reel beat 5: one monumental numeral against 11px labels. The number is ours (the facet angle and Dunedin's latitude), and so are the palette and the face.
- **Ref 3** (a primitive on an axis) against reel beat 6: our octagon, not a disc, with no tower symmetry.
- **Ref 4** (one material object) against reel beat 3: a black-glass contour figure from the app's own exercise guide, not a chrome head.

## Deliberately left out

- **Rolling section numbers:** the third signature option. The reel already rolls an index, and two signatures is the limit.
- **Ember elsewhere on the site:** it's one moment per page at most, and only the home reel uses it.
- **Tempo, load and rep-count annotations:** the app screens don't show them, so they would be invented data.
- **Geist Sans:** not in the repo. Inter Tight is kept, as agreed.

## Known limits

- **The contour athlete** is built from capsules on a skeleton. It reads as the kneeling rollout, but it's stylised rather than anatomical. A figure asset from the app (the exercise-guide render) would make it sharper.
- **The mark's own glint is volt.** It appears in the lockup beside the ember field, and it's intrinsic to the logo.
