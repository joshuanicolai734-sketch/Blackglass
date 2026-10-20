# Blackglass training experience

`/experience` is an isolated, working browser concept. It lets a visitor choose one of three authored movement studies, log nine example sets, use a deadline-based rest timer, undo a set, and return to their saved browser session. It is explicitly separate from the Android application.

## Scope and source

- Base: GitHub `b87393d8a5ffff089ecc327ec0212e67161e1921` on the repository's default branch.
- Existing pages, navigation, availability settings, enquiry flow, database, measurement, hosting manifest and movement assets are unchanged.
- Media is reused from the public repository's authored movement pack, not from private preview assets.
- Current Sites metadata inspected on 20 October 2026 reports latest saved version 33, source `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`. A saved version is not proof of a live deployment. The supported source-opening helper returned `Unable to prepare the Site`, so source compatibility with that version is not claimed.
- This route is deliberately not linked from the homepage or sitemap until an integrator reconciles it with the current website source. It can be reviewed directly at `/experience` in a checkout running this branch. GitHub upload is not live publication.

## Implementation

- `components/site/training-experience.tsx`: client interaction, locally persisted session, movement playback, focus handoff and recovery.
- `lib/experience/session.ts`: validation, immutable set logging, restore and totals.
- `app/experience/`: route metadata, truthful product status, scoped responsive styles and calls to action derived from existing settings.
- `scripts/check-experience.mjs`: reproducible state-model checks.

No new dependencies. No network endpoint, schema or analytics event was added. The storage key is `blackglass-experience-v1`; entries stay in the visitor's browser. Browser storage denial falls back to a temporary in-memory session and is stated in the UI. Clearing the demo requires an inline confirmation. External-load volume is reps × added weight; bodyweight is excluded.

Motion is user-initiated. Movement playback pauses offscreen, in background tabs and when reduced-motion preference is enabled. Rest uses an absolute deadline, so a backgrounded tab does not lengthen a rest interval. Without JavaScript, enhanced controls are disabled and links to the native-video Movement Studio and Get Blackglass remain available.

## Verification

Run the repository gates before committing:

```sh
pnpm lint
pnpm exec tsc --noEmit
node --experimental-strip-types scripts/check-experience.mjs
pnpm build
```

All four commands passed in the implementation environment. The state checks cover valid/invalid input boundaries, corrupt and incompatible storage, duplicate submission, immutable updates, expired rest on restore, all nine sets, and bodyweight exclusion.

Browser review in Chromium covered the 1363 px desktop layout and a 390 px iframe with a 375 px content viewport. Neither overflowed horizontally. A set recorded 8 reps × 20 kg as 160 kg added-load volume, survived reload, and could be undone. A reset cleared a deliberately edited draft back to 8 reps / 0 kg. Focus returned to the reps field after logging/reset. The video played with media readyState 4, and camera change returned it to a paused front view. Mobile set logging was also verified. No application console errors were observed (an unrelated browser-extension metadata error was present). No-JavaScript and storage-denied behavior were source-reviewed, not browser-emulated. Real Android handset, Safari and Firefox performance are not claimed.

## Integration

Keep this change additive. Reconcile the current site source before copying these files into a release checkout, then add an appropriate discovery link after reviewing the full journey. Preserve all current product settings and public/private asset boundaries. Revert the new files to remove the demo; no database rollback is needed.
