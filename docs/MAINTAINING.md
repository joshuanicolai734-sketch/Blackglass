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
| Movement Studio and descriptions | `app/movements/page.tsx`, `components/site/movement-studio.tsx`, `content/movements.ts`; see `docs/MOVEMENT_STUDIO.md` |
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

**App name in screenshots:** the Today screen in `public/assets/dashboard*.webp` has an edited Blackglass lockup. These are historical captures, not screenshots of the current 89.0 source build. The reconstructed build has the Blackglass app label; review its actual native header on a phone before distributing new captures.

Then email the preview list (the owner inbox at `/admin`, route "ANDROID PREVIEW LIST") and update the "preview list" captions in `social/KIT.md`.

### Adding a social account

Paste the full profile URL into `content/site.ts → social` (for example `instagram: "https://www.instagram.com/blackglass.nz/"`). It then appears in the footer, on /links and in the homepage's structured data (`sameAs`). Never add an account you haven't checked.

## Funnel

How the home page moves visitors towards coaching (revenue now) and the preview list, and how `/admin` measures each path: `docs/FUNNEL.md`.

## Design system

The direction, the refs it draws on and the rules are in `design/DESIGN_LANGUAGE.md`. In short:

The Android 89.0 source build, historical alignment work and remaining device review gates are in `docs/APP_V88_DESIGN_INTEGRATION.md`. The complete private source bundle is supplied separately from this website repository.

- **Tokens:** `app/tokens.css` is the only place values live (colour, type, spacing, hairlines, motion). `site.css`, the admin styles and the shadcn variables in `globals.css` all read from it. Change a value there, never on top of it.
- **Grounds:**
  - **Glass** (`#0B0D0E`) is home.
  - **Paper** (`#ECEAE3`, add `class="paper"` to a section) is for one or two feature sections per page. It switches every semantic token and adds a 3% grain.
  - On Paper, crimson is a graphic accent. Text and actions use ink.
- **Signal colours:**
  - **Crimson** (`#F43F46`) is for primary buttons on Glass, markers and a single large structural form in the home hero.
  - The deeper red (`#B72F36`) is a tonal part of the same form, not a second signal.
- **Type:** Inter Tight and Geist Mono, five sizes only: label (mono, uppercase, +0.12em), body, title, display (heavy, tight and uppercase) and monument (heavy numerals, one per viewport).
- **Annotation vocabulary:** only four marks are used. Each must point at something real, and there are at most three per viewport.
  1. Hairline rule.
  2. Tick scale. The desktop scroll gauge counts as one tick scale, including its marker.
  3. Registration bracket (`Brackets`, snaps in on hover and focus inside `.snap`).
  4. 6px signal square (`Signal`).
- **Corners:** square, or 45° chamfers (`--chamfer`). No rounded corners.
- **Components** (`components/site/ui.tsx`):
  - `Button` (primary: crimson on Glass, ink on Paper; ghost: hairline chamfer)
  - `TextLink` (the hairline draws on hover)
  - `SectionHead` (`01 — TITLE ———— meta`)
  - `SpecCard` (label–value rows)
  - `Pane` (a real screen as black glass with one specular edge)
  - `Brackets` and `Signal`
  - `Faqs`, `Header`, `Footer` (a colophon) and `Reel`
- **Motion:**
  - Content is complete on first paint. Nothing waits to be revealed and nothing moves on load or on scroll.
  - Motion answers the visitor (hover, focus, a tab, a page change) or lives in the showreel. Don't add entrance animations back.
  - The grammar is **Load · Drive · Lockout** (`app/tokens.css`). Anything arriving, opening or answering drives at `--t-drive` (220 ms, `--ease-expo`, landing in 4–6 frames); anything leaving or closing loads at `--t-load` (350 ms, `--ease-load`, a symmetric ease-in-out); a press or a hover colour takes `--t-snap` (120 ms). `--ease-quart` is for settles only. Every move ends dead still: no bounce or overshoot. Travel runs along the 45° axis or the reading axis.
  - Before adding a motion, name its load, its drive and its lockout. If you can't, don't add it.
  - Animate transform and opacity only (the FAQ height, via `interpolate-size`, is the one exception).
  - With reduced motion, state changes are colour and opacity only.

## Motion pieces

