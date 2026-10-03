# First implementation brief: native enquiry error feedback

- Related evidence: [BG-007 / issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7), [Replit source comparison](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5955993208), and [current-state decision](../collaboration/CURRENT_STATE.md#replit-source-comparison-and-baseline-decision)
- Status: the owner authorised starting this bounded enquiry-error task on 2 October 2026, including additional independent Claude review. The candidate has since been independently reviewed, accepted and privately staged; see the dated evidence below. This docs-only PR does not itself change runtime code, and no merge, deployment, source migration, authentication change or new account access is approved
- Task identity: proposed successor work arising from BG-007; no new BG ID or implementation issue is assigned. BG-007 remains read-only and BG-001 remains the separate Exercise Player V2 rehearsal
- Coordination/integration: Gamma. Intended implementer: Codex. Authorised independent reviewer: Claude, subject to availability. If assigned a small correction, Claude may edit only its named paths on an isolated branch and return a draft PR for Gamma's independent review. The owner's bounded implementation approval is recorded above. These roles do not invoke tools or grant access

[PR #10](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10) at `7a97f97e6b2a5f8d8ede0f85f599e2438ce0d419` contains the exact candidate and tests under `studio/reviews/enquiry-feedback/`; it does not install runtime code. [Claude's independent review](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10#issuecomment-5956887461) reproduced both suites (22 + 48 executions with overlapping coverage), and Gamma accepted it. [Private staging reported on 2 October](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10#issuecomment-5960897133) includes the same candidate hash, full lint/type/build checks, 16 isolated D1/no-JavaScript checks and hosted browser checks at 320/430/1280. This correction did not rerun them. Forced-429 browser recovery, reduced-motion and physical-phone results were not established by that staging report. Public Site v33 remains unchanged; review, private staging and public deployment are separate stages.

## Decision and rationale

Keep the native public Sites/Vinext/D1 application. Use the Replit comparison to select useful behavior, rather than merge its Vite/Express/PostgreSQL scaffold. The native app already has ordinary HTML form submission, receipt/retry pages, server-side ChatGPT owner checks and newer public website behavior that a wholesale port could lose.

The recommended source is the current owner-confirmed **public** native Site. Its version 33 checkpoint is `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`, freshly restored and independently verified clean on 2 October 2026 at 15:58 UTC. The coordinator confirmed version 33 is still the active public version. Create the isolated implementation branch from this verified base, preserving any later public work. GitHub default `b87393d8a5ffff089ecc327ec0212e67161e1921` is the native comparison reference; it must not replace the newer public source. Replit `12fc014b1d12669952120d2cf7c6c6304fa8f46d` remains a separately preserved experiment. The owner-only review source is excluded.

Fresh source inspection confirms that public `sendEnquiry` already requires JSON `{ok:true}` and uses a 15-second deadline covering headers and response body. The current error display in `public/site.js` lines 433–435 distinguishes 409 but not 429. That missing message branch is the concrete first implementation target; do not refactor the receipt transport.

## Preserve both histories before integration

1. Record exact source identities and dirty/untracked state in their own environments. Preserve later work as well as the known commits
2. Protect the chosen native source and Replit migration with named checkpoint refs and verify restorable current-source checkpoints; isolate the Replit port on a clearly named local migration branch before any sync
3. Retain `.migration-backup`. Replit reports it preserves the old merge base, not the latest native source or current port. Do not restore it over either current tree
4. Record the implementation's exact base, owned paths, reviewer and rollback. Use a separate bounded branch. Do not push Replit commits or import an entire checkout into GitHub

No checkpoint refs, new branches, archives, source transfers or sync operations are created by this documentation update. Preservation of both histories remains mandatory before any later cross-source sync; the first change is isolated native work and does not require a Replit sync.

## First change: truthful receipt and rate-limit feedback

User outcome: visitors retain their entries and receive accurate, understandable feedback when an enquiry response cannot be confirmed, including a 429 response. There must be no false success or automatic duplicate submission.

Implementation scope on the verified base:
- Preserve the public baseline's verified confirmed-receipt and timeout logic. Do not copy the older GitHub or Replit `site.js` over it
- Add the verified missing 429 error-feedback case in the existing catch/show path, using the native message/accessible-status pattern and existing email fallback. Treat the Replit behavior as a requirement, not a mandate to copy its implementation
- Preserve entered values and restore the submit control after failure. Do not claim that nothing was saved when the result is uncertain. Do not reset the form, show success or count a conversion without the existing confirmed receipt
- Do not add automatic retries, a timer that invents a server policy, a new rate limiter, or new server status/response contracts
- If equivalent behavior already exists, avoid duplicate code and add only justified regression coverage within the approved scope

Owned area: the enquiry handler in `public/site.js` and focused synthetic tests. Inspect `components/site/forms.tsx`, `app/api/enquiries/route.ts`, receipt/retry pages and `db/events.ts` for preservation checks; these are not permission for a broad rewrite. A necessary expansion must be explained before editing outside the agreed area.

## Acceptance evidence

Use a local or isolated development fixture; never submit test enquiries to the production site. Keep implementer and test/review work in separate owned paths/worktrees; the implementer owns the minimal runtime change, a separate test worker owns acceptance coverage, and Claude reviews the exact resulting diff and evidence rather than merely this brief.

- Confirmed successful JSON receipt: success occurs once, fields reset only after confirmation, and conversion counting remains server-side after the saved row
- HTTP 200 with HTML, missing receipt flag or a false receipt: no false success or reset
- Stalled headers/body, network rejection and abort/timeout: bounded completion, retained entries, usable retry controls and uncertainty-aware messaging
- 429 with JSON or non-JSON error content: friendly rate-limit feedback, retained entries, no automatic resubmission and no invented wait duration
- Existing duplicate 409 and storage 503 behavior: correct distinct/recoverable feedback, no duplicate conversion, no misleading assertion that an uncertain request saved nothing
- Repeated clicks, interruption and return: one in-flight submission, controls recover, accessible status is announced and focus behavior remains usable
- JavaScript-disabled URL-encoded and multipart forms: existing 303 receipt/retry routes and short-lived HttpOnly retry behavior remain intact; invalid and oversized bodies/file parts retain existing rejection semantics
- Rendered review at 320/430-pixel widths and desktop, plus keyboard and reduced-motion checks where relevant. Record environments actually tested; desktop emulation is not a physical-phone result
- Run required lint, TypeScript and production build checks on the final implementation head, plus the focused receipt/error tests. Report failures, skipped checks and outstanding device states separately

No new app download availability, coaching claims, permissions, production records or database schema are part of this task.

## Follow-on: native inbox counts and pagination

Consider this only as a separate approved task after confirming the gap in the restored public source. Gamma verified that the GitHub native reference loads the newest 100 enquiries and derives displayed new/client counts from those loaded rows. Replit reports useful global/filtered totals and 50-row keyset pages, but they use PostgreSQL-specific behavior.

A later brief must keep the native server-side owner check on every new read/mutation, adapt queries and cursor representation to D1/SQLite, and update response contract plus UI together. Preserve the stored timestamp and ID ordering rather than copying PostgreSQL microsecond assumptions. Use synthetic data beyond 100 rows, equal timestamps, filter changes, repeated Load more, mutations and concurrent inserts/deletes. Specify whether pages/counts are live or snapshot-consistent; do not claim atomic consistency without evidence. Do not remove the newer native owner workspace while adding inbox behavior.

Before assigning inbox work, reconcile [PR #1](https://github.com/joshuanicolai734-sketch/Blackglass/pull/1)'s `app/admin/page.tsx` export UI and the chosen native source. The [Replit inbox report](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8#issuecomment-5966974823) is source-only input, not implementation permission. Name exact owned paths and reviewers in the later brief, preserve exports and owner-workspace behavior, and use isolated synthetic datasets; deleting test enquiries does not reverse aggregate event counts.

Clerk migration, Express CORS/proxy assumptions, persistent/distributed rate limiting, OpenAPI generator adoption and hosting/database migration are excluded and require separate scopes.

## Completion and rollback

Completion requires an independently reviewed minimal diff on the verified native base, passed final-head tests and rendered evidence, and a record of remaining limitations. Keep the implementation PR draft until its review gates are met. Reverting the bounded implementation commit on its isolated branch is the source rollback; preservation checkpoints remain intact. Merge, public Site publication and any data/security change remain separate decisions.

BG-007's cross-history preservation remains open. [Claude's 3 October desktop/mobile journey report](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5967090047) covers headless Chromium with intercepted API calls and synthetic outcomes; it does not establish backend/D1, actual no-JavaScript POST round-trip, physical-phone or screen-reader behavior. The owner has approved this narrow native task; that approval does not mark the wider reconciliation complete. Receiving a source comparison or passing this documentation PR's CI does not satisfy runtime or release gates.
