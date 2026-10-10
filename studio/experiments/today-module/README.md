# Today module prototype (BG-007-20261006-TODAY)

An isolated, standalone prototype of the Today signature module. It is **not** the app, not a released feature, and does not imply a public download. Everything on screen is labelled synthetic sample data. Nothing is saved or sent: the only storage is `sessionStorage` for the "resume" demo, wrapped in try/catch.

Open `index.html` through any static server from the repository root (it reads fonts from `public/fonts/`, falling back to system fonts): `python3 -m http.server`, then `/studio/experiments/today-module/index.html`.

## What it shows
- **Next action first.** One clear line (movement, set n of m) and one primary lime button: Start session, Complete set, Resume session, Start again.
- **Readable session structure.** A rail with four movements, a tick per set, a count in words, and a lime square on the current movement.
- **Set-complete feedback.** The tick locks in, the rail fill advances, the button reads "Set logged" at the thumb, and a polite status line says the same.
- **Resume.** Pause, then Resume; a reload mid-session comes back paused with progress kept. Reset returns to the start.

## Motion: two approaches compared
| | A. Line assembly into the Today surface | B. Data-to-action transition |
| --- | --- | --- |
| Idea | Rail draws, rows resolve in order, then Next and the action land | Counts or figures morph into the Next line and button |
| Supports the action | The eye travels down the structure and ends on the button | The eye ends on the button, but only if the data is already known |
| Cost and risk | Transform and opacity only; static without it | Needs live numbers to mean anything. With sample data it would be decoration |
| Fit with the motion system | Load, Drive, Lockout: draws (Load), lands (Drive), then still | Harder to name a lockout |

**Chosen: A.** It plays once (when the module scrolls into view, or on "Replay the intro"), takes about 1.4 s, and then the module is still. Set completion uses a short tick lock (one drive) rather than more assembly. Reduced motion: no assembly and no tweens; the same states change instantly and stay marked.

## Interaction rules
- A logged set holds the button for 450 ms (`aria-disabled`, focus kept), so a rapid double click or Enter logs one set.
- Keyboard: Tab order is skip link, primary, replay (Pause and Reset join when shown). Enter and Space work. No focus trap. Focus moves to the primary button after Pause and Reset, so it never lands on a hidden control.
- Touch targets are at least 52 px tall. Smallest text is 12 px.
- No JavaScript: the full plan and the first action are readable; the buttons stay hidden and a note says logging needs JavaScript.

## Critique and fix (one round)
The first snapshot is in `evidence/initial/`. Critique, strongest weaknesses:
1. The primary button moved down when the "Next" line wrapped to two lines ("Romanian deadlift, set 2 of 3"), so the thumb target shifted mid-session.
2. Set-complete feedback was weak: 8 px ticks and a small status line far from the button.

Fix: the Next line reserves two lines of height, ticks are 12 px, and the button itself says "Set logged" for the hold. Measured on 360 px: the button's y position is constant across all ten sets (it shifts 27 px only on the final "Session complete" screen, where the helper text wraps). Final snapshots are in `evidence/final/`. Not fixed: the lime square is the only "current" marker besides the numeral colour; a second non-colour cue is the 12 px ticks and the "n of m sets done" text.

## Integration notes for Gamma (this repository is the older baseline, not v33)
- Palette: the repository tokens still say crimson. This prototype sets its own `--c-lime: #DFFF00` locally and touches no app-wide token. In v33 use the live `--c-volt`/`--signal`/`--action`.
- Reusable surface: `today.js` is a single state object (`phase`: idle, active, paused, done; `done`: sets logged) with one `render()`. In v33 replace the `MOVES` array with the real session data and keep `hold()`, `aria-disabled` locking and the reduced-motion guards.
- CSS to port: `.today`, `.structure`, `.rail`, `.move`, `.tick`, `.next`, `.btn.primary` and the `.assemble` block. Motion uses only `opacity`, `transform` and `stroke-dashoffset`.
- App claims: the module shows nothing the screens in `public/assets/` don't already imply (a session list and a next action). The copy says "sample" throughout. Do not ship the sample numbers.

## Evidence
Environment: headless Chromium (`/opt/pw-browsers/chromium`), Playwright core and axe-core installed in a scratch directory outside the repository, static server on localhost. No physical phone.

- Overflow, smallest text and button sizes at 320, 360, 430, 1280 and 1440 CSS px with motion: none overflow, text 12 px minimum, no button under 44 px. Reduced motion (all five widths) and no JavaScript (320 and 1280): the same.
- Flows at 360 px with touch: start, double click logs one set, keyboard Enter logs one set, pause, reload comes back paused with 2 sets, resume, finish 10 of 10, start again, reset, replay. 0 page errors.
- axe-core (WCAG 2 A/AA, 2.1 AA, 2.2 AA and best-practice) at 360 px: 0 violations.
- Network: 0 requests outside localhost. The only console message is a 404 for the browser's automatic `favicon.ico` request.
- Repository checks: `pnpm install --frozen-lockfile && pnpm lint && pnpm exec tsc --noEmit && pnpm build` pass (0 errors, 0 warnings).

Not tested: any physical phone or touch hardware, Safari or Firefox, a screen reader, low-end device performance, the offscreen-pause behaviour beyond "the intro starts only when the module is in view" (there is no looping animation to stop), and the v33 source.

## Round 2 (critic findings on `d017111`)
- One column at every width. The rail fill now follows row positions (`drawRail()`), so after 6 sets it ends at the bottom of movement 02, not inside 03.
- "Replay the intro" is hidden under reduced motion and follows the media query live. Replay clears its cleanup timer, and the actions ignore pointer input while the intro runs.
- No-JS copy is neutral; the reserved two-line "Next" height applies below 600 px only; the pane rule is an inset shadow (the outline was clipped); the dead `aria-pressed` rule and attribute are gone.
- Evidence: `evidence/round2/`.
