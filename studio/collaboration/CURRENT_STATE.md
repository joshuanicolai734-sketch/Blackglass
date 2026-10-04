# Current state and source boundaries

Evidence is dated by section below. A later documentation review does not refresh source, artifact or runtime evidence. Reverify before editing. This is the single current-state map for the existing collaboration guide; older release notes remain historical evidence.

## Current overview — 4 October 2026

Use this overview for current navigation. This concise map replaces the lengthy status narrative. Earlier review claims are not current assignments.

- **Website:** the public Site and this GitHub repository have different source histories. The latest reconciled public source is version 33 at `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`; this organisation pass has not reverified the live deployment. Do not overwrite it with the older default branch.
- **Android app:** maintained separately from this public website repository. Obtain the approved app source through its existing authorised channel before editing. This map supplies no app source, private artifacts or download links.
- **Changes awaiting review:** use the five existing PRs below. A draft, passing check or source checkpoint is not a merge or release.
- **Replit:** inactive at Josh's request from 4 October. GitHub access removal is a separate pending account action; this documentation cannot verify or change it. No new assignments, invocations or reconnection. Preserve existing work and historical review evidence.

### Where to go

- [Collaboration guide](README.md): who owns each task and how to submit a change
- [Source reconciliation / issue #7](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7): differences between GitHub, the public Site and external source
- [PR #8](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8): this documentation and navigation cleanup, kept draft
- [Publishing guide](../../docs/PUBLISHING.md): separate release requirements

### Existing review queue

Heads inspected on 4 October 2026; refresh before editing. PR #8's listed head is the parent inspected for this documentation update.

| PR | Purpose | Inspected head | Status |
| --- | --- | --- | --- |
| [#8](https://github.com/joshuanicolai734-sketch/Blackglass/pull/8) | Collaboration documentation and navigation | `83f5670d6df8fedabf2385839712715a67fbb6b7` | Draft; documentation only |
| [#9](https://github.com/joshuanicolai734-sketch/Blackglass/pull/9) | Design, labels and mobile-cohesion proposal | `b50fb6da1eead14c4b35baa5e631395ffd92eb89` | Draft; compare with current Site source |
| [#10](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10) | Enquiry-feedback review bundle | `7a97f97e6b2a5f8d8ede0f85f599e2438ce0d419` | Draft; a review bundle is not a runtime release |
| [#11](https://github.com/joshuanicolai734-sketch/Blackglass/pull/11) | Mobile overflow and joined-page coaching link | `6bdbe28ce6d7624d91332fba51421dbf003f4e54` | Draft; includes both `app/site.css` and `app/get/joined/page.tsx` |
| [#1](https://github.com/joshuanicolai734-sketch/Blackglass/pull/1) | Export preparation | `8be51f6837a072c26b8d7d9b1169a8f13628dc7c` | Open, unmerged; not a draft |

PRs #1 and #8 both touch the handoff document; reconcile their edits rather than discarding either. Branches without an open PR are not automatically disposable. The repository's `build/` directory includes source plugins and must not be treated as expendable generated output.

### Next decisions

1. Review the docs-only cleanup in PR #8 against its final head.
2. Select exact current source and compare each runtime proposal before any integration.
3. Finish GitHub's Replit access removal through the authenticated account flow; documentation changes do not revoke permissions.
4. Keep app work in its approved source environment, with build, device testing and distribution as distinct gates.

This organisation pass changes documentation only. It does not move runtime files, delete branches, merge PRs, publish the Site or distribute an APK. Prior build/test claims apply only to their dated sources, not to this update.

