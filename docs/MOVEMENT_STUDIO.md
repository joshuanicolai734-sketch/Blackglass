# Website Movement Studio

`/movements` previews authored movement artwork from the Blackglass Android builds: since Sites v34, clips exported from build 91.0-industrial (88.2 before that). It does not run the Android app, assess a visitor’s form, measure muscle activation or render a freely rotatable model.

## Source and assets

**Sites v34 (current).**

- The six clips and six posters came from build `91.0-industrial`, as `public/movements/manifest.json` records with each file's size, SHA-256 and source pack. This repository has no export script for 91.0, and the 91.0 APK digest isn't recorded.
- They were copied byte-for-byte from the published site on 7 November 2026. `pnpm check:v34` re-checks every digest.
- `back-squat-cover.webp` is the published site's file but isn't used on any page.
- The home page's curl study (`public/movements/curl-study/`, `components/site/study-player.tsx`) is separate rendered artwork from the published site. Its source pack isn't recorded, and its own text says qualified technique review is pending.

**Before v34 (88.2), kept for history.** The 88.2 manifest is in git history before `d644d77`.

- Source APK SHA-256: `307d56afef53c241bda2a583f1282df4d9385067a2163492807297aaaaf7ddbc` (`88.2-motion`).
- Back squat with a barbell, deadlift with a barbell and bodyweight push-up; each has the actual angled and `@FRONT` S3D view.
- `scripts/export-movement-preview.py` verifies the APK digest and S3D headers, dimensions, flags, frame offsets and uniform phase samples. It exports all 64 original frames into each four-second MP4, plus the first-frame posters and the homepage squat still. It does not interpolate new poses.
- The 88.2 manifest recorded source pack and output digests. The APK, signing keys and rebuild archive are not committed.
- Video playback is a browser preview of the rendered artwork. Native Android playback can use different timing and blending.

## Behaviour

- `content/movements.ts`: exercise names, equipment, descriptions and phase notes. Notes describe the illustration rather than giving personalised advice. Since v34 the phases are named per exercise: Set up / Lower / Stand (squat), Set up / Lift / Lower (deadlift), Set up / Lower / Press (push-up).
- `components/site/movement-studio.tsx`: keyboard exercise tabs; play/pause; reset; half speed; native range scrubbing; phase jumps and view selection.
- Playback starts paused. The active study preloads its metadata, the others nothing, until an explicit interaction warms the active clip.
- Seeking (v34, "seekable-range-v7", `lib/seekable.ts`):
  - A jump (phase, scrub, view change or exercise change) is held as a pending position, and the clip seeks only where the browser says it can.
  - While the position is pending, the frame shows "Loading selected position…" and the caption reads "Updating position…".
  - A watchdog retries the seek every 500 ms until the frame lands. If it hasn't landed 8 s after the last interaction, it stops, says so, and offers Reset and the direct clip link.
  - On a host that answers byte ranges (the Worker on Josh's own Cloudflare account), the frame lands at once. On ChatGPT Sites, which answers range requests with the whole file, browsers may refuse the jump, so it may not land at all.
- Under the frame, the caption names the exercise and the current phase, and a three-part phase track fills as the rep plays.
- Changing the view pauses at the same normalised position. Changing exercise resets to Set up. Backgrounding the document, moving the studio offscreen or enabling reduced motion pauses playback. Returning never resumes automatically.
- A polite live region announces exercise/view changes, phase jumps and speed changes. Continuous playback progress is not a live announcement. Focusing the scrubber pauses the video so its accessible value can be explored with arrow keys.
- Before hydration and without JavaScript, all three studies, native video controls, text descriptions, phase notes and direct alternate-view links remain available. A failed clip leaves a poster and notes, with an announced error and direct clip link.
- Since v34 the homepage Learn panel shows the curl study and links here ("Explore the existing Movement Studio"). The footer and sitemap include the route. Availability and the next-step CTA follow the existing `hasDownload`/`appCta` settings.

## Measurement

`movements_view`, `cta_movement_home`, `movement_engaged` (first enhanced player interaction per document) and `cta_movement_preview` use the existing cookie-free daily counts. Engagement is neither a signup nor an install. Preview signups and coaching enquiries continue to be counted by the server only after their existing database insert succeeds. No schema change is needed.

## Native app limit

The matching full current Android source and a real phone test are still required for native progression, coaching, session planning or meal-prep features. The saved 88.2 prototype contains the movement asset rebuild; it does not implement those new workflows.

## Browser review

**7 November 2026 (v34 rebuild).** In headless Chromium, the rebuilt studio and v34's own compiled code were compared on the same media (VP9 transcodes of the v34 clips) and the same range-capable host.

- The script ran 14 steps: phase jumps, scrub, view change, exercise change by click and keyboard, half speed, reset, and play then pause.
- 1,089 of 1,092 recorded values were identical. The 3 differences are the phase-track fill after the play-then-pause step, from sub-millisecond differences in playing time.
- The page's markup matches the published page (`pnpm check:v34 --pages`).
- None of this is real-phone, Safari, Firefox or native Android validation.

**30 September 2026 (88.2).** The supervised Chrome preview was checked on 30 September 2026. All three exercises loaded; changing views retained the selected position and paused; phase jumps, half speed, keyboard exercise selection and scrubbing worked. Rapid Play followed by a scrub no longer produces a false playback error. Frame viewports at 390px and 320px showed no horizontal overflow after the small-screen label fix. With scripts disabled, all three studies retained native controls and the video could be played and paused from the keyboard. The homepage Learn link reached the studio.

The [desktop review](reviews/movement-studio-review.jpg) shows the squat paused at Reach (the 88.2 phase names). These checks are browser previews, not real-phone, Safari, Firefox or native Android validation. Lifecycle and reduced-motion pause handlers were reviewed in source; changing the browser's reduced-motion setting was not exercised.
