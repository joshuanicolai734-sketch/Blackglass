# Website Movement Studio

`/movements` previews the authored artwork from Blackglass 88.2. It does not run the Android app, assess a visitor’s form, measure muscle activation or render a freely rotatable model.

## Source and assets

- Source APK SHA-256: `307d56afef53c241bda2a583f1282df4d9385067a2163492807297aaaaf7ddbc` (`88.2-motion`).
- Back squat with a barbell, deadlift with a barbell and bodyweight push-up; each has the actual angled and `@FRONT` S3D view.
- `scripts/export-movement-preview.py` verifies the APK digest and S3D headers, dimensions, flags, frame offsets and uniform phase samples. It exports all 64 original frames into each four-second MP4, plus the first-frame posters and the homepage squat still. It does not interpolate new poses.
- `public/movements/manifest.json` records source pack and output digests. The APK, signing keys and rebuild archive are not committed.
- Video playback is a browser preview of the rendered artwork. Native Android playback can use different timing and blending.

## Behaviour

- `content/movements.ts`: exercise names, equipment, descriptions and phase notes. Notes describe the illustration rather than giving personalised advice.
- `components/site/movement-studio.tsx`: keyboard exercise tabs; play/pause; reset; half speed; native range scrubbing; phase jumps and view selection.
- Playback starts paused. Videos use `preload="none"` until an explicit interaction; only the active study is warmed.
- Changing the view pauses at the same normalised position. Changing exercise resets to Brace. Backgrounding the document, moving the studio offscreen or enabling reduced motion pauses playback. Returning never resumes automatically.
- A polite live region announces exercise/view changes, phase jumps and speed changes. Continuous playback progress is not a live announcement. Focusing the scrubber pauses the video so its accessible value can be explored with arrow keys.
- Before hydration and without JavaScript, all three studies, native video controls, text descriptions, phase notes and direct alternate-view links remain available. A failed clip leaves a poster and notes, with an announced error and direct clip link.
- The homepage Learn panel links here and labels its still as new movement artwork. The footer and sitemap include the route. Availability and the next-step CTA follow the existing `hasDownload`/`appCta` settings.

## Measurement

`movements_view`, `cta_movement_home`, `movement_engaged` (first enhanced player interaction per document) and `cta_movement_preview` use the existing cookie-free daily counts. Engagement is neither a signup nor an install. Preview signups and coaching enquiries continue to be counted by the server only after their existing database insert succeeds. No schema change is needed.

## Native app limit

The matching full current Android source and a real phone test are still required for native progression, coaching, session planning or meal-prep features. The saved 88.2 prototype contains the movement asset rebuild; it does not implement those new workflows.

## Browser review

The supervised Chrome preview was checked on 30 September 2026. All three exercises loaded; changing views retained the selected position and paused; phase jumps, half speed, keyboard exercise selection and scrubbing worked. Rapid Play followed by a scrub no longer produces a false playback error. Frame viewports at 390px and 320px showed no horizontal overflow after the small-screen label fix. With scripts disabled, all three studies retained native controls and the video could be played and paused from the keyboard. The homepage Learn link reached the studio.

The [desktop review](reviews/movement-studio-review.jpg) shows the squat paused at Reach. These checks are browser previews, not real-phone, Safari, Firefox or native Android validation. Lifecycle and reduced-motion pause handlers were reviewed in source; changing the browser's reduced-motion setting was not exercised.
