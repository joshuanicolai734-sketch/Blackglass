# Current state and source boundaries

Evidence is dated by section below. A later documentation review does not refresh source, artifact or runtime evidence. Reverify before editing. This is the single current-state map for the existing collaboration guide; older release notes remain historical evidence.

## Start here

1. Read root [AGENTS.md](../../AGENTS.md), [BLACKGLASS_HANDOFF.md](../../BLACKGLASS_HANDOFF.md) and the [collaboration guide](README.md)
2. State the surface you are working on: this public GitHub checkout, the public Site, an external Android source, the owner-only review source, or the existing Replit experiment
3. Record the exact branch/commit or build, approved task, target, owned paths and intended reviewer. Preserve local commits and uncommitted work before any sync or import
4. Use one bounded task and a draft PR for authorised repository edits. Documentation does not connect agents, invoke Claude/Replit, reconcile source, merge changes or publish a release

## Verified GitHub state

GitHub metadata, exact-head files and comment trails rechecked: 3 October 2026, 08:27–08:30 UTC. The default head remains `b87393d8a5ffff089ecc327ec0212e67161e1921`; PR #8 is open and draft at `e0fcf0f3434b4e7802e2a5b69a0af156c64f3d3b`. That is this correction's inspected parent, not a claim about its eventual final head or CI.

