# Current state and source boundaries

Source snapshot: 2 October 2026, 05:44–05:46 UTC. Film artifact and hosted-review status refreshed at 06:30 UTC. Reverify before editing. This is the single current-state map for the existing collaboration guide; older release notes remain historical evidence.

## Start here

1. Read root [AGENTS.md](../../AGENTS.md), [BLACKGLASS_HANDOFF.md](../../BLACKGLASS_HANDOFF.md) and the [collaboration guide](README.md)
2. State the surface you are working on: this public GitHub checkout, the public Site, an external Android source, the owner-only review source, or the existing Replit experiment
3. Record the exact branch/commit or build, approved task, target, owned paths and intended reviewer. Preserve local commits and uncommitted work before any sync or import
4. Use one bounded task and a draft PR for authorised repository edits. Documentation does not connect agents, invoke Claude/Replit, reconcile source, merge changes or publish a release

## Verified GitHub state

- Public repository: [joshuanicolai734-sketch/Blackglass](https://github.com/joshuanicolai734-sketch/Blackglass)
- Default branch: `claude/blackglass-domain-migration-0pxc6q`
- Default head independently read for this update: `b87393d8a5ffff089ecc327ec0212e67161e1921`
- [PR #6](https://github.com/joshuanicolai734-sketch/Blackglass/pull/6), the collaboration foundation, is merged at that commit
- [PR #8](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8) is the existing open draft for studio roles and this documentation refresh. Its head before the refresh was `612a537a4386ad78cc926c3ec0361c4f992b4055`. Inspect the PR's current head and exact diff; this file does not claim its own final commit or CI result
- [Issue #7 / BG-007](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7) remains open for source reconciliation. Its original reference to PR #6 as a draft is historical. `BG-001` Exercise Player V2 remains a planned implementation rehearsal, not completed work
- [PR #1](https://github.com/joshuanicolai734-sketch/Blackglass/pull/1), the export-preparation change, remains separate and unmerged. Do not merge it automatically or commit exported records

## Source map: what this checkout does and does not contain

| Surface | Current evidence | Boundary |
| --- | --- | --- |
| Public GitHub | Default head above; PR #8 is a docs-only proposal | Shared review surface for committed source. A PR update does not add external runtime code or media |
| Public Site | Latest reconciled source: `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`, associated with public version 33. The recovered checkout's exact HEAD and clean state were rechecked for this update | Different history and functionality from GitHub. This documentation update does not publish or independently recheck the live domain/database |
| External Android recovery | Owner-review checkpoint version code `926` / version name `94.1-press-study-dev`; package/source identifiers below | Independently built and checked at its own source. Its source and media have not been transferred into this public repository |
| Owner-only website review | Separate newer review source with homepage/motion and exercise-gallery refinements | Private source/assets are not a public sync source. Status below is a handoff of supplied review evidence, not verification of this GitHub checkout |
| Existing Replit experiment | Previously reported migration commits plus later uncommitted refinements; current local state unverified | Preserve the existing project and `.migration-backup`; obtain a read-only inventory before any sync, port or integration |

The public Site reconciliation identified newer enquiry-receipt validation, movement loading/seeking state, visual/motion work and owner-workspace functionality that are absent or different in GitHub. Do not overwrite these with this older runtime baseline. Keep matching player code, media, phase labels and tests together in any later selectively reviewed transfer. The source-level enquiry test distinguished a confirmed JSON receipt from HTTP-only success; it was not a live-service or end-to-end test.

## External Android owner-review checkpoint

The latest supplied checkpoint is version code `926` / version name `94.1-press-study-dev`, schema 13, with isolated application ID `app.forge.obsidia2.refined.recovery`. This is a recovery development build, not a public store release or a claim of production signing continuity.

- Five authored exercise studies / ten views: squat, Romanian deadlift, curl, wide pulldown and flat barbell above-chest press
- APK: `Blackglass-Recovery-926.apk`, 54,975,826 bytes, SHA-256 `25efbdd4536d0fc958a766bf9f819ad47808853fd157fce9f4347db04c1c9202`
- Source archive: `Blackglass-Reconstructed-Source-926.zip`, 64,271,837 bytes, SHA-256 `051cf6b0c0e255aff01b14afbe0a79d8c1185e4ef713b9f0910d3e432204a312`
- Available evidence: source build, SQLite/model checks, APK signature/alignment/package checks and source-archive integrity checks passed. This refresh reread those results and independently recomputed both files' sizes and hashes; it did not rebuild or rerun the app
- Still pending: Samsung runtime review, installation/update and saved-data behavior on the intended device, accessibility/performance review, and qualified exercise-technique assessment
- The authored studies are visual review material, not evidence of clinically or professionally validated coaching technique. The split-squat study remains held after a partial-depth repair because hip-crease sharpening still needs correction; it is not a completed sixth study

These identifiers let an authorised reviewer verify separately supplied files. They are not download links and do not grant access or permission to publish source/assets. Request an owner-approved transfer and an explicit destination before coding from external files. Keep signing keys, credentials and private runtime records out of GitHub. Preserve the installed app and its data; do not bypass signature differences by asking for an uninstall.

## Website and film direction

The separate owner-review website has a refined force → repeat → record motion sequence, a manually controlled Learn curl, 320/430-pixel layout work and a ten-player gallery. Source/browser checks were reported for that review source. Those results are not tests of this GitHub head; public-domain publication is unchanged by this documentation task.

The original 21-second film and its source are preserved. A new 21-second **Force becomes record** edit is complete as a local review artifact, with a larger opening plane and continuous force → vortex → 10 reps → logged set → brand mark transformation. The preview-list invitation was checked at 320-pixel display width. All visuals remain editable native Tesseract elements: 125 layers and 196 animation entries. The original licensed music excerpt is retained, with five procedural sound cues; preserve its attribution with any authorised publication. The product graphic is explicitly a build 906 example, not a recording of the later recovery build.

Supplied checks passed for full web-video decoding, isolated cue timing and rebuilding the editable archive; the rebuilt frame at 19.6 seconds matched the checked reference pixels. This update independently recomputed both artifact sizes and hashes. Private hosted review verified the correct 21-second 1080p source, play, pause/resume, replay, natural ending and offscreen pause. Both MP4 and editable-source downloads matched their exact sizes/hashes, and ZIP integrity passed. Native seeking was inconclusive in cloud browser control; human listening and physical-phone review remain pending. Public-site and social publication remain unchanged.

- Web MP4: `Blackglass-Force-Record-1080-Web.mp4`, 3,324,197 bytes, SHA-256 `3671bf3e4551dcc5f8f86e1477c460a4ce180fa6435267df754481e07820a39d`
- Editable source: `Blackglass-Force-Record-Editable-Source.zip`, 23,517,548 bytes, SHA-256 `96a6fc552e68b9aacbaae9b917e9c41bd109384c27aaafe6989d501cd99e96d1`

These are identifiers for separately supplied review files, not public downloads or a transfer of source/assets into GitHub. The owner has approved beginning setup for 10 pm New Zealand collaboration research. Setup is in progress; no unattended or scheduled runs have been established.

Keep the approved bold light/dark and sleek synthetic-body direction. Historical crimson-only or minimal-motion descriptions are not a sufficient new brief. Preserve usability, truthful availability, responsive controls, reduced-motion behavior and the relevant no-JavaScript fallback.

Separate owner-only workspace, media and strategy work remains outside this public repository. Summaries here do not authorise uploading that material.

## What not to overwrite

- Do not blanket-copy GitHub over the public Site, or copy any entire Site/review checkout into this repository
- Do not replace the external Android project with historical 89.0 or older exports; historical source/signature notes describe their own checkpoints only
- Do not discard Replit commits, uncommitted refinements, untracked work or migration backups to make a “clean” sync
- Do not infer schema parity or apply/drop production database tables from documentation. Local schemas and build checks do not establish production migration state
- Do not publish private URLs, signed download links, credentials, customer/personal records, owner-only assets or raw conversations
- Do not alter domain, hosting, database bindings, access, signing or public app availability without the specifically approved change

## Next bounded work

1. **BG-007 source reconciliation:** obtain a fresh read-only Replit inventory, confirm the intended source/target with the owner, and record the exact chosen base. The [setup guide](SETUP.md) gives the existing-project preservation sequence
2. **Independent documentation review:** inspect PR #8's current head, exact diff, links and status claims. Keep it draft; prior approval of PR #6 is not approval to merge PR #8
3. **Choose one implementation brief:** after source/target approval, a selective enquiry-receipt parity fix is a possible small task. `BG-001` Exercise Player V2 still needs its approved scope and assets. Neither is authorised by this status document
4. **External review gates:** complete device/runtime and qualified-technique review of the recovery build; complete human listening, physical-phone and native-seeking review of the new film. Preserve the held split-squat status
5. **Later product work:** the connected coaching backend/payment journey, device beta and future Play Store/iOS path remain open. Do not present them as implemented or publicly available

## Verification and publication limits

This refresh checked GitHub metadata, branches, relevant PRs, issue #7 and existing documentation. It checked recovered local source identities and external artifact hashes as stated above. It is not a fresh application build, full browser journey, real-device test, independent technique review, production database audit or live deployment verification. New CI must be checked against the final PR head; an earlier green run does not cover a later commit.

For later implementation, run the repository's lint, TypeScript and build checks plus the affected feature's error, interruption, repeated-action and recovery cases. Record the exact tested source and untested environments. Read [PUBLISHING.md](../../docs/PUBLISHING.md) before any separately authorised release. Review, merge, Sites publication and Android distribution are distinct decisions.
