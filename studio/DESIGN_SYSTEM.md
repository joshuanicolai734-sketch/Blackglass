# Blackglass design guidance

## Approved direction, current source
The current direction supports bold light/dark compositions, authored motion and a sleek synthetic body where relevant to the approved task. Historical crimson-only or no-entrance-motion descriptions are not a complete current brief. Do not revert later accepted work merely to match those descriptions.

Before implementation, identify the approved reference, exact source revision and target surface. GitHub, the public Site, the owner-only preview and Android may differ. Reconcile that difference rather than copying a newer private checkout into this public repository.

## Use the existing system
- Start with the selected source's tokens and components; in this repository, inspect `app/site.css` and `components/site/`
- Preserve consistent typography, spacing, readable contrast and clear primary actions across light and dark surfaces
- Keep content, availability information and functional controls legible; do not remove useful data to make a composition cleaner
- Let a synthetic body or technical visual explain movement or state. Keep it clear at phone scale, with a useful fallback
- Treat crimson as an existing signal token, not a restriction requiring every future surface to be crimson-only
- Avoid decorative HUD noise, fake charts and effects that obscure interaction or imitate functionality that does not exist

## Review evidence
Gamma's final visual review should inspect the actual rendered result against the approved brief, including mobile, light/dark states where implemented, loading/error states and reduced motion. Screenshots must use synthetic data and assets approved for their audience. A design review does not replace engineering tests or authorise publication.

Detailed task-specific tokens, assets and references belong in the approved brief; this document does not create a parallel component system.
