# Blackglass design language

## Current direction: poster system (September 2026)

The current website takes its visual direction from the Blackglass crimson-horizon and Accelerate Everything posters. It uses poster-black `#0B0D0E`, warm bone `#F1EEE6`, and one crimson signal `#F43F46`. The deeper red `#B72F36` shades the same graphic form. `app/tokens.css` is authoritative for the implemented values.

- Give the home hero a compact, heavy, uppercase headline and one red disc/diagonal structure. Use generous black space and small factual editorial labels.
- Keep primary actions crimson on Glass and ink on Paper. Do not set long text in crimson on Paper.
- Keep the real app captures unfiltered and the release status and coaching offer truthful. Graphic forms are decoration, never evidence of a feature or result.
- Use the existing wordmark paths and Inter Tight/Geist Mono. The poster typography is translated into weight, tracking, and layout; do not substitute a lookalike logo or add an unlicensed display font.
- Preserve reduced-motion behavior and working no-JavaScript paths.

## Previous direction: phase 0 audit and decisions

The following is an archive of the original approved phase 0 system and frames. Its Volt/Ember palette and exclusions of the red disc have been superseded by the poster direction above.

Status: **approved** (Ember `#DE7F4E`, Inter Tight kept, recommendations taken). Phases 1–3 are built. The style frames are in `design/frames/`. Rebuild them with `node design/frames/build.mjs`.

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
| `--ember` | `#DE7F4E` **NEW, pending** | One moment per page, never in the reel. Fill only. |
| `--rule` | bone at 14% / ink at 18% **NEW** | Hairlines on Glass / Paper |
| `--grid` | bone at 4% / ink at 4.5% **NEW** | Desktop column rules |
| `--t-1…4` | 150 / 250 / 350 / 600 ms **CHANGED** | Replaces 160/320/640 |
| `--ease-expo` | `cubic-bezier(.16,1,.3,1)` | Default |
| `--ease-quart` | `cubic-bezier(.25,1,.5,1)` **NEW** | Numbers and small moves. `--ease-in-out` is retired. |
| `--t-load` / `--t-drive` / `--t-snap` | 350 / 220 / 120 ms | The motion grammar: load (leaving, `--ease-load`), drive (arriving, expo), snap (a press or hover colour). See Site motion. |
| `--ease-load` | `cubic-bezier(.45,0,.55,1)` | Every exit: a symmetric, controlled ease-in-out, so a leaving thing gathers and travels instead of snapping away. |

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
| Display word | Display face 600, uppercase, +0.04em, clamp(24px, 3.1vw, 44px) (h1, h2). The home h1 is 650 at −0.012em, 42–84px: power, not luxury. |
| Monument | Display face 800, −0.05em, clamp(120px, 22vw, 360px) (numerals only, one per viewport) |

**Buttons** are set in the display face (Inter Tight 600, uppercase, +0.06em). Geist Mono is for labels and data only, never for a control.

**Screens** are real, unfiltered captures: no desaturation, no tint. Each screen appears at most once per page on desktop. Crops are set by `object-position` on the 720×1560 source: the default drops the status and navigation bars (720/1400); the hero shows the Train screen below its volt button (`crop-train`, 720/768, source rows 488-1256, ending on a whole plan row between 05 and 06; the edit pencil still shows at the left edge and needs a re-capture to go) so volt stays for the one real action; the Learn tab is a chip card, not a screen (three chips BRACE / REACH / RETURN from the app's phase control; a small volt marker steps every 1.2s; no exercise name, no button, no wheel); the demo Train screen ends under plan row 05 (`crop-plan`, 720/1180, rows 72-1252); on phones the Today crop ends under "Log food" (`crop-today`, 720/1168). The hero screen drives in 24px once over `--t-load` at first paint (transform only, so it never delays LCP). Demo images are all deferred so none competes with the font. The stage follows (on phones; on desktop it keeps the tallest panel's height and the Learn card is centred) the active panel's height, so a short crop leaves no void. Copy says "movement", not "lift", and no crop may show an exercise the copy does not name.

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

Rolling section numbers are left out: numbers never count or roll.

## Site motion

**Load · Drive · Lockout.** Every interface move is a rep:
- **Load (eccentric):** anything leaving or closing moves under control, `--t-load` 350 ms, `--ease-load` (symmetric ease-in-out).
- **Drive (concentric):** anything arriving, opening or answering is explosive, `--t-drive` 220 ms, `--ease-expo`: it lands in 4–6 frames at 60 fps, so a 24 px push is actually seen.
- **Snap:** a press settles in `--t-snap` 120 ms, then releases at drive speed. Hover lifts a primary 1px along 45° (the unrack); the press undoes it (the rack).
- **Lockout:** every move ends dead still. No bounce, overshoot or springs. The volt square marks where a move lands.
- Travel runs along the 45° facet vector or the reading axis.