- **Showreel:** `components/site/reel.tsx` (every layer, the athlete's geometry and the first frame, which is the poster) and `public/reel.js` (the engine: a pure `seek(t)` that only sets transform and opacity).
  - It's a 12 s tempo film (a 3-1-1 back squat with a held lockout, two real app screens plus Learn as three phase chips (BRACE / REACH / RETURN), the lockup), loops seamlessly and has no audio. Beat sheet: `design/DESIGN_LANGUAGE.md`.
  - `site.js` loads it after the page's load event and never with reduced motion. The server-rendered first frame is the first paint, the no-JS view and the reduced-motion view. The app screens are fetched only once it starts.
  - The athlete: each limb is an SVG layer moved with a CSS transform in figure units (`--u`). `pose()` exists in both files and must stay identical (a journeys check compares the poster pose with live frame 0). Tune the body in `PARTS` (reel.tsx) and the joints in `MODEL`.
  - App-scene crops (`MODULES` in reel.tsx, `[y, height]` in source pixels of the 720x1560 screens) must start and end in empty rows; a journeys check samples both edges. Never crop to the exercise render (`movement`), and never show the ab wheel. `reel.js` keeps its timings in seconds and never reads CSS time tokens (the minifier rewrites `350ms` as `.35s`).
  - It plays only while at least half is on screen, pauses in background tabs and has its own Pause control at the top-right.
  - **Chapters** (700px and wider): a hairline timeline of the three scenes along the bottom, shown on hover, on focus, while paused, and whenever in view on touch screens. It is one toolbar: one tab stop, arrow keys move between chapters, Enter jumps.
  - `window.blackglassReel.seek(t)` renders any frame, for capturing it to MP4.
- **Interface responses** (CSS in `site.css`, small helpers in `public/site.js`):
  - **Links:** a full-strength hairline drives across the resting one on hover and focus, and loads back out. The header nav has no resting hairline.
  - **Buttons:** hover is the unrack: the arrow drives 4px along the 45° axis and a primary fill lifts 1px along it. Press is the rack: the button settles 1px down and in (`--t-snap`), undoing the lift, and releases at drive speed. `site.js` holds `data-press` for at least `--t-snap`, so a quick phone tap still shows it.
  - **Cards:** registration brackets drive in on hover and focus (`.snap`) and load out.
  - **Demo tabs:** one shared indicator (a hairline and the volt square) drives to the chosen tab. The incoming screen drives in 24px along the direction of travel on top of the outgoing one, whose frame stays until it lands, so the pane is never empty (checked frame by frame at 60 fps). All three panels share one grid cell, so nothing below moves. A horizontal swipe on the screen steps the tabs. Without JavaScript all three screens show; with reduced motion the swap is instant.
  - **Demo screens:** Today and Train ship as `data-src` (`Pane defer`, so the Inter font gets the bandwidth); `site.js` loads them after the load event once the demo is within about 600px, or on the first touch of the tabs. Learn uses a small, lazy-loaded movement still. Loading never waits for hydration, so tab switches take the same time with or without React. `.demo-tabs` has `min-height: 56px`: without it the fixed stage height set by `fit()` collapses the tab grid track on phones. `fit()` follows the active panel on phones only; on desktop the stage keeps the tallest panel's height and the short Learn card is centred in it (`.js .demo-panel[data-demo-panel="technique"]`). `html[data-sticky-on]` already sets `scroll-padding-bottom: 88px`, so nothing focused scrolls under the bar. On phones the focus ring sits on the screen, not the panel (the panel's edge is under the sticky bar). A swap waits for the incoming image to decode, capped at 300 ms.
  - **FAQ:** a 32px hairline box with a plus that becomes a minus. The answer's height drives open; closing fades the words first (`--t-snap`), then loads the height down (`interpolate-size`, Chromium; other browsers snap open). This is the site's one layout animation.
  - **Form success:** after the server confirms, the confirmation replaces the form and takes focus, and its signal rule locks in top to bottom (`.msg.is-ok`). Failures never animate; the email fallback is a ghost button.
