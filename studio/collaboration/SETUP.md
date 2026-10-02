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
4. Give Claude an initial read-only review task. Require paths, evidence and a draft PR for any later implementation
5. Do not enable an automatic GitHub action or copy secrets merely to establish this workflow

Official reference: https://code.claude.com/docs/en/worktrees (checked 1 October 2026).

## Replit

### Existing Blackglass project: inventory first

The existing Replit experiment has reported local migration commits and later uncommitted refinements. Its current state has not been directly reverified. An old “ahead” count against a cached remote does not establish parity with today's GitHub.

1. Open the existing project; do not re-import over it or create a replacement merely to make the sources look aligned
2. Inspect `git status --short --branch`, `git rev-parse HEAD`, `git log -8 --oneline`, `git diff --stat`, `git diff --name-status` and `git ls-files --others --exclude-standard`; record the cached origin SHA separately without fetching
3. Preserve all local commits, changed/untracked files and `.migration-backup`. Report only source metadata and filenames, never secret values, personal records or private contents
4. During this inventory, do not fetch, pull, sync, reset, commit, push, delete/move files, provision infrastructure or publish
5. Describe any Next/Vinext/Sites/D1 versus Vite/Express/PostgreSQL substitutions. An architectural port is not proof of compatibility with the public Site or GitHub source
6. Return the inventory and proposed bounded experiment for a source/target decision. Future work needs its own agreed base, owned paths and review evidence

### New isolated project, only if explicitly chosen later

Use Replit's supported GitHub provider-import flow in a separate project. Review any requested account grant yourself. Imported source does not include production data or permission to move the live domain. Follow this repository's install/run instructions and preserve the Vinext/Cloudflare-compatible architecture unless an approved task specifically covers a port. A development preview is not the canonical public site.

Official references: https://docs.replit.com/build/import-from-providers and https://docs.replit.com/learn/projects-and-artifacts/version-control (previously checked 1 October 2026; this update does not reverify provider UI).

## Other agents
Use the same issue, scoped branch and evidence handoff. A new agent integration is a new connection decision, not permission inherited from this guide. Keep one integrator per release.

## First successful collaboration
Success means one independent review produces a useful finding, one scoped change addresses it, another person/tool checks it, and its evidence survives the handoff. It does not require agents to chat continuously or a custom orchestration server.
