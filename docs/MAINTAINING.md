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

That's all. /get switches from the preview list to a download with install steps, and the home steps, FAQ and link-in-bio follow. When the app no longer shows "Obsidian", set `app.appShowsFormerName` to `false`.

Then email the preview list (the owner inbox at `/admin`, route "ANDROID PREVIEW LIST") and update the "preview list" captions in `social/KIT.md`.

### Adding a social account

Paste the full profile URL into `content/site.ts → social` (for example `instagram: "https://www.instagram.com/blackglass.nz/"`). It then appears in the footer, on /links and in the homepage's structured data (`sameAs`). Never add an account you haven't checked.

## Design system

- **Tokens** (colour, type, spacing, motion) are at the top of `app/site.css`.
- **Colour:** ink `#101113` ground · pane `#18191C` · facet `#2B2D32` · bone `#F4F5EF` · volt `#D5FF3F`. Volt is the glint: primary buttons and small markers only.
- **Type:** Inter Tight for display and body (self-hosted variable font). Geist Mono for labels. Both are in `public/fonts`, with licences in `licenses/`.
- **The motif is the facet.**
  - Chamfer the top-left and bottom-right corners (`--chamfer`, `--cut`).
  - Light the upper-left half of panes (`.pane`).
  - Wipe reveals along 45° (`facet-wipe`).
  - Use the octagon outline as the section marker and the hero "window".
- **Components** (`components/site/`): `Button` (primary / ghost / quiet), `Label`, `Pane` (real app screens in glass), `Faqs`, `Header`, `Footer`.
- **Motion:** use `--ease-out`, `--ease-in-out`, `--t-fast` (160 ms), `--t-med` (320 ms) and `--t-slow` (640 ms). Keep new motion on the 45° axis and under 700 ms. Everything must work with reduced motion and without JavaScript.

## Motion pieces

- **Intro:** `components/site/intro.tsx` (markup) and `intro.js` (timings in `T`, about 1.9 s).
  - The head gate in `app/layout.tsx` decides before first paint whether it plays: homepage only, once per tab session, and never for deep links, `utm_` campaign links or reduced motion.
  - `?intro=1` forces it and `?intro=0` skips it.
  - If anything fails, the page is shown immediately. A CSS fail-safe also lifts it after 3.5 s.
- **Ambient light:** the WebGL shader in `public/site.js` (search "Ambient light"). It renders at half resolution and about 30 fps. It pauses offscreen, in background tabs and via the footer's "Pause background motion" button (remembered per visitor), and never starts with reduced motion. The static CSS light (`.ambient`) is the fallback.
- **Reveals and demo tabs:** also in `public/site.js`. The demo shows all three screens without JavaScript.
- **Polish layer** (CSS at the end of `app/site.css`, behaviour in `public/site.js`):
  - **Living glass:** with a mouse, panes tilt slightly toward the pointer and catch its light. A slow sheen crosses each pane's glass.
  - **Kinetic band:** "Plan. Train. Learn. Fuel." after the hero. It only runs while on screen, and stops with the footer pause button or reduced motion.
  - **Heading wipes:** homepage `h2`s marked `data-wipe` cut in on the 45° axis when they scroll into view.
  - **Closing mark:** the mark above "Train with intent." draws its rim and sweeps its glint once.
  - **Page transitions:** a cross-fade between pages in supporting browsers.
  - **Scroll hairline:** a progress line under the header.
  - **Teaser:** "Watch the teaser" opens `public/media/teaser-*.mp4` in a dialog, choosing the vertical cut on portrait screens. It's counted as `teaser_open`. Without JavaScript the link opens the MP4 directly. The teaser is a 22 s, 150 BPM cut at 60 fps. To update it, follow the teaser steps in `social/README.md`, then replace the posters (frames at 3.7 s) and `teaser-thumb.webp`.

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
