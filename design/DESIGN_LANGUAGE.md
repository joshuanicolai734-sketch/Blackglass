# Blackglass design language: phase 0 (audit and direction)

Status: **awaiting approval.** No production code has changed. The style frames are in `design/frames/`. Rebuild them with `node design/frames/build.mjs`.

## Decisions I need from you

1. **Ember doesn't exist yet.** The repo has no red brand token. The only reds are shadcn defaults in the admin scaffolding (`#e7000b`, chart colours), and those aren't brand colours.
   - **Candidate:** `#DE7F4E`, sampled from the app's own working-muscle highlight in the exercise guide (`public/assets/movement.webp`).
   - **Contrast:** 6.5:1 against Glass, so fills only. It's never text on Paper, where it's 2.4:1.
   - **Options:** approve it, give me the exact hex from the app's source, or drop Ember. If you drop it, beat 6 becomes a flat Pane field.
2. **Geist Sans isn't in the repo.** The brand faces as shipped are Inter Tight (variable, 100–900) and Geist Mono.
   - The frames set display words in Inter Tight Light, uppercase, +0.3em.
   - If Geist Sans is the app's face, I'd self-host it as one variable WOFF2 (about 30 KB, OFL licence) and retire Inter Tight. Otherwise Inter Tight stays. One face either way, never both.
3. **Motion durations.** The site uses 160/320/640 ms, and your brief says the app uses 150/250/350/600. The app source isn't in this repo, so I'll adopt your values as authoritative unless you correct them.
4. **Module names for reel beat 4.** The app's real tab bar is **Today · Train · Fuel · Progress · More**.
   - The repo has no Progress screen, so a Progress card could only show its name.
   - I recommend **Today · Train · Learn · Fuel**. Every one of those is backed by a real screen, and they match the site's existing copy.
5. **Where the reel lives.** The hero currently has a static octagon and app screen, plus a "Watch the teaser" button that opens a video dialog.
   - **Recommended:** the reel becomes a full-bleed band directly under the hero copy, genuinely 16:9 on desktop and 9:16 on mobile. That replaces the static hero visual.
   - **Alternative:** it lives in the hero's right column (about 1:1), with compositions re-laid out for that shape.
6. **The high-energy teaser.** Its glow, glitch and tunnel break this grammar ("no glow, no gradients"). I'd keep it for social and remove its button from the site when the reel ships.
7. **The first-visit intro splash.** It overlaps with reel beats 1–2. I'd retire it once the reel's opening does the same job.
8. **Refs.** `design/refs/` holds your four images locally, but it's git-ignored. The repo is public, and they're third-party work.

## The refs: take and leave

**Ref 1: aero livery, passes, logo pack, packaging**
- Take: the spec sheet grammar. Tiny key:value labels hang off long hairline rules, and modules are numbered (S/03-style).
- Take: generous cream-like ground with one ink.
- Leave: the hazard-stripe livery, the badges and patches, and the ticket/pass layouts.
- Leave: the blue and yellow palette, and every name and number in it.

**Ref 2: industrial product system, volt and orange**
- Take: extreme scale contrast. One monumental numeral sits against 11px labels, with almost nothing in between.
- Take: one flat, full-bleed signal panel, used once, as a structural slab.
- Leave: the renders, the boarding-card FROM→TO layout, and the condensed stencil type.
- Leave: its orange and green, the typeface, and all the copy.

**Ref 3: tower on a disc**
- Take: one primitive on a hard central axis, surrounded by a lot of calm space.
- Take: thin reticle lines that end in small square nodes.
- Leave: the sun-behind-tower symmetry, the city, the red disc, the glow and the hanging slider lines.
- Leave: any radial poster composition.

**Ref 4: chrome profile**
- Take: one object rendered as a material inside a flat graphic field, with a single specular edge doing the work of a whole render.
- Take: the diagonal as the only motion vector.
- Leave: the head and figure subject, the red sun disc, and the bar-and-slider collage.
- Leave: the mirror chrome. Our material is black glass.

Test used on every frame: next to a ref it should read as the same school, never the same piece.

## Tokens