- **Scroll gauge** (`public/site.js`, 1100px and wider): a still tick scale on the right edge, one major tick per `[data-sec]` section. The signal square steps to the section in view at drive speed. Decorative, and hidden from assistive tech.
- **Phone action bar** (`StickyCta` in `components/site/chrome.tsx`, below 900px): on the home page (preview list and coaching) and `/coaching` (enquire). It sits right after the header in the DOM, so keyboard users reach it early. It drives in once the hero has left view and loads out for good at the page's decision point (the fork, or the enquiry form): two state changes per page. It steps aside only while a reel control is under it, and moves focus to the page if it hides while focused. It ships `hidden`, so without JavaScript it isn't shown.
- **Phone menu:** while open, `main`, the footer, the phone bar and the rest of the header are `inert`, so Tab stays in the sheet.
- **Signal discipline:** the gauge square rests while the hero, the reel or the closer holds the screen. Screens sit above the column grid (`.pane-glass` z-index 61); the header and phone bar sit above screens (70). The hero screen's own app accent is muted beside the real CTA and returns to full colour on hover.
- **Colophon clock:** the footer shows the current time in Dunedin (`data-clock`), updated to the minute.
- **Hero screen** (1100px and wider): the real Train screen in a `Pane`, the hero's one dominant shape (the demo opens on Today, so no screen repeats; the Technique screen is never used in the hero). It uses `Pane`'s `media` prop, so phones never fetch it and their LCP stays the headline.
- **Screens:** the Android status bar and nav bar are cropped off the real screens in CSS (`.pane-glass img`, 720/1400). Remove the crop once the screens are re-captured cleanly. Repeated screens show a crop (source rows of the 720x1560 files, `object-position = top / (1560 - height)`): hero Train 488-1256 (ends between plan rows 05 and 06; the edit pencil sits at the left of rows 03-04 and cannot be cropped out without a re-capture), demo Train 72-1252 (`crop-plan`, 720/1180, ends under plan row 05), and Today on phones 72-1240 (ends under "Log food"). The real demo screens use 480w/720w `srcset`, are deferred (`data-src`) and warmed near the demo. Learn uses a 480×368 back-squat still from the authored 88.2 pack, with an explicit artwork caption and a link to `/movements`. `.movement-card` preserves its full aspect ratio instead of applying the Android-screen crop. No Android recording of the new artwork is claimed.
- **Demo stage:** on phones `public/site.js` sizes the stage to the active panel (`fit`, animated over `--t-drive`); desktop keeps one shared cell. The sticky phone bar attaches at parse (it carries `suppressHydrationWarning`); tabs, sticky and the skip link work with hydration blocked. `whenHydrated` waits two frames past React marking `<main>`, so the root's first commit has finished before text or children are written.
- **Fonts and hero spacing:** `--font-sans` falls back to "Inter Tight Fallback" (local Arial, `size-adjust: 95.5%`, ascent/descent overrides in `app/tokens.css`), which cut font-swap layout shift from 0.0038 to 0.0001 on desktop (0.0006 to 0.0001 on phones; slow font, dev). Below 1100px the hero has 16px bottom padding (no hero screen there). `.faq-end` is `--section * .3`.
- **Menu focus and cookie:** the mobile menu traps Tab (last link to the summary, Shift+Tab back) in `public/site.js`. The `bg-retry` cookie is `Secure` when `x-forwarded-proto` (first value, else the URL scheme) is https.
- **Get page steps and the fork line:** `/get` beside the form shows `previewSteps` from `content/faq.ts` (facts only; keep them in step with the first `getFaq` answer). The fork's "Want a person, not an app?" line renders only while `coaching.available` is true. It sits under the fork cards at body size with an "Enquire about coaching" link to `/coaching#enquire` (event `cta_fork_coaching`). On /coaching, `.section.fit` ("Built for real weeks") and `.faq-end` (also on /get) trim padding at 900px and up.
- **Page transitions:** a short cross-fade in supporting browsers. The old page loads out before the new one drives in, so two headlines never double-expose. A tapped `/get` button morphs into the preview form's button (`view-transition-name: cta`, set by the `pagereveal` hook in `app/layout.tsx` through a constructed stylesheet); on a phone the hook first brings the form into view. All view transitions are off with reduced motion.
- **Loading:** `public/site.js` is a deferred `<script>` in `app/layout.tsx`, so it runs at DOMContentLoaded without waiting for hydration. Listeners attach at once; anything that changes the page's markup waits until React has hydrated (`whenHydrated`), or hydration would fail and rebuild the DOM.
- **Stylesheets:** public pages load only `app/tokens.css` (with the `@font-face` rules) and `app/site.css`. Tailwind, tw-animate and the shadcn layer live in `app/globals.css`, imported only by `app/admin/layout.tsx`.
- **Call-to-action labels** come from `content/site.ts → app` (`appCta` in `chrome.tsx`): "Join the preview list" until there's a real download, then "Get Blackglass". Never hard-code availability.
- **The launch teaser** is a social asset only (`social/`). The site no longer plays it.

## Measurement

