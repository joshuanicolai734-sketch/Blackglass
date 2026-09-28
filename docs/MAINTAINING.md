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

## Design system

The direction, the refs it draws on and the rules are in `design/DESIGN_LANGUAGE.md`. In short:

- **Tokens:** `app/tokens.css` is the only place values live (colour, type, spacing, hairlines, motion). `site.css`, the admin styles and the shadcn variables in `globals.css` all read from it. Change a value there, never on top of it.
- **Grounds:**
  - **Glass** (`#101113`) is home.
  - **Paper** (`#ECEAE3`, add `class="paper"` to a section) is for one or two feature sections per page. It switches every semantic token and adds a 3% grain.
  - On Paper, volt only ever appears inside ink shapes (it's 1.04:1 against Paper).
- **Signal colours:**
  - **Volt** is for primary buttons on Glass, markers and active states.
  - **Ember** (`#DE7F4E`) is one moment per page and fill only. On the home page that moment is the showreel.
  - Never have both loud in one viewport.
- **Type:** Inter Tight and Geist Mono, five sizes only: label (mono, uppercase, +0.12em), body, title, display (light, uppercase, +0.3em) and monument (heavy numerals, one per viewport).
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
  - Use `--t-1…4` (150 / 250 / 350 / 600 ms) with `--ease-expo` or `--ease-quart`, ease-out only.
  - Animate transform and opacity only.
  - With reduced motion, everything collapses to fades.

## Motion pieces

- **Showreel:** `components/site/reel.tsx` (the band, poster and pause control) and `public/reel.js` (the engine and beat sheet).
  - It's 24 s, loops seamlessly and has no audio.
  - `site.js` loads it after the page's load event and never with reduced motion. The static lockup poster is the first paint and the reduced-motion version.
  - It pauses offscreen, in background tabs and with its own control.
  - `window.blackglassReel.seek(t)` renders any frame, for capturing it to MP4.
- **Reveals, demo tabs and scroll gauge:** in `public/site.js`.
  - Content below the fold fades in, and spec cards draw their hairline first.
  - The demo shows all three screens without JavaScript.
  - The gauge (1100px and wider) puts a tick on the right edge for each `[data-sec]` section on the page.
- **Choreography** (CSS in the "Motion" block of `site.css`, triggers in `site.js`):
  - **Hero:** the headline rises word by word out of hairline masks (`Words`). The section-header hairlines draw. On 1100px and wider, the Glass Pane outline draws side by side, then scales away as the hero leaves (a scroll timeline). The paragraph is left still, so first paint is never held back.
  - **Sections:** headers draw their hairlines and tick their index up (`data-enter`, `data-tick`). Headings rise word by word. The coaching price counts up (`data-count`).
  - **Paper sections:** Glass wipes down off them along a hairline once they are 35% into view. A scroll fallback opens them if a jump skips the trigger.
  - **Demo tabs:** the new screen is uncovered by a mask travelling down with a scan hairline.
  - **Reticle:** with a mouse, one set of registration brackets glides between hovered targets and locks onto their bounds. Keyboard focus keeps the per-card brackets.
  - **Scroll gauge:** shows the index of the section in view.
  - **FAQ:** answers ease in when opened.
  - Everything is transform and opacity. None of it runs with reduced motion, and without JavaScript every element is in its final state.
- **Page transitions:** a short cross-fade in supporting browsers.
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
