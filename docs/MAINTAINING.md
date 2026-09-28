# Maintaining the Blackglass site

The short version: **settings live in `content/`, pages in `app/`, styles in `app/site.css`**.

## Change these most often

| To change… | Edit |
|---|---|
| App availability, download link, APK details | `content/site.ts → app` |
| Coaching price, weeks, on/off | `content/site.ts → coaching` |
| Contact email and phone | `content/site.ts → contact` |
| Social accounts (shown only when set) | `content/site.ts → social` |
| Navigation labels | `content/site.ts → nav` |
| Campaign name for UTM links, QR target | `content/site.ts → campaign`, `qrTarget` |
| Questions and answers | `content/faq.ts` (home, /get, /coaching) |
| Homepage copy and demo screens | `app/page.tsx` (`demo`, `benefits` at the top) |
| Get Blackglass page | `app/get/page.tsx` |
| Coaching page and enquiry form | `app/coaching/page.tsx` |
| Link in bio | `app/links/page.tsx` |
| Privacy notice | `app/privacy/page.tsx` |
| Short redirects (/download, /apply…) | `next.config.ts` |

### When the Android app becomes downloadable

1. Put the file or listing somewhere permanent.
   - **Play Store:** set `app.android.playUrl`.
   - **APK:** set `app.android.apkUrl`, `apkVersion`, `apkSize`, `apkSha256` (from `sha256sum file.apk`) and `minAndroid`.
2. Set `app.android.status` to `"available"`.

That's all. /get switches from the preview list to a download with install steps, and the home steps, FAQ and link-in-bio follow.

**App name in screenshots:** the Today screen in `public/assets/dashboard*.webp` has the Blackglass lockup in place of the app's old header name. The Android build still shows the old name, so rename the app before sending preview builds out.

Then email the preview list (the owner inbox at `/admin`, route "ANDROID PREVIEW LIST") and update the "preview list" captions in `social/KIT.md`.

### Adding a social account

Paste the full profile URL into `content/site.ts → social` (for example `instagram: "https://www.instagram.com/blackglass.nz/"`). It then appears in the footer, on /links and in the homepage's structured data (`sameAs`). Never add an account you haven't checked.

## Funnel

How the home page moves visitors towards coaching (revenue now) and the preview list, and how `/admin` measures each path: `docs/FUNNEL.md`.

## Design system

The direction, the refs it draws on and the rules are in `design/DESIGN_LANGUAGE.md`. In short:

