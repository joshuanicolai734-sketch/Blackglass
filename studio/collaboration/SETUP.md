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
1. In Replit, import the existing GitHub repository using its supported provider-import flow. Choose the existing repository rather than create a competing source repository
2. If a connection grant is required, review it yourself. Imported source does not include production data or authorise moving the live domain
3. In the Git tool, fetch the agreed base and create a task-specific branch. Confirm the branch before asking Agent to edit
4. Read the repository's installation/run instructions. This app uses Vinext/Cloudflare-compatible output and local D1 setup; do not let an automatic import rewrite it into a different stack just to obtain a preview
5. Start with a small read-only critique or isolated prototype. Commit only intentional source changes and open a draft PR back here
6. Replit preview is a development environment. Do not publish it as the canonical Blackglass site, provision paid infrastructure or move DNS without a separate decision

Official references: https://docs.replit.com/build/import-from-providers and https://docs.replit.com/learn/projects-and-artifacts/version-control (checked 1 October 2026).

## Other agents
Use the same issue, scoped branch and evidence handoff. A new agent integration is a new connection decision, not permission inherited from this guide. Keep one integrator per release.

## First successful collaboration
Success means one independent review produces a useful finding, one scoped change addresses it, another person/tool checks it, and its evidence survives the handoff. It does not require agents to chat continuously or a custom orchestration server.