Content is complete on first paint: no entrance, reveal or scroll-driven animation, and nothing waits. Motion only answers the visitor:
- link hairlines and the button arrow (drive in, load out), and the rack press
- the bracket snap on cards
- the demo tabs: one shared indicator drives to the chosen tab; the incoming screen drives in 24px along the tab direction on top of the outgoing one, so the pane is never empty
- the FAQ height (drive open; on close the words fade first, then the height loads down). This is the one layout-property animation on the site: a short list, height only, Chromium only, and it's accepted as an exception to transform/opacity/clip-path.
- the gauge square stepping between section ticks
- the phone action bar (drives in after the hero, loads out for good at the fork or the enquiry form: two changes per page)
- form success: the volt rule locks in after the server confirms
- page changes (the old page loads out, then the new one drives in), and the `/get` button morphing into the preview form's button

With reduced motion, state changes are colour and opacity only, and view transitions are off. Without JavaScript every state is already painted.

**Test for any new motion:** name its load, its drive and its lockout. If you can't, cut it.

## Reel beat sheet

The reel is a 12.0 s tempo film: a seamless loop with no audio, and every cut lands on a full frame. `seek(t)` is pure (no randomness, no state), so it drives both live playback and an MP4 capture, and `seek(12)` is the same frame as `seek(0)`. Every layer is server-rendered by `components/site/reel.tsx`; `public/reel.js` only moves them.

| Time | Scene | What happens |
|---|---|---|
| 0.0–6.4 | **1 Squat** | A black-glass athlete (a `--c-facet` body with one bone rim and a lit edge along the upper back, the octagon's lit-facet language) does one back squat at **3-1-1**. Brace: a 1.5% hip set (0.15–0.6). Lower for 3 s at a steady, controlled speed to below parallel (0.6–3.6). Pause in the hole (3.6–4.6). Drive 4.6–5.3: fast through the middle, decelerating only in the top 30%. Lockout held dead still 5.3–6.4. The pose is solved per frame from one depth value, and the torso leans exactly enough to keep the bar over midfoot, so the plate's hub travels a vertical line (a faint dotted bar path). The readout "3 · 1 · 1 / Lower · Pause · Drive" is annotation-sized; it lights the phase in play (drive in, load out) and the volt square steps under it. The brace (frame 0, the poster) lights only the "3", so it reads differently from the lockout, where all three light; the loop seam and the poster handoff stay exact. The athlete's highlights are clipped to the silhouette, the knee seam is bridged, and the plate is a bone-ringed disc that reads as load. The back highlight is a soft-ended bone line clipped to the silhouette, on its own layer that fades with depth; the hip and thigh are tapered so the bottom does not read as a blob. |
| 6.4–10.0 | **2 The app** | Hard cuts every 1.2 s between two real screens (the demo's own files, fetched only once the reel starts) and a caption-only card: Today ("Resume where you stopped"), Train ("The whole week, planned") and Learn ("Phase by phase", drawn as three chips, BRACE / REACH / RETURN, the phase control the app's exercise guide shows: all three are on screen from the cut, dimmed, and the phase in play lights at snap speed (BRACE on the cut, REACH at 9.2, RETURN at 9.6) while the volt marker steps with it; no image, and the exercise render and the ab wheel are never shown). Today and Train are whole-card crops (Today the full session card, Train the programme card down to its second row). Screens are cropped to whole elements (both crop edges fall in empty rows, checked by journeys), served from the 720w source on 2x screens, held in the same chamfered pane frame as the rest of the site and stacked above the column grid. Each lands fully visible on its cut and drives the last 2% along the reading axis. |
| 10.0–12.0 | **3 Lockup** | Hard cut: the mark and the wordmark land as one object; "Train with intent." follows at 10.1. Dead still to 12.0, then a hard cut back to the braced athlete. |

Rules for the reel:
- **The first frame is the poster.** The braced athlete with the full readout is the first paint, the no-JavaScript view and the reduced-motion view, and the live reel starts on exactly that frame (pixel-identical).
- **No empty frames.** Every cut, including the loop seam, lands on a full frame. Scene changes are hard cuts; arrivals drive in; nothing overshoots.
- **No rejected vocabulary.** No count-ups, rolling numbers, sweeps, wipes, hairline draws, snapping brackets, staggered rises or ember.
- **Colour:** the volt square (scene 1) or the mark's own glint (scene 3) is the reel's only volt marker; the site hides the gauge square while the reel is in view.
- **Loading:** reel.js loads after the page's load event and never with reduced motion. The screens load only after it starts.
- **Performance:** transform and opacity only. Each limb is its own compositor layer moved by a CSS transform, so the squat never repaints. It plays only while at least half of it is on screen and the tab is visible.
- **Controls:** Pause at the top-right. On wider screens, the chapters (Squat, The app, Lockup) are one toolbar along the bottom: one tab stop, with arrow keys, Home and End.
- **Stage:** 1:1 below 700px; 16:9 above, capped at `min(72svh, 720px)`. Laid out in container units. A "Choose your start" link sits under it.

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
