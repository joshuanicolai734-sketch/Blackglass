# Collaboration decisions

## 2026-10-01 — GitHub as the shared review surface
**Decision:** use existing Issues, scoped branches, draft PRs and short evidence handoffs before adding orchestration infrastructure.
**Reason:** preserves inspectable history and reduces conflicting edits across tools.
**Boundary:** no external agent has been connected by these documents; no new access, automatic merge or deployment is configured.
**Revisit when:** two real collaboration trials demonstrate a recurring coordination problem that existing GitHub features cannot solve.

## 2026-10-01 — Reconcile before integration
**Decision:** treat GitHub, public Sites, private preview and Android sources as distinct until exact revisions are reconciled.
**Reason:** an old repo snapshot must not replace newer production or private work.
**Boundary:** customer records, private strategy and owner-only assets stay out of this public repository.

## 2026-10-01 — Stable task IDs and intended studio roles
**Decision:** use stable `BG-###` IDs with separate GitHub issue URLs. Preserve issue #7 as read-only `BG-007` (legacy alias `BG-7`); reserve `BG-001` for the planned Exercise Player V2 implementation rehearsal.
**Reason:** the earlier implementation plan and the source-reconciliation prerequisite describe different work; an issue number must not silently replace either scope.
**Boundary:** Gamma's creative direction/final visual review, Codex's implementation, Claude's independent critique and Replit's isolated experiments are intended assignments, not account connections or authorisation to invoke tools. The implementation rehearsal waits for reconciled source and an approved brief. See the [task crosswalk](FIRST_TASK.md).