These will move into one authoritative file in phase 1 (`app/tokens.css`). The shadcn admin variables will map onto it rather than duplicate it. **NEW** marks a value that doesn't exist today.

| Token | Value | Use |
|---|---|---|
| `--glass` | `#101113` | Home ground (currently `--ink`) |
| `--pane` | `#18191C` | Black-glass objects, raised surfaces |
| `--facet` | `#2B2D32` | The lit facet; the pane frame on Glass |
| `--bone` | `#F4F5EF` | Text on Glass; the specular edge |
| `--text-2` / `--text-3` | `#C3C6C0` / `#A4A9AE` | Body text and labels on Glass (10.9:1 and 8.0:1) |
| `--ink-2` | `#45484D` | Body text and labels on Paper (7.6:1) |
| `--volt` | `#D5FF3F` | The signal: markers, active states, one line per frame |
| `--paper` | `#ECEAE3` **NEW** | Counter-surface for feature sections: warm bone, ink 15.7:1 |
| `--ember` | `#DE7F4E` **NEW, pending** | One moment per page, one in the reel. Fill only. |
| `--rule` | bone at 14% / ink at 18% **NEW** | Hairlines on Glass / Paper |
| `--grid` | bone at 4% / ink at 4.5% **NEW** | Desktop column rules |
| `--t-1…4` | 150 / 250 / 350 / 600 ms **CHANGED** | Replaces 160/320/640 |
| `--ease-expo` | `cubic-bezier(.16,1,.3,1)` | Default |
| `--ease-quart` | `cubic-bezier(.25,1,.5,1)` **NEW** | Numbers and small moves. `--ease-in-out` is retired. |

Colour rules:
- **One loud colour per viewport.** Volt and Ember never share a viewport.
- **Volt on Paper is 1.04:1, so it's invisible on its own.** On Paper, volt appears only inside ink shapes, such as a volt square outlined in ink or volt inside an app screen. It's never text or a thin line.
- **No glow.** One gradient is allowed per object at most, for the lit facet.

## Type: five sizes, brand faces only

| Role | Setting |
|---|---|
| Label / data | Geist Mono 500, uppercase, +0.12em, 11px mobile / 12px desktop |
| Body | Display face 400, 17px / 1.6 |
| Title | Display face 500, 20px (card titles only) |
| Display word | Display face 300, uppercase, +0.3em, clamp(24px, 3.1vw, 44px) (h1, h2) |
| Monument | Display face 800, −0.05em, clamp(120px, 22vw, 360px) (numerals only, one per viewport) |

The wordmark is only ever the wordmark paths. It's never set in type. The frames used 16px for card body text; phase 1 moves that to 17px so the count stays at five.

## The four-mark vocabulary

Four annotation marks, used everywhere, and nothing else:

1. **Hairline rule:** 1px, `--rule`. Section-header rules, leader lines and the axis.
2. **Tick scale:** 1px ticks, with every major tick labelled. It always measures something real, like phase position, scroll position or octagon sides.
3. **Corner registration bracket:** 16px, 1px. It frames the one object or card that is active.
4. **Signal square:** 6px, volt (outlined in ink on Paper). It marks the active or current item.

Counting rules:
- At most 3 annotation marks per viewport. A bracket set counts as one mark.
- Structural hairlines (the column grid, card and section borders) aren't annotations.
- Every mark points at real data, from the inventory below.

## Real data the annotations may point at

Everything here is visible in `public/assets/` or already in the site copy. Nothing is invented. There are no tempo, load or rep counts, because the screens don't show any.

- **Exercise guide:** Ab Wheel Rollout, Core / Bodyweight, Kneeling wheel rollout, phases Brace · Reach · Return, "Learn the pattern. Control the movement."
- **Today:** Session in progress, MON · Push A, 05 exercises / 12 sets, nutrition target kcal and protein.
- **Train:** LEAN / 55 · Strength & aesthetics, 6 days per week, Week 1 of 6 · Build, sub-tabs Plan · Library · Build · Generate · Forge.
- **Brand geometry:** 8 sides, a 45° facet seam.
- **Place:** The Octagon, Dunedin, 45°52′S 170°30′E.

The screens are shown as app UI, never as a client's results.

## Grounds

