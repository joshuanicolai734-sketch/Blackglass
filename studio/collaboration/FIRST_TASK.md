# First collaboration trials

## Task crosswalk
- `BG-007` — read-only source reconciliation and journey review: [existing issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7). `BG-7` is its legacy issue-derived alias; keep the issue and its scope unchanged
- `BG-002` — mobile hook and cohesion: [draft PR #9](https://github.com/joshuanicolai734-sketch/Blackglass/pull/9), coordinated through [issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7); review and proposed brief exist, broader implementation approval is not implied
- `BG-001` — Exercise Player V2: planned first implementation rehearsal. No new issue, approved implementation brief or completed work is claimed here

BG IDs are stable project identifiers, independent of GitHub issue numbers. Link the actual issue URL separately, preserve existing aliases, and do not reuse an allocated ID. The numerical order does not replace dependencies: `BG-007` source reconciliation is a prerequisite for `BG-001` implementation. Add future IDs and their canonical issue links to this crosswalk as they are assigned.

PR #10's enquiry-feedback candidate and PR #11's check-in correction currently use their PR links; no new stable IDs are allocated by this correction. The coordinator should check existing allocations before assigning IDs or creating dedicated implementation issues. See the [owned-path map](CURRENT_STATE.md#open-work-and-owned-paths) before starting related work.

## Current prerequisite: BG-007

### Goal
Establish which source and preview are current before any parallel product edits. Then independently review one website-to-app-access journey.

### Scope
Read-only inspection of the default branch, handoff, publishing instructions, availability settings and relevant UI. Compare with authorised current release evidence supplied by the integrator. Do not export private data or use private screenshots in a public issue.

### Deliverable
A short table: surface, exact source ref, what was inspected, divergence, recommended next action. Identify one important friction or trust defect with reproducible steps. If none is verified, say so rather than inventing one.

### Acceptance
- Distinguishes repo HEAD, public deployment, private preview and Android version
- Preserves the preview-list versus install distinction
- Names desktop/mobile evidence and untested states precisely
- Proposes a bounded follow-up with affected paths and data risks
- No source overwrite, production deployment, account grant or private-data publication

### Handoff
Coordinator chooses whether to create an implementation issue. Assign a different reviewer for that change. Keep source reconciliation separate from any hosting migration or major redesign.

## Planned implementation rehearsal: BG-001 Exercise Player V2
After source reconciliation selects the current source and target surface:
1. Gamma prepares `studio/briefs/BG-001-exercise-player-v2.md` with the user outcome, preserved functionality, approved visual/motion direction, owned paths and acceptance evidence
2. Josh reviews and approves the brief. The title alone does not authorise feature scope, a redesign or moving private assets into this repository
3. Codex implements on an isolated branch from the agreed current base and opens a draft PR linked to the new issue
4. Claude independently reviews the exact PR commit and records evidence/severity; accepted findings and design trade-offs are recorded for Gamma's direction
5. Codex applies accepted revisions and runs the repository's required checks plus the brief's UI, accessibility and device checks
6. Gamma performs final visual review against the brief; the authorised integrator checks the exact source, evidence and outstanding gates before a separately authorised merge

An isolated Replit prototype is optional when the approved brief needs an experiment; it is not a hosting migration. Record unavailable reviewers and untested states honestly. A completed rehearsal requires an actual review/revision/validation loop, not just these documents. Sites publication and Android release remain separate.
