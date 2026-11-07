# Working on Blackglass with Claude Code and Codex

This public GitHub repository is the shared review surface for changes committed here. It is not a complete mirror of the public Site, external Android project or owner-only review source. Read [the current-state map](../studio/collaboration/CURRENT_STATE.md), agree the source and target, and verify the exact base before editing. The default branch is `claude/blackglass-domain-migration-0pxc6q`. Use a scoped branch, run the checks, and merge only after the appropriate approval. Do not force-push or replace a source with an older ZIP export.

## Daily editing

1. In Claude Code on your computer: first inspect and preserve local commits, uncommitted and untracked work. Select the agreed base in a separate branch/worktree before authorised edits. Run `pnpm lint && pnpm exec tsc --noEmit && pnpm build`, then push the scoped branch and open a draft pull request when publication of the diff is authorised.
2. In Codex: give the repository or pull request URL. Codex can inspect it, make changes on a branch, review and merge after checks, and hand back the commit URL. If another editor pushes while work is in progress, compare the latest branch before writing.
3. Keep product settings in `content/site.ts`, content in the appropriate `app/` page and `content/faq.ts`, styling in `app/site.css`, and shared UI in `components/site/`. Read `AGENTS.md`, `BLACKGLASS_HANDOFF.md` and `docs/MAINTAINING.md` first.

## Publishing the live website

The live domain `https://blackglass.co.nz` is hosted by the ChatGPT Sites project identified in `.openai/hosting.json`. GitHub and Sites are **different repositories**. A GitHub push or merge does **not** publish to the live site.

To publish a reviewed GitHub commit:

1. Identify the exact GitHub commit SHA and compare it with the current live Sites version. Preserve every later change and all existing database records.
2. Bring the chosen source into the Sites checkout. Run the full checks and production build. Inspect `drizzle/` for new migrations and validate the lead forms, intro, links and mobile layout.
3. Save and deploy a new Sites version. Verify that deployment succeeded and that the custom domain points to it. Record the GitHub commit alongside the Sites version in the handoff.
4. Tell Josh the live URL and the published commit. Do not say a GitHub change is live before Sites confirms deployment.

Codex in this ChatGPT project can perform the Sites publish step when asked to publish a specific reviewed commit. Claude Code can keep building, testing and pushing code to GitHub, but cannot directly publish this Sites project merely by pushing to GitHub. To make both tools deploy independently on every merge, the hosting, authentication and D1 data would need a separate planned migration to a GitHub-connected deployment platform. Do not repoint the domain or replace the D1 database as part of ordinary code updates.

The repository is currently public. Keep API tokens, signing keys, local environment files and customer enquiries out of Git history. The production D1 database is not part of this repository.