- **Glass (home):**
  - Objects are black glass (pane with lit facet) on a `--facet` frame, so they separate from the ground.
  - Buttons are a volt fill with ink text.
- **Paper (feature sections):**
  - Black-glass objects sit on warm bone, with static SVG grain at 3%.
  - Buttons are an ink fill with bone text.
  - My recommendation is to use Paper for one or two feature sections per page, never the hero.
- **Corners:** square, or 45° chamfers from the octagon. No pills, no soft cards.

## Signature details (two)

1. **Registration brackets snap to cards** on hover and focus: 250ms expo.
2. **A vertical tick-gauge scroll indicator** on the right edge (desktop only). Major ticks are the page's sections, and the current section gets the signal square.

Rolling section numbers are left out, because the reel already rolls an index.

## Reel beat sheet

The reel is 24.0 s, a seamless loop with no audio, and every cut lands on the 0.5 s grid. Motion is time-based with seeded randomness, so `seek(t)` can drive either live playback or an MP4 capture.

| Time | Beat | What happens |
|---|---|---|
| 0.0–3.0 | **1 Axis** | Empty Glass. The axis hairline draws from the centre outward (0–0.6). A tick scale counts the octagon's 8 sides along it (1.0–2.5). The registration bracket locks at centre (2.5). |
| 3.0–7.0 | **2 Pane** | The rim's outer contour draws in hairline (3.0–4.5). A hard wipe along the 45° seam fills it to black glass, pane plus facet, in the exact geometry (4.5–5.5). One specular sweep (5.5–6.5). A volt square lands on the upper-left vertex (6.5). |
| 7.0–12.0 | **3 Specimen** | The contour-line athlete draws in, level by level (7.0–8.0). Floor rule and phase scale (8.0–8.5). The figure moves Brace → Reach as the scale marker steps (8.5–10.0). The phase callout (9.0). A volt line traces the core, the app's own working area (9.5–10.1). The pattern callout (10.5). |
| 12.0–16.0 | **4 Modules** | Four spec cards on the second: Today, Train, Learn, Fuel (pending decision 4). Each card carries one real key:value. A giant index rolls 01 → 04 in the monument size. |
| 16.0–19.0 | **5 Scale jump** | A hard cut to one monumental **45°**, with tiny labels only: "Facet 45°" and "The Octagon · 45°52′S 170°30′E". It's the mark's angle and Dunedin's latitude. |
| 19.0–24.0 | **6 Ember** | The reel's only red: a flat ember octagon field rises behind (19.0–19.6). The mark lands, then the wordmark (19.5, 20.0), then "Train with intent." (20.5). Holds until 22.5. From 22.5 to 24.0 the hairlines retract to the axis and the axis closes to nothing, so the last frame is the first frame. |

Rules for the reel:
- **Volt is off in beat 6.** The only volt there is the mark's own glint.
- **Reduced motion:** the reel is replaced by a static lockup poster.
- **Loading:** the poster SVG is the first paint, and the reel starts after LCP.
- **Performance:** it only animates transform and opacity, and pauses when it's offscreen or the tab is hidden. It has a visible pause control.

## Style frames (`design/frames/`, screenshots at 390 and 1440)

1. **`01-hero-glass`:**
   - Section header, display h1, body, chamfered volt button and a hairline link.
   - The pane's exact geometry as black glass: rim contour as a hairline, one specular edge, a volt square on the vertex.
   - Marks: axis, bracket set, signal square.
2. **`02-feature-glass` / `02-feature-paper`:**
   - "Less guessing. More training." as label–value spec cards. Every key:value points at a real screen.
   - The Train screen as the one black-glass object.
   - Brackets on the active card.
3. **`03-reel-beat3-specimen`** (16:9 and 9:16):
   - The contour-line athlete in the Reach phase, black glass with one specular edge, and volt tracing the core.
   - Two leader callouts routed through empty space only, and the Brace · Reach · Return phase scale.

Hard-limit audit of the frames:
- Every frame has one dominant shape and one loud colour.
- Each has at most 3 annotation marks, and empty space is at or above 40% by eye.
- The feature frame at 1440 is the tightest. In phase 3 it will lose the grid lines behind the cards if it measures under 40%.
