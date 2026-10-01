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
