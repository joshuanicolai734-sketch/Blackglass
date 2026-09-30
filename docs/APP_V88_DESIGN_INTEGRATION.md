# Blackglass Android: source, website alignment and motion integration

## Current source build: 89.0

The complete native Android project has now been reconstructed from the owner's 88.2 APK and compiled entirely from Java source. It includes all 460 application Java files, resources, fonts, 108 S3D packs, bundled food data, Gradle configuration, a verified independent Android SDK builder and the editable movement rig/renderers. The original APK and a decompiler are not rebuild dependencies. Source recovery and logic repairs are documented inside the bundle in `docs/SOURCE_RECOVERY.md`; numerical fixtures exercise the actual compiled application classes.

| Deliverable | SHA-256 |
| --- | --- |
| `Blackglass-89.0-Source.zip` | `d728bfae049eb3af7f308ad5ae425a8d7f72f9d843a5dc40f26e321dc4224db8` |
| `Blackglass-89.0-Source.apk` | `4a3b9b89154adc009ba9379e1327639092f07ac15b05830439a0c129e43603d4` |

Application ID remains `app.forge.obsidia2.refined`; source namespace is `app.forge.obsidia2.hardline`. VersionCode 900 / versionName `89.0-source`; minimum SDK 23, target/compile SDK 35. This is a development APK with a new certificate: **uninstall 88.2, then install 89.0**. The owner accepted a fresh install for the app that is not yet live. No signing key is included in the source archive. Keep the future release key outside source control.

The verified build compiled/linked resources, compiled every Java file, ran 248,164 assertions, created new DEX using D8, reconciled APK assets against source and baseline, aligned the APK, and verified v1/v2/v3 signatures. Fixtures cover local dates/DST, numeric input, programme generation/validation, progression, nutrition, movement timing/rig invariants, frame caching, all 108 packs / 6,912 frames and all 7,793 food rows. The authoring rig audit passed for 54 primary variants. The Gradle wrapper is supplied, but its Java download was blocked here; the independent SDK build passed. Exact reports and device gates are in `docs/BUILD_EVIDENCE.json`, `docs/ASSET_PROVENANCE.json`, `docs/source-checks.json` and `docs/VERIFICATION.md` inside the bundle.

The Inter Tight fonts still have legacy `GeistSans-*.ttf` filenames for native lookup compatibility. Geist Mono files contain Geist Mono; both licence texts are bundled. Accounts, training/food records and client profiles remain local; billing and coach-code entitlements remain prototype implementations. Website and app do not share accounts or data. No live website enquiry data was accessed during this work.

The complete project and APK were supplied separately. This public repository contains the website and integration documentation, not the private Android project or signing materials. The source is ready for further native edits; phone installation, screen rendering, TalkBack, lifecycle/reduced-motion behaviour and frame pacing still require device review. No 10/10 native score or phone validation is claimed.

## Historical v88 inspection

This is the implementation handoff for the supplied `Blackglass-88_0-Flow-3D.apk` (SHA-256 `398037c3d9acabbc63e4028e83c716eef73c372ba92d66f035ac0374b6841b76`). It is an inspection of the package, not a claim that its exercise motion has been visually validated on a phone.

## Verified in the supplied APK

- The launcher still has the lime facet. The site now uses poster-black `#0B0D0E`, bone `#F1EEE6`, crimson `#F43F46`, and facet `#2B3032`; the canonical logo paths are in `public/brand/` and `content/brand.ts`.
- The app packages Geist Sans and Geist Mono fonts. The site uses Inter Tight for display/body and Geist Mono for labels. The app contains an Inter Tight licence text, but not the font file.
- `assets/studio3d/` contains 54 primary `.s3d` movement assets and 54 alternate views, all with the `S3D3` header. `calf__bodyweight@FRONT.s3d` and `calf__machine@FRONT.s3d` are byte-identical; inspect whether that shared view is deliberate.
- The APK is signed with certificate SHA-256 `EB:57:A2:CA:B0:F4:53:B3:63:22:59:00:AE:D6:12:C9:5C:4D:83:16:A9:B1:AC:8C:99:D5:B1:FF:E9:E6:E2:B1`. The latest saved source archive found so far is version 75; its certificate is different, and its selective patch script targets v74. It cannot be used as a safe v88 update base.

## Fresh-install v88.1 visual prototype