- **Tokens:** `app/tokens.css` is the only place values live (colour, type, spacing, hairlines, motion). `site.css`, the admin styles and the shadcn variables in `globals.css` all read from it. Change a value there, never on top of it.
- **Grounds:**
  - **Glass** (`#101113`) is home.
  - **Paper** (`#ECEAE3`, add `class="paper"` to a section) is for one or two feature sections per page. It switches every semantic token and adds a 3% grain.
  - On Paper, volt only ever appears inside ink shapes (it's 1.04:1 against Paper).
- **Signal colours:**
  - **Volt** is for primary buttons on Glass, markers and active states.
  - **Ember** (`#DE7F4E`) is one moment per page and fill only. The showreel doesn't use it (it would share a frame with volt).
  - Never have both loud in one viewport.
- **Type:** Inter Tight and Geist Mono, five sizes only: label (mono, uppercase, +0.12em), body, title, display (semibold 600, uppercase, +0.04em; the home h1 is heavier and tighter) and monument (heavy numerals, one per viewport).
- **Annotation vocabulary:** only four marks are used. Each must point at something real, and there are at most three per viewport.
  1. Hairline rule.
  2. Tick scale. The desktop scroll gauge counts as one tick scale, including its marker.
  3. Registration bracket (`Brackets`, snaps in on hover and focus inside `.snap`).
  4. 6px signal square (`Signal`).
- **Corners:** square, or 45° chamfers (`--chamfer`). No rounded corners.
- **Components** (`components/site/ui.tsx`):
  - `Button` (primary: volt on Glass, ink on Paper; ghost: hairline chamfer)
  - `TextLink` (the hairline draws on hover)
  - `SectionHead` (`01 — TITLE ———— meta`)
  - `SpecCard` (label–value rows)
  - `Pane` (a real screen as black glass with one specular edge)
  - `Brackets` and `Signal`
  - `Faqs`, `Header`, `Footer` (a colophon) and `Reel`
- **Motion:**
  - Content is complete on first paint. Nothing waits to be revealed and nothing moves on load or on scroll.
  - Motion answers the visitor (hover, focus, a tab, a page change) or lives in the showreel. Don't add entrance animations back.
  - The grammar is **Load · Drive · Lockout** (`app/tokens.css`). Anything arriving, opening or answering drives at `--t-drive` (150 ms, `--ease-expo`); anything leaving or closing loads at `--t-load` (350 ms, `--ease-quart`); a press racks in `--t-rack` (80 ms). Every move ends dead still: no bounce or overshoot. Travel runs along the 45° axis or the reading axis.
  - Before adding a motion, name its load, its drive and its lockout. If you can't, don't add it.
  - Animate transform and opacity only (the FAQ height, via `interpolate-size`, is the one exception).
  - With reduced motion, state changes are colour and opacity only.

## Motion pieces

- **Showreel:** `components/site/reel.tsx` (every layer, the athlete's geometry and the first frame, which is the poster) and `public/reel.js` (the engine: a pure `seek(t)` that only sets transform and opacity).
  - It's a 12 s tempo film (a 3-1-1 back squat, the app's four areas, the lockup), loops seamlessly and has no audio. Beat sheet: `design/DESIGN_LANGUAGE.md`.
  - `site.js` loads it after the page's load event and never with reduced motion. The server-rendered first frame is the first paint, the no-JS view and the reduced-motion view.
  - The squat pose is solved from one depth value. `pose()` exists in both files and must stay identical (the journeys check compares the poster pose with the live frame 0); tune proportions in `PARTS` (reel.tsx) and joints in `MODEL`.
  - It plays only while at least half is on screen, pauses in background tabs and has its own pause control.
  - **Chapters:** a hairline timeline of the three scenes, shown on hover, on focus and while paused. It is one toolbar: one tab stop, arrow keys move between chapters, Enter jumps.
  - `window.blackglassReel.seek(t)` renders any frame, for capturing it to MP4.
- **Interface responses** (CSS in `site.css`, small helpers in `public/site.js`):
  - **Links:** a full-strength hairline drives across the resting one on hover and focus, and loads back out. The header nav has no resting hairline.
  - **Buttons:** the arrow drives 3px along the 45° axis on hover. On press the button racks (1px down and in, `--t-rack`) and releases at drive speed. `site.js` holds `data-press` for at least `--t-rack`, so a quick phone tap still shows it.
  - **Cards:** registration brackets drive in on hover and focus (`.snap`) and load out.
  - **Demo tabs:** one shared indicator (a hairline and the volt square) drives to the chosen tab. The outgoing screen loads out against the direction of travel, and the incoming one drives in 24px along it. All three panels share one grid cell, so nothing below moves. Without JavaScript all three screens show; with reduced motion the swap is instant.
  - **FAQ:** a 32px hairline box with a plus that becomes a minus. The answer's height drives open and loads closed (`interpolate-size`, Chromium; other browsers snap open).
  - **Form success:** after the server confirms, the message's volt rule locks in top to bottom (`.msg.is-ok`). Failures never animate.
- **Scroll gauge** (`public/site.js`, 1100px and wider): a still tick scale on the right edge, one major tick per `[data-sec]` section. The signal square steps to the section in view at drive speed. Decorative, and hidden from assistive tech.
- **Phone action bar** (`StickyCta` in `components/site/chrome.tsx`, below 900px): on the home page (preview list and coaching) and `/coaching` (enquire). It drives in once the hero has left view and loads out while the fork, a form, the closer, the reel's pause control or the footer is on screen. It ships `hidden`, so without JavaScript it isn't shown.
- **Colophon clock:** the footer shows the current time in Dunedin (`data-clock`), updated to the minute.
- **Hero screen** (1100px and wider): the real Today screen in a `Pane`, the hero's one dominant shape. It uses `Pane`'s `media` prop, so phones never fetch it and their LCP stays the headline.
- **Screens:** the Android status bar is cropped off every `Pane` in CSS (`.pane-glass img`). Remove the crop once the screens are re-captured cleanly.
- **Page transitions:** a short cross-fade in supporting browsers. A tapped `/get` button morphs into the preview form's button (`view-transition-name: cta`), but only when that button is on screen as `/get` opens (the `pagereveal` hook in `app/layout.tsx`). All view transitions are off with reduced motion.
- **Call-to-action labels** come from `content/site.ts → app` (`appCta` in `chrome.tsx`): "Join the preview list" until there's a real download, then "Get Blackglass". Never hard-code availability.
- **The launch teaser** is a social asset only (`social/`). The site no longer plays it.

## Measurement

`/api/events` stores **daily counts** only: date, event name and campaign source (`utm_source`). There are no cookies, no IP addresses and no form contents.

- **Where to see it:** the owner inbox `/admin` shows the last 30 days.
- **Events:** page visits (`home_view`, `get_view`, `coaching_view`, `links_view`), CTA taps (`cta_*`, `links_*`), `demo_engaged`, outbound app taps (`outbound_play`, `outbound_apk`), plus `preview_signup` and `enquiry_sent`. The last two are counted by the server only when the database save succeeds.
- **To add an event:** add `data-track="name"` to the link and add the name to `db/events.ts → EVENTS`.
- **What the numbers mean:** a download tap is not an install, and nothing here measures app activation.

## Forms

Both forms post to `/api/enquiries` (same database table as before):
- **Coaching enquiry:** route `coaching` or `programme`, with a goal required.
- **Preview list:** route `app`, where the goal is optional.

Validation happens in the browser (`public/site.js`) and again on the server. If a save fails, the visitor is told nothing was saved and is offered a pre-filled email instead.

## Images

- **App screens:** `public/assets/*.webp`, with 480px versions (`*-480.webp`) used through `srcset`. Replace both when the app changes.
- **OG images and the social kit:** rendered from `social/` (see `social/README.md`).
- **QR code on /get:** `node scripts/generate-qr.mjs`.

## Checks before publishing

```sh
pnpm lint && pnpm exec tsc --noEmit && pnpm build
```

Database changes: edit `db/schema.ts`, run `pnpm db:generate`, and commit the new file in `drizzle/`. Publishing applies it in production. Local steps are in `README.md → Local D1 migrations`.

## Deploying

The live site is published from the ChatGPT Sites project (see `BLACKGLASS_HANDOFF.md`). This repository is the source. Give Sites the updated source and ask it to publish. It will apply `drizzle/0002_short_agent_brand.sql`, which creates the `events` table, in production.
