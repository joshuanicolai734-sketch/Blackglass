# Blackglass Agent Studio

A small coordination space for Josh, Gamma, Codex, Claude, Replit and other explicitly authorised contributors. GitHub holds shared tasks and reviewed source. It is not an automatic agent-to-agent connection or a new hosting platform.

## Start here
1. Read root `AGENTS.md`, `BLACKGLASS_HANDOFF.md` and this guide.
2. Read [CURRENT_STATE.md](CURRENT_STATE.md). Reconcile the intended source before product edits.
3. Pick one issue with a specific outcome and acceptance evidence. Use a stable `BG-###` task ID in the branch, brief, review and PR; record the GitHub issue URL separately. The ID is not the issue number. Check the [initial task crosswalk](FIRST_TASK.md) before assigning an ID.
4. Agree one implementer and a separate reviewer. Record the files/area owned by the task in the issue before editing. Parallel work must use separate branches/worktrees and non-overlapping scopes.
5. Open a draft PR. Link the issue, report the exact source SHA, changes, tests and limitations. Use the [handoff](templates/HANDOFF.md) and [review](templates/REVIEW.md) templates.
6. An authorised integrator reviews the result, CI and current base before merging. A merge is not publication. Deployment and database changes have their own review.

## Intended roles
- Josh: product direction, commercial decisions and account/security approvals
- Gamma: creative direction, approved experience briefs, product coherence and final visual review
- Codex: production implementation, architecture, responsive behaviour, performance, accessibility and repeatable validation
- Claude: independent critic/QA, primarily PR review against the brief; findings first, with no automatic rewrite or redesign
- Replit: isolated experiments and prototypes in a separate workspace/branch; no automatic production integration or hosting cutover
- Coordinator/integrator: explicitly assign these responsibilities per task; keep scope and dependencies clear, combine reviewed work and verify the release boundary

These are intended assignments, not evidence of account access or completed work. Use only authorised, available contributors; name any substitute and preserve independent review. Two agents agreeing is not proof. A reviewer must inspect the result and source, not merely echo the implementer.

## Product-change sequence
Approved brief → optional isolated prototype → implementation → independent critique → accepted revisions → validation → Gamma final visual review → authorised merge.

Josh approves the meaningful product brief before implementation. An existing approved commission can supply that brief; routine reversible decisions within it may proceed autonomously. Seek a new decision only when scope, risk, access or a consequential commitment changes. Record which review findings were accepted or deferred and why. Re-review affected behaviour after revisions. If a planned reviewer is unavailable, record the outstanding gate rather than inventing approval. Publication remains a separate decision after merge.

## Small, useful studio records
Before substantial work, read [product intent](../BLACKGLASS.md), [product principles](../PRODUCT_PRINCIPLES.md), [design guidance](../DESIGN_SYSTEM.md), [motion guidance](../MOTION_SYSTEM.md) and the approved brief. They extend existing repository safeguards and do not reinstate obsolete palette or motion restrictions.

Create task material when needed: `studio/briefs/` for approved briefs, `studio/reviews/` for evidence-backed critiques, `studio/decisions/` for accepted direction/trade-offs, `studio/experiments/` for isolated prototypes, and `studio/references/` for public-safe approved references. Do not add empty placeholders or duplicate an issue's evidence merely to fill the folders. Keep each task's canonical issue URL and stable BG ID with its records.

## Working agreement
- One issue, one accountable owner, one branch and one acceptance record
- No direct concurrent edits to the same checkout. Replit gets its own workspace; local sessions get their own worktree
- Pull the latest agreed base before beginning. If another task changes the same files, coordinate instead of force-pushing or replacing them
- Small PRs; no opportunistic dependency upgrades or broad refactors in a UX fix
- Never use old exports to overwrite newer work. Never copy an entire Sites checkout over this repo
- Keep experiments under a task-specific directory/branch until reviewed. No automatic merge, production publish, secret copying or external-agent invocation
- Record blockers promptly in the issue: exact operation, evidence, owner and next safe action
- Keep a decision only when it changes future work. Use [DECISIONS.md](DECISIONS.md)

## Public repository boundary
This repository is public. Do not commit customer enquiries, personal training/financial records, progress photos, private strategy, authentication/signing keys, database exports, private preview assets or raw user conversations. Use synthetic fixtures. Private strategic research stays outside this repository until a deliberately redacted brief is approved.

## Tools and first task
See [SETUP.md](SETUP.md) for the smallest manual connection flow. Start with the non-mutating source-reconciliation task in [FIRST_TASK.md](FIRST_TASK.md), not a simultaneous redesign. This setup does not claim Claude or Replit has been connected or has run a task.
