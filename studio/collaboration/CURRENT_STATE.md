# Current state and source boundaries

Evidence is dated by section below. A later documentation review does not refresh source, artifact or runtime evidence. Reverify before editing. This is the single current-state map for the existing collaboration guide; older release notes remain historical evidence.

## Start here

1. Read root [AGENTS.md](../../AGENTS.md), [BLACKGLASS_HANDOFF.md](../../BLACKGLASS_HANDOFF.md) and the [collaboration guide](README.md)
2. State the surface you are working on: this public GitHub checkout, the public Site, an external Android source, the owner-only review source, or the existing Replit experiment
3. Record the exact branch/commit or build, approved task, target, owned paths and intended reviewer. Preserve local commits and uncommitted work before any sync or import
4. Use one bounded task and a draft PR for authorised repository edits. Documentation does not connect agents, invoke Claude/Replit, reconcile source, merge changes or publish a release

## Verified GitHub state

GitHub refs rechecked: 2 October 2026, 09:28 UTC. The default head was `b87393d8a5ffff089ecc327ec0212e67161e1921`; PR #8 remained open and draft at `2db1d6bfc76ab4c49e893771b2e5c92ac1960181`. This is the pre-inventory-update head, not a claim about a later commit.

- Public repository: [joshuanicolai734-sketch/Blackglass](https://github.com/joshuanicolai734-sketch/Blackglass)
- Default branch: `claude/blackglass-domain-migration-0pxc6q`
- Default head independently read for this update: `b87393d8a5ffff089ecc327ec0212e67161e1921`
- [PR #6](https://github.com/joshuanicolai734-sketch/Blackglass/pull/6), the collaboration foundation, is merged at that commit
- [PR #8](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8) is the existing open draft for studio roles and this documentation refresh. Its head before the refresh was `612a537a4386ad78cc926c3ec0361c4f992b4055`. Inspect the PR's current head and exact diff; this file does not claim its own final commit or CI result
- [Issue #7 / BG-007](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7) remains open for source reconciliation. Its original reference to PR #6 as a draft is historical. `BG-001` Exercise Player V2 remains a planned implementation rehearsal, not completed work
- [PR #1](https://github.com/joshuanicolai734-sketch/Blackglass/pull/1), the export-preparation change, remains separate and unmerged. Do not merge it automatically or commit exported records

## Source map: what this checkout does and does not contain

Public Site/GitHub comparison evidence recorded: 2 October 2026, 05:44–05:46 UTC. That file comparison has not been repeated. The separate Replit-reported inventory below was compared with fresh GitHub refs at 09:28 UTC; its filesystem and diff were not independently inspected.

| Surface | Current evidence | Boundary |
| --- | --- | --- |
| Public GitHub | Default head above; PR #8 is a docs-only proposal | Shared review surface for committed source. A PR update does not add external runtime code or media |
| Public Site | Latest reconciled source: `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`, associated with public version 33. The recovered checkout's exact HEAD and clean state were rechecked for this update | Different history and functionality from GitHub. This documentation update does not publish or independently recheck the live domain/database |
| External Android recovery | Owner-review checkpoint version code `926` / version name `94.1-press-study-dev`; package/source identifiers below | Independently built and checked at its own source. Its source and media have not been transferred into this public repository |
| Owner-only website review | Separate newer review source with homepage/motion and exercise-gallery refinements | Private source/assets are not a public sync source. Status below is a handoff of supplied review evidence, not verification of this GitHub checkout |
| Existing Replit experiment | Owner-supplied read-only report: local HEAD `12fc014b1d12669952120d2cf7c6c6304fa8f46d`, cached origin `b87393d8a5ffff089ecc327ec0212e67161e1921`, no staged/unstaged/untracked files reported | Local-only report, not independent filesystem verification. Preserve and isolate the migration and its backups before any sync; actual diff and source parity remain unreviewed |

The public Site reconciliation identified newer enquiry-receipt validation, movement loading/seeking state, visual/motion work and owner-workspace functionality that are absent or different in GitHub. Do not overwrite these with this older runtime baseline. Keep matching player code, media, phase labels and tests together in any later selectively reviewed transfer. The source-level enquiry test distinguished a confirmed JSON receipt from HTTP-only success; it was not a live-service or end-to-end test.

## Replit-reported inventory and reconciliation path

Provenance: owner-supplied read-only Replit report received on 2 October 2026, compared here with fresh GitHub branch refs at 09:28 UTC. Replit did not refresh its remote during the inventory. The local filesystem, commit objects, backup contents and actual diff have not been independently reviewed.

| Source | Evidence | Difference or limit | Next safe action |
| --- | --- | --- | --- |
| GitHub default | Connector-verified `b87393d8a5ffff089ecc327ec0212e67161e1921` | Matches the reported cached origin SHA; this alone does not prove local ancestry or an ahead count | Preserve it as the public reference; do not replace it with the port |
| Replit checkout | Reported branch `claude/blackglass-domain-migration-0pxc6q`; HEAD `12fc014b1d12669952120d2cf7c6c6304fa8f46d` | Eight local-only commits reported; staged, unstaged and untracked files all reported absent | Preserve the exact current state on a clearly named isolated migration branch and verify a restorable checkpoint before any sync |
| Replit runtime | Reported frontend `artifacts/blackglass/src` uses Vite/React at the root; API `artifacts/api-server/src` uses Express under `/api`; mockup sandbox is separate | This is an architectural port, not evidence of Vinext/Sites/D1 or public-site parity | Review route, auth, enquiry, database, generated-client and build differences separately |
| Migration backup | `.migration-backup` reported present with the original import, not the running app | Existence is not proof that it restores the current migration HEAD | Retain the original backup; independently verify a separate current-source checkpoint |

Reported local-only commits, newest first. Only the HEAD was supplied as a full SHA; the remaining identifiers and change categories below are abbreviated report metadata, not inspected commit contents:

- `12fc014`: inbox cursor logic, tests and project context
- `d7b9011`: backend API and generated schemas
- `3e8bf56`: Replit configuration
- `5706b9a`: project context
- `4c0f8a2`: Replit documentation
- `4bad2ef`: API/client port
- `182d913`: backup marker
- `50520f4`: migration scaffold

Safe proposed sequence, not actions already performed:
1. Preserve the current migration HEAD and any later work in an isolated local migration branch/checkpoint before fetching, pulling or syncing. Retain `.migration-backup`; do not mistake the original import for a verified backup of the current app
2. Obtain full commit identities and a read-only changed-path/diff review against the freshly verified GitHub reference; account separately for newer public Site functionality. Use only approved source access and public-safe evidence, without production data or secrets
3. Have the independent reviewer assess the architectural substitutions, retained behavior, data/auth boundaries and tests. Josh then chooses the intended source/target and exact base
4. If integration is later approved, use a separate bounded task branch and selective, reviewed changes. Do not push these local migration commits, wholesale-copy the port, sync over the existing project, merge or deploy as part of this evidence update

A clean reported working tree and a matching cached-origin SHA do not establish compatibility, mergeability, successful runtime behavior or complete BG-007 reconciliation.

## External Android owner-review checkpoint

Build/archive evidence recorded: 2 October 2026. The later documentation review did not rebuild or rerun the app or repeat the artifact checks.

The latest supplied checkpoint is version code `926` / version name `94.1-press-study-dev`, schema 13, with isolated application ID `app.forge.obsidia2.refined.recovery`. This is a recovery development build, not a public store release or a claim of production signing continuity.

- Five authored exercise studies / ten views: squat, Romanian deadlift, curl, wide pulldown and flat barbell above-chest press
- APK: `Blackglass-Recovery-926.apk`, 54,975,826 bytes, SHA-256 `25efbdd4536d0fc958a766bf9f819ad47808853fd157fce9f4347db04c1c9202`
- Source archive: `Blackglass-Reconstructed-Source-926.zip`, 64,271,837 bytes, SHA-256 `051cf6b0c0e255aff01b14afbe0a79d8c1185e4ef713b9f0910d3e432204a312`
- Available evidence: source build, SQLite/model checks, APK signature/alignment/package checks and source-archive integrity checks passed. This refresh reread those results and independently recomputed both files' sizes and hashes; it did not rebuild or rerun the app
- Still pending: Samsung runtime review, installation/update and saved-data behavior on the intended device, accessibility/performance review, and qualified exercise-technique assessment
- The authored studies are visual review material, not evidence of clinically or professionally validated coaching technique. The split-squat study remains held after a partial-depth repair because hip-crease sharpening still needs correction; it is not a completed sixth study

These identifiers let an authorised reviewer verify separately supplied files. They are not download links and do not grant access or permission to publish source/assets. Request an owner-approved transfer and an explicit destination before coding from external files. Keep signing keys, credentials and private runtime records out of GitHub. Preserve the installed app and its data; do not bypass signature differences by asking for an uninstall.

## Website and film direction

Film artifact and hosted-review evidence recorded: 2 October 2026, 06:30 UTC. These checks were not repeated by the later documentation review.

The separate owner-review website has a refined force → repeat → record motion sequence, a manually controlled Learn curl, 320/430-pixel layout work and a ten-player gallery. Source/browser checks were reported for that review source. Those results are not tests of this GitHub head; public-domain publication is unchanged by this documentation task.

The original 21-second film and its source are preserved. A new 21-second **Force becomes record** edit is complete as a local review artifact, with a larger opening plane and continuous force → vortex → 10 reps → logged set → brand mark transformation. The preview-list invitation was checked at 320-pixel display width. All visuals remain editable native Tesseract elements: 125 layers and 196 animation entries. The original licensed music excerpt is retained, with five procedural sound cues; preserve its attribution with any authorised publication. The product graphic is explicitly a build 906 example, not a recording of the later recovery build.

Supplied checks passed for full web-video decoding, isolated cue timing and rebuilding the editable archive; the rebuilt frame at 19.6 seconds matched the checked reference pixels. This update independently recomputed both artifact sizes and hashes. Private hosted review verified the correct 21-second 1080p source, play, pause/resume, replay, natural ending and offscreen pause. Both MP4 and editable-source downloads matched their exact sizes/hashes, and ZIP integrity passed. Native seeking was inconclusive in cloud browser control; human listening and physical-phone review remain pending. Public-site and social publication remain unchanged.

- Web MP4: `Blackglass-Force-Record-1080-Web.mp4`, 3,324,197 bytes, SHA-256 `3671bf3e4551dcc5f8f86e1477c460a4ce180fa6435267df754481e07820a39d`
- Editable source: `Blackglass-Force-Record-Editable-Source.zip`, 23,517,548 bytes, SHA-256 `96a6fc552e68b9aacbaae9b917e9c41bd109384c27aaafe6989d501cd99e96d1`

These are identifiers for separately supplied review files, not public downloads or a transfer of source/assets into GitHub.

Keep the approved bold light/dark and sleek synthetic-body direction. Historical crimson-only or minimal-motion descriptions are not a sufficient new brief. Preserve usability, truthful availability, responsive controls, reduced-motion behavior and the relevant no-JavaScript fallback.

Separate owner-only workspace, media and strategy work remains outside this public repository. Summaries here do not authorise uploading that material.

## What not to overwrite

- Do not blanket-copy GitHub over the public Site, or copy any entire Site/review checkout into this repository
- Do not replace the external Android project with historical 89.0 or older exports; historical source/signature notes describe their own checkpoints only
- Do not discard Replit commits, uncommitted refinements, untracked work or migration backups to make a “clean” sync
- Do not infer schema parity or apply/drop production database tables from documentation. Local schemas and build checks do not establish production migration state
- Do not publish private URLs, signed download links, credentials, customer/personal records, owner-only assets or raw conversations
- Do not alter domain, hosting, database bindings, access, signing or public app availability without the specifically approved change

## Collaboration pilot status

Collaboration evidence checked on 2 October 2026 at 09:16 UTC: owner-supplied Claude configuration evidence from 08:56 UTC showed a daily 22:00 GMT+13 pilot schedule for this repository. [Claude's first pilot handoff](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5948795078), observed at 09:10 UTC, reviewed PR #8 head `7c461c2a0cf0e1ecc6a81206511d351132b1023a`. A configured recurring pilot and one delivered review are established; future execution is not guaranteed.

Owner-supplied Replit configuration evidence shows an active daily 22:30 GMT+13 routine and zero runs at the time of that screenshot; the owner approved its operating limits. A separate read-only project-inventory request was sent at 09:13 UTC. The connector timed out without returning an inventory. Its submission/execution outcome remains uncertain; do not repeat the request until its status is checked. The owner later supplied the separate report recorded below; receipt of that report does not verify the timed-out request's outcome. The configured routine is not evidence of a completed run or source reconciliation.

The pilot is a limited documentation review, not full-diff approval or completion of BG-007. The existing source-level enquiry false-success finding is useful evidence, but a reproducible desktop/mobile website-to-app-access journey review remains outstanding. A fresh Replit report has now been supplied by the owner; the filesystem, full commit graph and actual source diff have not been independently inspected. Source/target selection remains open.

Gamma's bounded follow-up review is separately configured daily at 22:15 in `Pacific/Auckland`, starting 3 October 2026. It checks issue #7, PR #8, new Claude handoffs, the exact head and existing CI; it may post one PR response when new evidence warrants it. It does not run builds, invoke agents/Replit, modify code, merge or publish. Configuration is not a guarantee of future execution.

## Next bounded work

1. **BG-007 source reconciliation:** Gamma coordinates review of the supplied Replit inventory and the missing full commit history/diff; Claude is the proposed independent reviewer, subject to availability and owner confirmation. Preserve/isolate the migration and verify its backup before any sync. Josh decides the source/target and exact base after the evidence is reviewed. The [setup guide](SETUP.md) specifies the remaining read-only metadata and safe reconciliation sequence. Keep the timed-out request distinct from the owner-supplied report and do not duplicate it. Full source comparison and the separate browser-journey review remain required
2. **Independent documentation review:** use Claude's pilot findings as one input; independently inspect the current full diff, links and status claims. The pilot did not review every changed file or validate external artifacts. Keep PR #8 draft; prior approval of PR #6 is not approval to merge PR #8
3. **Choose one implementation brief:** after source/target approval, a selective enquiry-receipt parity fix is a possible small task. Its brief must name the exact source, owned paths, synthetic receipt/error/recovery acceptance cases and a separate reviewer before implementation. `BG-001` Exercise Player V2 still needs its approved scope and assets. Neither is authorised by this status document
4. **External review gates:** complete device/runtime and qualified-technique review of the recovery build; complete human listening, physical-phone and native-seeking review of the new film. Preserve the held split-squat status
5. **Later product work:** the connected coaching backend/payment journey, device beta and future Play Store/iOS path remain open. Do not present them as implemented or publicly available

## Verification and publication limits

This refresh checked GitHub metadata, branches, relevant PRs, issue #7 and existing documentation. It checked recovered local source identities and external artifact hashes as stated above. It is not a fresh application build, full browser journey, real-device test, independent technique review, production database audit or live deployment verification. New CI must be checked against the final PR head; an earlier green run does not cover a later commit.

For later implementation, run the repository's lint, TypeScript and build checks plus the affected feature's error, interruption, repeated-action and recovery cases. Record the exact tested source and untested environments. Read [PUBLISHING.md](../../docs/PUBLISHING.md) before any separately authorised release. Review, merge, Sites publication and Android distribution are distinct decisions.