- Public repository: [joshuanicolai734-sketch/Blackglass](https://github.com/joshuanicolai734-sketch/Blackglass)
- Default branch: `claude/blackglass-domain-migration-0pxc6q`
- Default head independently read for this update: `b87393d8a5ffff089ecc327ec0212e67161e1921`
- [PR #6](https://github.com/joshuanicolai734-sketch/Blackglass/pull/6), the collaboration foundation, is merged at that commit
- [PR #8](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8) is the existing open draft for studio roles and this documentation refresh. The inspected parent for this correction is recorded above. Inspect the PR's current head and exact diff; this file does not claim its own final commit or CI result
- [Issue #7 / BG-007](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7) remains open for source reconciliation. Its original reference to PR #6 as a draft is historical. `BG-001` Exercise Player V2 remains a planned implementation rehearsal, not completed work
- [PR #1](https://github.com/joshuanicolai734-sketch/Blackglass/pull/1), the export-preparation change, remains separate and unmerged. Do not merge it automatically or commit exported records

## Open work and owned paths

Ownership here is a coordination boundary at the inspected heads, not a file lock or new assignment. Refresh each PR before editing; separate paths do not establish compatibility with newer native source.

| Work / accountable lane | Exact inspected head | Owned paths and current stage |
| --- | --- | --- |
| [PR #8](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8), Gamma documentation integration | `e0fcf0f3434b4e7802e2a5b69a0af156c64f3d3b` | `AGENTS.md`, `BLACKGLASS_HANDOFF.md`, `docs/PUBLISHING.md`, two `.github` templates, four `studio/*.md` guides, native brief and collaboration guides/templates. Draft; [full-diff review received](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5967112381), corrections require exact-diff review |
| [PR #9 / BG-002](https://github.com/joshuanicolai734-sketch/Blackglass/pull/9), Claude label/review proposal; Gamma visual review | `3acb428a0c9bbc8bd5b809880d59aae605385917` | `app/tokens.css`, `studio/briefs/BG-002-mobile-hook-and-cohesion.md`, `studio/reviews/BG-002-mobile-hook-and-cohesion.md`. Draft on older GitHub base; default label token only, with 10px exceptions deferred. Newer v33 already has its own 12px token; visual acceptance remains separate |
| [PR #10](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10), Codex candidate; Claude review; Gamma integration | `7a97f97e6b2a5f8d8ede0f85f599e2438ce0d419` | Seven files under `studio/reviews/enquiry-feedback/` only. Draft review bundle; independently reviewed, accepted and privately staged. It does not modify runtime `public/site.js` or install/deploy the candidate |
| [PR #11](https://github.com/joshuanicolai734-sketch/Blackglass/pull/11), Claude check-in correction; independent integration review | `c116697d4dba4ec9f3f350fa3a65aca8994f9673` | `app/site.css` only. Draft 320px offer-card grid/wrapping correction on older GitHub base. Compare with the broader wrapping already present in current public/review source before integrating; do not repeat the fix blindly |
| [PR #1](https://github.com/joshuanicolai734-sketch/Blackglass/pull/1), separate export preparation | `8be51f6837a072c26b8d7d9b1169a8f13628dc7c` | `BLACKGLASS_HANDOFF.md`, `app/admin/page.tsx`, `app/api/admin/export/route.ts`, `db/export.ts`, `package.json`, `tests/export.test.mjs`. Open and unmerged; export/download and release gates remain separate |

PRs #1 and #8 overlap in `BLACKGLASS_HANDOFF.md`; reconcile both changes before integration. This is an overlap, not proof of a merge conflict. Any future inbox task must inspect PR #1's admin/export UI and the actual chosen native source, preserve existing owner-workspace behavior, and name precise owned paths plus an independent reviewer before editing. The Replit inbox review is input to that scope, not an implementation assignment.

## Source map: what this checkout does and does not contain

Public Site/GitHub comparison evidence recorded: 2 October 2026, 05:44–05:46 UTC. That file comparison has not been repeated. The Replit source-comparison report was received at 15:48 UTC and its native-source claims were cross-checked against GitHub below. Replit's filesystem and port-side diff were not independently inspected by Gamma.

| Surface | Current evidence | Boundary |
| --- | --- | --- |
| Public GitHub | Default head above; PR #8 is a docs-only proposal | Shared review surface for committed source. A PR update does not add external runtime code or media |
| Public Site | Latest reconciled source: `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`, associated with public version 33. The recovered checkout's exact HEAD and clean state were rechecked for this update | Different history and functionality from GitHub. This documentation update does not publish or independently recheck the live domain/database |
| External Android | Delivered APK remains Recovery `926` / `94.1-press-study-dev`. Newer privately held source candidates preserve row-plus-incline work and the later workout-resume identity correction | Source candidate, compilation, delivered APK, device runtime and qualified technique are distinct stages. Obtain and verify the latest approved source identity before app edits; do not restart from the 926 archive |
| Owner-only website review | Separate newer review source, including opening-to-Today work; coordinator reports that private review is live | Private source/assets are not a public sync source. Status below is a handoff of supplied review evidence, not verification of this GitHub checkout |
| Existing Replit experiment | [Source comparison received](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5955993208): local `12fc014b1d12669952120d2cf7c6c6304fa8f46d`, cached upstream `b87393d8a5ffff089ecc327ec0212e67161e1921`; 8 local-only / 34 upstream-only commits reported | Source-only Replit evidence, with native-side cross-checks below. The port is not the canonical public source; integration, runtime parity and current-source backups are not established |

The public Site reconciliation identified newer enquiry-receipt validation, movement loading/seeking state, visual/motion work and owner-workspace functionality that are absent or different in GitHub. Do not overwrite these with this older runtime baseline. Keep matching player code, media, phase labels and tests together in any later selectively reviewed transfer. The source-level enquiry test distinguished a confirmed JSON receipt from HTTP-only success; it was not a live-service or end-to-end test.

## Replit source comparison and baseline decision

[Replit's completed source-comparison report](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5955993208) was received on 2 October 2026 at 15:48 UTC. It used existing local Git objects, without a fresh remote fetch, build, runtime test or production access.

- Reported local HEAD: `12fc014b1d12669952120d2cf7c6c6304fa8f46d`; branch `claude/blackglass-domain-migration-0pxc6q`
- Cached upstream: `b87393d8a5ffff089ecc327ec0212e67161e1921`, matching GitHub's freshly checked default head
- Reported merge base: `62039cb4996acb4b860410d38e910bb72bf4fe25`; 8 local-only / 34 upstream-only commits
- Gamma independently confirmed through GitHub that this merge base is an ancestor of `b87393d8…`, exactly 34 commits behind it, and contains 240 tracked files. Gamma did not inspect Replit's local commit objects, so the local count and port-side findings remain attributed to Replit
- Earlier supplied inventory reported no staged, unstaged or untracked files. It described the running Vite/React frontend at `artifacts/blackglass/src`, Express API at `artifacts/api-server/src` under `/api`, and a separate mockup sandbox. A clean reported worktree is not runtime or mergeability evidence

### Findings and independent checks

| Area | Source-comparison finding | Gamma's native-side check / consequence |
| --- | --- | --- |
| Enquiry and retry behavior | Port is JSON-only; native supports JSON, URL-encoded and multipart forms, 303 receipts/retry pages and a short-lived retry cookie | Confirmed in [native route](../../app/api/enquiries/route.ts) and retry pages: 8,192-byte bounded reads, file-part rejection, 120-second HttpOnly retry cookie, route-scoped duplicate protection, and non-fatal activity counting. Preserve all native paths |
| Browser feedback | Port adds a friendly 429 message; native has newer busy/completion behavior | GitHub browser source still checks HTTP success alone. The freshly restored public source validates JSON `{ok:true}` and bounds headers/body receipt time to 15 seconds; its error display lacks a distinct 429 message. Preserve the public implementation and add only that feedback case |
| Owner authentication | Port uses Clerk; native uses ChatGPT identity plus an owner allowlist | Confirmed server-side native checks in [admin page](../../app/admin/page.tsx) and [mutation route](../../app/api/admin/enquiries/route.ts). Keep native authentication and its owner checks |
| Rate limits and ingress | Port reports exact-origin CORS, proxy assumptions and per-process attempt counters | Replit-only evidence; process-local counters are not durable/shared limits. No native ingress or security-setting change is included |
| Inbox | Port reports global/filtered counts, 50-row timestamp/UUID keyset pages and matching client behavior | Confirmed in GitHub and the restored public source: the query loads the latest 100 rows and calculates displayed new/won counts from that subset; the public source also includes its newer owner workspace. Pagination is useful follow-on work, but its backend contract and UI must be adapted together to D1/SQLite |
| Generated contracts | Port reports matching OpenAPI, Zod and client changes | No independent generation or port-runtime verification. Do not transfer generated bindings or PostgreSQL precision assumptions wholesale |

### Backup evidence

Replit reports all 240 merge-base paths byte-identical inside a 242-file tracked `.migration-backup`. Against cached upstream it reports 202 identical shared paths, 37 changed shared paths, 37 upstream paths absent from the backup and 3 backup-only paths. Gamma verified the merge-base file count, not those backup bytes. This backs up the older import, not the latest native source or the current Replit HEAD.

Earlier reported local-only commit identifiers, newest first: `12fc014` (inbox cursor/tests/context), `d7b9011` (API/generated schemas), `3e8bf56` (Replit configuration), `5706b9a` (project context), `4c0f8a2` (Replit documentation), `4bad2ef` (API/client port), `182d913` (backup marker), `50520f4` (migration scaffold). These abbreviated categories are report metadata, not independently reviewed commit contents.

### Baseline recommendation and next implementation

**Retain the native public Sites/Vinext/D1 application as the implementation baseline.** On 2 October 2026 at 15:58 UTC, the public version 33 source was restored and independently verified clean at `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`; the coordinator confirmed version 33 remains the active public version. Use this verified base for the authorised first enquiry-error change, and preserve any subsequent public work. GitHub default `b87393d8…` is a comparison reference, not a substitute for newer public behavior. The private review source and Replit port must not replace the public baseline.

Preserve both exact histories with named checkpoint refs in their own environments, verify restorable current-source checkpoints, and isolate the Replit migration on its own branch **before any sync**. These preservation steps have not been performed by this documentation update.

The [authorised first implementation brief](../briefs/NATIVE_RECONCILIATION_NEXT_STEP.md) selects a small change: a distinct 429 message in the existing native error-display path, with regression coverage. The missing case is verified in the restored public source. It preserves confirmed receipt handling, plain forms, retry pages, owner auth and existing data. Native-compatible inbox counts/pagination is a separate follow-on; Clerk migration and process-local rate-limit copying are excluded.

The public checkpoint's receipt/error, retry, owner-auth and inbox source checks above remain dated evidence. [Claude's 3 October desktop/mobile journey review](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967090047) is now received: 52 checks plus 10 spot checks reported against live v33 in headless Chromium, with all API writes intercepted and responses simulated. It covers the browser journey within those limits, not live backend/D1, the real no-JavaScript POST round trip, physical phones or screen readers. Cross-history preservation remains open.

[Replit's inbox readiness review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5966974823) and [supplementary 429 review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5967038923) are completed source-only reports. They did not run tests or inspect private staging. Confirm their port findings on the exact native source before assigning inbox changes; do not repeat completed 429 review work.

## External Android owner-review checkpoint

Build/archive evidence recorded: 2 October 2026. The later documentation review did not rebuild or rerun the app or repeat the artifact checks.

The latest delivered APK remains version code `926` / version name `94.1-press-study-dev`, schema 13, with isolated application ID `app.forge.obsidia2.refined.recovery`. It is not the latest source candidate. This is a recovery development build, not a public store release or a claim of production signing continuity.

- Five authored exercise studies / ten views: squat, Romanian deadlift, curl, wide pulldown and flat barbell above-chest press
- APK: `Blackglass-Recovery-926.apk`, 54,975,826 bytes, SHA-256 `25efbdd4536d0fc958a766bf9f819ad47808853fd157fce9f4347db04c1c9202`
- Historical source archive paired with that APK (not the next app-edit base): `Blackglass-Reconstructed-Source-926.zip`, 64,271,837 bytes, SHA-256 `051cf6b0c0e255aff01b14afbe0a79d8c1185e4ef713b9f0910d3e432204a312`
- Available evidence: source build, SQLite/model checks, APK signature/alignment/package checks and source-archive integrity checks passed. This refresh reread those results and independently recomputed both files' sizes and hashes; it did not rebuild or rerun the app
- Still pending: Samsung runtime review, installation/update and saved-data behavior on the intended device, accessibility/performance review, and qualified exercise-technique assessment
- The authored studies are visual review material, not evidence of clinically or professionally validated coaching technique. The split-squat study remains held after a partial-depth repair because hip-crease sharpening still needs correction; it is not a completed sixth study

### Newer source candidates, not a new APK

The [row-plus-incline source checkpoint](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5964191820) supersedes the 926 archive for app-source continuation. It adds the exact bench-supported one-arm row and 45-degree simultaneous pronated-grip incline dumbbell press while preserving existing assets, schema/version and historical records. Reported evidence includes Android 35 resources, compilation of all 474 production Java files, asset decoding, independent review and binary-patch replay. Incline guide overlays remain blocked and automatic programme generation excludes that exercise pending an adequate equipment distinction.

Coordinator update, 3 October 2026 at 08:09 UTC: a later workout-resume identity correction is complete in the private source candidate, with full compilation and independent controller checks reported. This documentation pass has not independently inspected that private source or rerun those checks. It is a source-level candidate, not a newly built/signed APK or device result. Before app work, obtain the latest owner-approved exact source identity from the coordinator and preserve both the row-plus-incline changes and resume correction. Do not select the Recovery 926 archive merely because its hash is printed here.

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
- Do not restart app development from the Recovery 926 archive or historical 89.0/older exports. Preserve the newer row-plus-incline and workout-resume source candidate; historical package/source/signature notes describe their own checkpoints only
- Do not discard Replit commits, uncommitted refinements, untracked work or migration backups to make a “clean” sync
- Do not infer schema parity or apply/drop production database tables from documentation. Local schemas and build checks do not establish production migration state
- Do not publish private URLs, signed download links, credentials, customer/personal records, owner-only assets or raw conversations
- Do not alter domain, hosting, database bindings, access, signing or public app availability without the specifically approved change

## Collaboration pilot status

Collaboration evidence checked on 2 October 2026 at 09:16 UTC: owner-supplied Claude configuration evidence from 08:56 UTC showed a daily 22:00 GMT+13 pilot schedule for this repository. [Claude's first pilot handoff](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5948795078), observed at 09:10 UTC, reviewed PR #8 head `7c461c2a0cf0e1ecc6a81206511d351132b1023a`. A configured recurring pilot and one delivered review are established; future execution is not guaranteed.

Owner-supplied Replit configuration evidence shows an active daily 22:30 GMT+13 routine and zero runs at the time of that screenshot; the owner approved its operating limits. Earlier connector inventory/comparison requests timed out without returning a result, and their specific execution outcomes remain uncertain. A separate owner-supplied inventory and the linked completed source-comparison comment have now been received. Use that evidence instead of duplicating requests; it does not verify any particular timed-out request's outcome. Routine configuration alone is not evidence of runtime integration.

The original pilot was limited to its stated scope. The later [full-diff documentation review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5967112381) and [synthetic desktop/mobile journey review](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967090047) are completed reports with separate limits. The 429 candidate is reviewed, accepted and privately staged as recorded below; public deployment remains unchanged. Replit's source comparison is received, but independent port-runtime evidence and cross-history preservation are still open.

On 2 October 2026, the owner also authorised occasional, explicitly assigned Claude file edits through GitHub. Each assignment must name its exact base, owned paths, acceptance checks and handoff; use an isolated branch/worktree and a draft PR, then have Gamma independently review the diff and evidence before any merge decision. This is bounded task permission, not an account-permission change, an automatic routine edit or evidence that a Claude run has started.

Gamma's bounded follow-up review is separately configured daily at 22:15 in `Pacific/Auckland`, starting 3 October 2026. It checks issue #7, PR #8, new Claude handoffs, the exact head and existing CI; it may post one PR response when new evidence warrants it. It does not run builds, invoke agents/Replit, modify code, merge or publish. Configuration is not a guarantee of future execution.

### Additional reported routines and queued assignments

The [3 October full-diff review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5967112381) reports a Claude website/app check-in at 21:40 NZT and a Replit “Refinement” routine at 09:00 NZT, including a reported 1 October Replit edit. This correction has not independently inspected either configuration, its current enabled state or future execution. Treat them as reported possible concurrent writers until the owner/coordinator verifies current state; re-inventory Replit before any sync. No routine is created, paused or changed by this documentation.

- [Claude component-design brief](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967034618) and [Astra-to-Claude concept handoff](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967158994): queued, review-only. They request one concrete component proof using public-safe references. The Today signature-module idea and newer 08:22 design proposals are proposals, not implemented behavior or a new approved redesign
- [Replit bounded source/config consistency check](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967154145): queued, read-only. No new execution result is established by the handoff
- No active Astra task is established by this snapshot. Jules has no confirmed executing assignment; do not list it as running or infer repository access
- Coordinator update, 3 October 2026 at 08:35 UTC: two minimal accessibility corrections are privately deployed: underline the joined-page coaching link and use `preventScroll: true` when focusing the success message so existing whole-form scrolling is preserved. The coordinator reran 7 form, 42 motion, 32 release and 24 event-consistency checks plus lint, TypeScript and build; all passed. Repaired mobile rendering remains unverified. Public v33 is unchanged; private deployment is not public publication
- Before any implementation, name the exact source, owned paths, reviewer and acceptance gates. An assignment/comment does not prove a run started or completed

## Next bounded work

1. **BG-007 source reconciliation:** use the received comparison and the recommended native baseline above. Gamma coordinates the verified public baseline and history-preservation plan; Claude is authorised for the bounded independent review, subject to availability; an assignment does not establish a completed run. The [next implementation brief](../briefs/NATIVE_RECONCILIATION_NEXT_STEP.md) defines the first selective change, explicit exclusions and acceptance evidence. No bulk merge, Replit push or sync is needed to act on this recommendation. The synthetic desktop/mobile journey report is received; cross-history preservation and the separately stated backend/device/release gates remain open
2. **Review these documentation corrections:** Claude's full-diff review of parent `e0fcf0f3` is received. Independently inspect the correction's exact final diff, links and source/stage claims, including the owned-path map. Keep PR #8 draft; prior approval of PR #6 is not approval to merge PR #8
3. **Close remaining enquiry release gates without duplicating completed review:** [Claude reviewed PR #10](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10#issuecomment-5956887461), Gamma accepted it, and [private staging was reported](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10#issuecomment-5960897133). Both synthetic suites passed (22 + 48 executions with overlapping coverage); coordinator staging evidence includes 16 isolated D1/no-JavaScript checks and browser review at 320/430/1280. These are separate evidence scopes, not production backend or device verification. Forced-429 rendered recovery, remaining accessibility/motion/device checks and publication decisions must retain their exact-source limits. PR #10 remains a draft bundle; public v33 is unchanged. `BG-001` still needs its separately approved scope and assets
4. **External review gates:** preserve the latest source candidate while keeping Recovery 926 as the delivered APK; complete source-to-package, device/runtime and qualified-technique gates for any later distribution; complete human listening, physical-phone and native-seeking review of the new film. Preserve the held split-squat status
5. **Later product work:** the connected coaching backend/payment journey, device beta and future Play Store/iOS path remain open. Do not present them as implemented or publicly available

## Verification and publication limits

This correction checked GitHub metadata, exact-head Markdown, changed-file lists and the linked PR/issue reports. Earlier source/artifact checks remain dated and attributed above; this correction did not repeat them. Later private-source status is coordinator-reported. Frozen-lockfile installation, lint, TypeScript and production build passed in an isolated full checkout at the inspected PR #8 parent plus these four Markdown changes (Node 24.19.0, pnpm 11.19.0). This validates the GitHub baseline build only, not the newer external sources, a full browser journey, real-device behavior, exercise technique, production database state or live deployment. New CI must be checked against the final PR head; an earlier green run does not cover a later commit.

For later implementation, run the repository's lint, TypeScript and build checks plus the affected feature's error, interruption, repeated-action and recovery cases. Record the exact tested source and untested environments. Read [PUBLISHING.md](../../docs/PUBLISHING.md) before any separately authorised release. Review, merge, Sites publication and Android distribution are distinct decisions.