With a clean install accepted for this pre-release app, `Blackglass-88.1-Poster-3D.apk` was patched directly from the supplied v88 binary and signed using the older development certificate. It retains the package ID and every one of the 108 original S3D assets, changes the launcher, brand rasters, default appearance, app and studio color constants, and display font weights, and carries versionCode 898 / versionName `88.1-poster`. The entry copy now calls the prerecorded animation a "3D pose study" rather than a validated form guide. SHA-256: `7bf4d64699b977e2663f765532ebb3511aa28e1073c1aea18ef99411da7667b9`. The old v88 APK must be uninstalled first because its certificate differs.

This binary patch changes how the 3D viewer looks. It does not alter the authored 3D poses, timing, camera or controls. Static ZIP, DEX, resource, asset-preservation and v2 signature checks pass, but there is no on-device launch or motion review. The separate rebuild kit documents the exact patch; it excludes the signing key. This historical binary patch has been superseded by the reconstructed 89.0 source project above; continue native implementation in that project.

Sampled squat and deadlift frames visibly have poor foot contact and awkward load positions. Those source animations need a new rig/render review before they should be presented as reliable technique instruction; a palette or timing change cannot repair the poses.

## v88.2 movement asset rebuild

The saved `Blackglass-88.2-Movement-3D.apk` replaces all 108 packs (53 exercise/equipment variants plus a neutral fallback, each with two views) with the new rig/render catalogue. SHA-256: `307d56afef53c241bda2a583f1282df4d9385067a2163492807297aaaaf7ddbc`; versionCode 899 / versionName `88.2-motion`. The rebuild kit contains the rig, per-family movement code, export scripts, catalogue and numerical audit records; it excludes signing keys. This is rendered geometry stored as frame packs, not an arbitrarily rotatable live model. Native playback controls and phone performance remain untested. The native progression and coaching workflows proposed next are not part of this asset release.

## Integration and device review in the 89.0 source project

1. **One brand system.** Review the poster palette already carried forward from 88.1/88.2, including launcher densities, adaptive foreground, startup, active navigation, progress, controls, focus and feedback. Keep the existing logo geometry. Use dark ink on bone surfaces and black text on crimson actions; crimson on the dark ground has 5.24:1 contrast, while crimson against Paper has 3.09:1 and is unsuitable for small text.
2. **Type and hierarchy.** Review the bundled Inter Tight display/body fonts and Geist Mono labels on a phone, including font scaling. Retain a readable body face and avoid compressing exercise instructions to poster density. Align the Today, Train, Fuel and Learn surfaces through common gutters, clear active states and one primary action per screen.
3. **Exercise studio.** Keep the real 3D assets, their alternate views and user controls. Give the viewer a calm black stage, one crimson movement path or focus marker, and a small factual phase/angle readout. Highlighting is explanatory, not measured muscle activation. The figure must never be obscured by poster artwork or controls.
4. **Motion grammar.** Load (exit) 350 ms, drive (arrival) 220 ms, snap (confirmation/control) 120 ms. Start with a stable first frame; motion follows a user action or an actively visible exercise. Freeze the viewer when the screen is covered, backgrounded or paused. Respect Android's reduced-motion and animator-scale settings, and give a static pose plus legible phase text when motion is disabled.
5. **Movement QA.** Check the source exercise and equipment pairing, initial posture, joint ranges, foot contact, load path, grip/limb collisions and seamless loop at both views. Audit squat, deadlift, bench, leg press, cable movement and bodyweight examples before expanding to every asset. Provide pause, replay, angle change and phase scrub without losing the user's place.
6. **Build continuity.** Preserve the application ID and build from the complete 89.0 source. The owner accepted a fresh install, which supersedes the earlier install-over gate; a new certificate cannot update the old APK. Keep future development/release signing keys outside the source bundle. Verify fresh installation and persistence of newly created records on the phone.

## Website counterpart

The home reel remains a **schematic side-view squat**, separate from the Android 3D model. Its red bar-path marker is computed from the same joint solver as the figure, so it follows the actual drawn bar. The model is not presented as an Android recording. The site retains the existing Android captures (including the previously updated Today header branding). The homepage Learn panel now shows a labelled 88.2 movement still and links to `/movements`, whose three studies export the actual angled/front packs into small browser clips. See `docs/MOVEMENT_STUDIO.md`; this route does not run the Android app.

## Review standard

The 89.0 source compilation, portable checks and signed packaging have passed. Release readiness still requires a fresh install, representative movement reviews on an Android phone, controls and reduced-motion checks, no clipped text at common phone widths, and working Today/Train/Fuel/Learn flows. Numeric checks do not establish biomechanical suitability. A visual score cannot substitute for these device gates.
