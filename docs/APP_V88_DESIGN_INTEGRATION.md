# Blackglass Android v88: website alignment and motion integration

This is the implementation handoff for the supplied `Blackglass-88_0-Flow-3D.apk` (SHA-256 `398037c3d9acabbc63e4028e83c716eef73c372ba92d66f035ac0374b6841b76`). It is an inspection of the package, not a claim that its exercise motion has been visually validated on a phone.

## Verified in the supplied APK

- The launcher still has the lime facet. The site now uses poster-black `#0B0D0E`, bone `#F1EEE6`, crimson `#F43F46`, and facet `#2B3032`; the canonical logo paths are in `public/brand/` and `content/brand.ts`.
- The app packages Geist Sans and Geist Mono fonts. The site uses Inter Tight for display/body and Geist Mono for labels. The app contains an Inter Tight licence text, but not the font file.
- `assets/studio3d/` contains 54 primary `.s3d` movement assets and 54 alternate views, all with the `S3D3` header. `calf__bodyweight@FRONT.s3d` and `calf__machine@FRONT.s3d` are byte-identical; inspect whether that shared view is deliberate.
- The APK is signed with certificate SHA-256 `EB:57:A2:CA:B0:F4:53:B3:63:22:59:00:AE:D6:12:C9:5C:4D:83:16:A9:B1:AC:8C:99:D5:B1:FF:E9:E6:E2:B1`. The latest saved source archive found so far is version 75; its certificate is different, and its selective patch script targets v74. It cannot be used as a safe v88 update base.

## App changes to implement against the matching v88 source

1. **One brand system.** Replace the lime facet and signal UI with crimson, including launcher densities, adaptive foreground, startup, active navigation, progress, controls, focus and feedback. Keep the existing logo geometry. Use dark ink on bone surfaces and black text on crimson actions; crimson on the dark ground has 5.24:1 contrast, while crimson against Paper has 3.09:1 and is unsuitable for small text.
2. **Type and hierarchy.** Bring Inter Tight into the app for heavyweight uppercase page titles and action labels; keep Geist Mono for small index/phase labels. Retain a readable body face and avoid compressing exercise instructions to poster density. Align the Today, Train, Fuel and Learn surfaces through common gutters, clear active states and one primary action per screen.
3. **Exercise studio.** Keep the real 3D assets, their alternate views and user controls. Give the viewer a calm black stage, one crimson movement path or focus marker, and a small factual phase/angle readout. Highlighting is explanatory, not measured muscle activation. The figure must never be obscured by poster artwork or controls.
4. **Motion grammar.** Load (exit) 350 ms, drive (arrival) 220 ms, snap (confirmation/control) 120 ms. Start with a stable first frame; motion follows a user action or an actively visible exercise. Freeze the viewer when the screen is covered, backgrounded or paused. Respect Android's reduced-motion and animator-scale settings, and give a static pose plus legible phase text when motion is disabled.
5. **Movement QA.** Check the source exercise and equipment pairing, initial posture, joint ranges, foot contact, load path, grip/limb collisions and seamless loop at both views. Audit squat, deadlift, bench, leg press, cable movement and bodyweight examples before expanding to every asset. Provide pause, replay, angle change and phase scrub without losing the user's place.
6. **Build continuity.** Preserve the v88 package ID, database, training records and signing lineage. Verify an install over the supplied APK without clearing data. Keep the matching keystore in the owner's existing signing process rather than bundling it with a public source archive.

## Website counterpart

The home reel remains a **schematic side-view squat**, separate from the Android 3D model. Its red bar-path marker is computed from the same joint solver as the figure, so it follows the actual drawn bar. The model is not presented as an Android recording. The site keeps real Android captures unfiltered and labels the Learn phase graphic as an illustration.

## Review standard

The work is ready to call finished only after a real v88 source build and an install-over check, representative 3D movement reviews on an Android phone, controls and reduced-motion checks, no clipped text at common phone widths, and working Today/Train/Fuel/Learn flows. A high visual score alone cannot substitute for these gates.
