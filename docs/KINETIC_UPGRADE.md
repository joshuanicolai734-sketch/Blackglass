# Blackglass kinetic UI pass — local review, 30 September 2026

This upgrade extends the actual poster system: Glass `#0B0D0E`, bone `#F1EEE6`, crimson `#F43F46`, Inter Tight and Geist Mono. It was materialized from the current public website branch at GitHub commit `7339f567fb0da62b633791612a0240f978981984`, tree `b009c607ebd6065b79cea66e666d5060dae35b9a`. It has not been pushed, merged or deployed.

## What changed

- The home hero now pairs its complete, immediately readable promise with an authored nine-second kinetic poster. Load, Drive and Lock in use a controlled build, a fast diagonal drive and a long still finish. Three chapter buttons and a pause control expose the sequence. This is brand artwork, not an app screen or exercise demonstration.
- The crimson arc belongs to the film rather than sitting behind useful text. The headline rhythm, mobile spacing and poster proportions carry the same typography through 320px phones, tablets and desktop.
- The Movement Studio has stronger camera controls, registration corners, a phase caption beneath the video and a segmented progress strip tied to actual playback. These elements stay outside the body image. All existing video playback, camera retention, speed, phase jumps, scrubbing and keyboard tabs are preserved.
- The separate squat reel now uses a full one-second drive: 3 seconds lower, 1 second pause, 1 second drive. A far leg, fixed ground shadow and phase-specific cues improve the read. The bar stays over midfoot and the ankle contact stays fixed. The existing 88.2 studio video assets are unchanged; this pass does not claim they were rebuilt from the current Android source.

## Motion and accessibility

`components/site/motion-poster.tsx` samples a deterministic timeline and writes transforms and opacity; it performs no layout measurements per frame. The RAF stops when less than 30% visible, in a background tab, on pagehide and on unmount. Pageshow can resume eligible playback at the preserved point. Explicit pause and reduced motion remain latched until the visitor chooses Play. Reduced motion starts on a static Lock in composition; chapter selection stays instant. No flashing, shake, audio, scroll hijacking or content entrance gates were added.

The reel also pauses on live reduced-motion changes and pagehide, and cleans up when removed. Changing the preference back never silently starts it. The site's no-JavaScript poster, content, native movement videos and forms remain available.

## Build and local review

Install the existing lockfile with `pnpm install --frozen-lockfile`. Required checks remain `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm build`.

All three checks pass. The read-only browser run passes 48 assertions covering film controls, live reduced motion, offscreen/page lifecycle, three repeated studio visits and playback/camera changes, native no-JavaScript video, mobile menu behavior, and no horizontal overflow at 320, 390, 768 and 1440px on `/`, `/movements`, `/get` and `/coaching`. The four routes have zero axe-core 4.13.0 WCAG A/AA violations in that Chromium run. This is an automated scan, not a full accessibility certification. A separate reel review verifies five keyframes and six lifecycle/mechanics checks. Existing 320px CTA/card overflow was repaired with wrapping buttons and minimum-zero grid columns.

The type and lint configurations now exclude already-ignored tool caches and review outputs so local installed QA packages are not treated as site source. No production code is excluded.

`scripts/verify-motion.mjs` runs read-only Chromium journeys. Supply `PLAYWRIGHT_MODULE` if Playwright lives outside the checkout, `CHROMIUM_EXECUTABLE` for an installed browser, and optionally `AXE_PATH` for axe-core. `BASE` defaults to `http://127.0.0.1:5174`. It saves the detailed result and screenshots in ignored `outputs/`.

`node scripts/verify-reel-mechanics.mjs` directly exercises the production solver at 1,001 poses, checking fixed contact, constant limb lengths, grip/bar alignment and controlled timing. `scripts/verify-reel.mjs` captures five production keyframes and tests live reduced motion, page lifecycle and mobile bounds; it accepts the same `BASE`, `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` settings. The matching browser and mechanics JSON reports are included in the review bundle.

The Windows Cloudflare development runtime stalled before listening. The built frontend was therefore reviewed using `node node_modules/vinext/dist/cli.js start --port 5174`. That Node preview serves the production UI; Cloudflare-specific API requests cannot execute there. No form was submitted, no production database was read or changed, and no backend compatibility claim is made from this preview. Build validation passed with the existing Cloudflare configuration unchanged. Before publishing, perform the production D1/form/authentication smoke checks in the existing Sites environment.

Browser checks are desktop Chromium and responsive emulation. They do not establish physical-phone frame pacing, native Android behavior, Safari or Firefox support. Existing real Android captures are historical evidence and remain labelled accordingly.

## Asset and dependency provenance

The new poster is original project-authored typography and simple geometric motion. No external stock assets, new runtime dependencies or font downloads were added. Existing Inter Tight and Geist Mono font licenses remain in `licenses/OFL-InterTight.txt` and `licenses/OFL-GeistMono.txt`. The existing movement asset provenance is in `docs/MOVEMENT_STUDIO.md` and `public/movements/manifest.json`. Playwright and axe-core were used only as local QA tools, not shipped to visitors.

Public app availability, prices, account boundaries, enquiry handling, measurement, hosting configuration and database schemas are unchanged. The Android source, signing keys, customer data, caches and local environment files must remain outside the public website repository.

## Deliverable packaging

The runnable website source ZIP includes all runtime assets, source, manifests, lockfile and licenses. It omits only `.git`, installed dependencies, local caches/build outputs, and the unchanged `social/exports/` legacy rendered campaign videos and stills (about 151 MB). Social source scripts remain included; the omitted exports are retained unchanged in the public source repository. The focused patch applies to the recorded source base. The separate review bundle contains screenshots, the actual-renderer nine-second WebM preview and detailed JSON check results. Nothing has been uploaded to a public repository or published to Sites.