`/api/events` stores **daily counts** only: date, event name and campaign source (`utm_source`). There are no tracking cookies, no IP addresses and no form contents. The only cookie is `bg-retry` (HttpOnly, 120 s, path-scoped to the retry pages), set only when a no-JS form post is rejected so the form can be pre-filled; the privacy page says so.

- **Where to see it:** the owner inbox `/admin` shows the last 30 days.
- **Events:** page visits (`home_view`, `get_view`, `coaching_view`, `links_view`), CTA taps (`cta_*`, `links_*`), `demo_engaged`, outbound app taps (`outbound_play`, `outbound_apk`), plus `preview_signup` and `enquiry_sent`. The last two are counted by the server only when the database save succeeds.
- **To add an event:** add `data-track="name"` to the link and add the name to `db/events.ts → EVENTS`.
- **What the numbers mean:** a download tap is not an install, and nothing here measures app activation.

## Forms

Both forms post to `/api/enquiries` (same database table as before):
- **Coaching enquiry:** route `coaching` or `programme`, with a goal required.
- **Preview list:** route `app`, where the goal is optional.

Validation happens in the browser (`public/site.js`) and again on the server. If a save fails, the visitor is told nothing was saved and is offered a pre-filled email instead.

They work without JavaScript too. Each `<form>` has `method="post" action="/api/enquiries"`. The route accepts JSON (from `site.js`), `application/x-www-form-urlencoded` and `multipart/form-data`, with the same validation, honeypot, two-minute duplicate check and database save. Without JavaScript the browser's own validation runs first (the forms have no `novalidate` attribute; `site.js` sets the `noValidate` property once React has hydrated, and its own messages take over). A plain form post that reaches the server gets a `303` to a static page: `/get/joined`, `/coaching/sent`, or `/get/retry` and `/coaching/retry` with `?error=invalid|duplicate|failed&field=name|email|phone|goal` (the retry page names the field at fault and focuses it). Result pages are `noindex`; `/get` and `/coaching` themselves are fully static. They render from `components/site/forms.tsx`. Nothing the visitor typed ever goes into a URL or a log. On a rejected post the server sets a short-lived cookie (`bg-retry`: HttpOnly, SameSite=Lax, path `/get/retry` or `/coaching/retry`, 120 seconds, fields truncated) holding only what was typed in that form, so the retry page can pre-fill it (`typedFrom` in `forms.tsx`). It is never stored server-side, is cleared by the next successful post, and is the only place typed data travels; the duplicate page has its own heading ("Already received.").

### Timing in scripts

CSS time tokens (`--t-load`, `--t-drive`, `--t-snap`) are read in JavaScript only through `dur()` in `public/site.js` (also `window.blackglassDur`). The production minifier rewrites `350ms` as `.35s`, so never `parseFloat` a token and assume milliseconds. Anything that changes the DOM's text or children, or sets an attribute React also renders (a form's `novalidate`, an image's `src`), waits for `whenHydrated`; listeners can attach at parse, and so can attributes on an element that carries `suppressHydrationWarning` (the sticky bar's `data-show`, `<html>`'s `data-sticky-on`).

## Images

- **App screens:** `public/assets/*.webp`, with 480px versions (`*-480.webp`) used through `srcset`. Replace both when the app changes.
- **OG images and the social kit:** rendered from `social/` (see `social/README.md`).
- **QR code on /get:** `node scripts/generate-qr.mjs`.

## Checks before publishing

```sh
pnpm lint && pnpm exec tsc --noEmit && pnpm build
```

Database changes: edit `db/schema.ts`, run `pnpm db:generate`, and commit the new file in `drizzle/`. Publishing applies it in production. Local steps are in `README.md → Local D1 migrations`.

## Production check

`scratchpad`-style journeys are dev-only, so a second script exists for the production build: `journeys-prod.js` (kept with `journeys.js`). It is read-only (it never submits a form) and takes `BASE=http://localhost:8787` (a production build) or `:5173` (dev). It checks unit-safe timing, the demo swap and press-hold durations, FAQ durations, view transitions, the skip link, the quiet gauge on every hero, the static result routes and console errors. Run it against a fresh build before publishing anything that touches timing or hydration.

## Deploying

The live site is published from the ChatGPT Sites project (see `BLACKGLASS_HANDOFF.md`). This repository is the source. Give Sites the updated source and ask it to publish. It will apply `drizzle/0002_short_agent_brand.sql`, which creates the `events` table, in production.
