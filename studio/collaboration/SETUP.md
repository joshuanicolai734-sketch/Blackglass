# Connect collaborators safely

These are setup instructions, not confirmation that any external agent is connected. No new account grants, secrets or automatic workflows are included in this change.

## GitHub first
Open this repository and the reviewed collaboration branch/PR. Keep the existing default branch. Use Issues and draft Pull Requests as the shared task and review surfaces; a paid coordination service is unnecessary for the first trial.

Read the [intended roles and workflow](README.md) before assigning work. Use currently authorised access within Josh's existing plan; do not buy usage credits, enable paid add-ons or assume another provider is included in Pro. If access or plan limits block a role, record the limitation and proposed next step rather than claiming the tools are connected or usage-free.

If asked to connect an app, Josh should inspect the actual permissions and authorise only this repository where the provider supports it. Do not paste access tokens into chat or commit them. A tool unable to use the approved connection should stop and report its limitation.

## Claude Code
1. Open a clean local checkout at the agreed current base; preserve any existing uncommitted work
2. Root `CLAUDE.md` already imports `AGENTS.md`. Have the session read this collaboration guide and one task brief
3. Use a separate worktree/session for its issue. Claude's official worktree flow isolates file edits; verify the selected base and branch rather than relying on a default
4. The initial read-only pilot has delivered a review. The owner now authorises occasional explicitly assigned file edits: name the exact base, owned paths and acceptance checks, use an isolated branch/worktree and draft PR, and report the exact head, diff, findings, limits and next task through the shared GitHub thread. Gamma independently reviews the result before any merge decision
5. Do not enable an automatic GitHub action or copy secrets merely to establish this workflow

Official reference: https://code.claude.com/docs/en/worktrees (checked 1 October 2026).

## Replit

### Existing Blackglass project: inventory first

A read-only inventory and [completed Replit source comparison](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5955993208) have now been received. They compare local `12fc014b1d12669952120d2cf7c6c6304fa8f46d` with cached upstream `b87393d8a5ffff089ecc327ec0212e67161e1921`, reporting 8 local-only / 34 upstream-only commits from merge base `62039cb4996acb4b860410d38e910bb72bf4fe25`. Gamma independently confirmed the GitHub-side 34-commit ancestry and 240 merge-base files; port-side findings and backup byte comparisons remain Replit-reported source evidence. See the [current reconciliation decision](CURRENT_STATE.md#replit-source-comparison-and-baseline-decision).

Gamma coordinates follow-up; Claude is authorised for the bounded independent review, subject to availability. Occasional scoped file edits follow the assignment and draft-PR requirements above. The owner approved the read-only work's operating limits. Earlier connector requests timed out, but the report is now available separately: do not duplicate requests merely because those calls returned no result. The checklist below is for any necessary refresh or missing evidence, not an instruction to rerun the completed comparison.

1. Open the existing project; do not re-import over it or create a replacement merely to make the sources look aligned
2. Record the exact branch and full HEAD SHA with `git status --short --branch` and `git rev-parse HEAD`. List eight recent full commit SHAs and subjects with `git log -8 --format='%H %s'`. Record the cached origin ref name and full SHA separately without fetching
3. Record unstaged and staged change summaries with `git diff --stat`, `git diff --name-status`, `git diff --cached --stat` and `git diff --cached --name-status`; list untracked paths with `git ls-files --others --exclude-standard`. Record whether `.migration-backup` and other migration backups exist, with path/file-count metadata only. Preserve all commits, changed/untracked files and backups. Return public-safe source metadata and filenames, never file contents, secret values or personal records
4. During this inventory, do not fetch, pull, sync, reset, commit, push, delete/move files, provision infrastructure or publish
5. Describe any Next/Vinext/Sites/D1 versus Vite/Express/PostgreSQL substitutions. An architectural port is not proof of compatibility with the public Site or GitHub source
6. Return a dated source/evidence/difference/next-action table with the exact inspected refs, inventory limits and proposed next task. The independent reviewer checks that evidence before Josh selects the source/target. Future work needs its own agreed base, owned paths and review evidence; this inventory does not satisfy the separate desktop/mobile journey-review gate

### Before any later sync or integration

Retain the native public Sites/Vinext/D1 architecture. The public version 33 source was freshly restored and verified clean at `7daacb89a396bc3bda44ca8ea17a5f1675011d9d` on 2 October 2026; the coordinator confirmed it remains the active public version. Use this base for the owner-authorised first enquiry-error task and preserve any newer public work. Keep GitHub `b87393d8…` as a comparison reference and Replit `12fc014b…` as an isolated experiment.

Before sync, protect both histories with named checkpoint refs, verify restorable current-source checkpoints and isolate the Replit migration branch. Retain `.migration-backup`, which the report establishes as the older merge-base import, not the latest native or current port backup. These preservation steps are proposed, not claimed complete.

Follow the [bounded native implementation brief](../briefs/NATIVE_RECONCILIATION_NEXT_STEP.md): start with receipt/error feedback and regression coverage; consider D1-adapted inbox pagination separately. Do not push the migration commits, bulk-merge the scaffold, replace native ChatGPT authentication, copy Express process-local rate limiting, or deploy as part of this handoff.

### New isolated project, only if explicitly chosen later

Use Replit's supported GitHub provider-import flow in a separate project. Review any requested account grant yourself. Imported source does not include production data or permission to move the live domain. Follow this repository's install/run instructions and preserve the Vinext/Cloudflare-compatible architecture unless an approved task specifically covers a port. A development preview is not the canonical public site.

Official references: https://docs.replit.com/build/import-from-providers and https://docs.replit.com/learn/projects-and-artifacts/version-control (previously checked 1 October 2026; this update does not reverify provider UI).

## Other agents
Use the same issue, scoped branch and evidence handoff. A new agent integration is a new connection decision, not permission inherited from this guide. Keep one integrator per release.

## First successful collaboration
Success means one independent review produces a useful finding, one scoped change addresses it, another person/tool checks it, and its evidence survives the handoff. It does not require agents to chat continuously or a custom orchestration server.
