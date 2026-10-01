# Blackglass Agent Studio

A small coordination space for Josh, Gamma, Claude, Replit and other explicitly authorised contributors. GitHub holds shared tasks and reviewed source. It is not an automatic agent-to-agent connection or a new hosting platform.

## Start here
1. Read root `AGENTS.md`, `BLACKGLASS_HANDOFF.md` and this guide.
2. Read [CURRENT_STATE.md](CURRENT_STATE.md). Reconcile the intended source before product edits.
3. Pick one issue with a specific outcome and acceptance evidence. Use `BG-<issue number>` in the branch, brief and PR.
4. Agree one implementer and a separate reviewer. Record the files/area owned by the task in the issue before editing. Parallel work must use separate branches/worktrees and non-overlapping scopes.
5. Open a draft PR. Link the issue, report the exact source SHA, changes, tests and limitations. Use the [handoff](templates/HANDOFF.md) and [review](templates/REVIEW.md) templates.
6. An authorised integrator reviews the result, CI and current base before merging. A merge is not publication. Deployment and database changes have their own review.

## Roles, not model rankings
- Josh: product direction, commercial decisions and account/security approvals
- Coordinator: keep tasks bounded, reconcile dependencies and choose the next useful result
- Implementer: change only the agreed scope and produce repeatable evidence
- Reviewer: independently challenge functionality, craft, privacy and test coverage
- Integrator: combine reviewed work and own release verification

Any approved tool can perform a suitable role. Two agents agreeing is not proof. A reviewer must inspect the result and source, not merely echo the implementer.

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
