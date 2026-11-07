# Blackglass motion guidance

## Purpose
Motion should communicate state, hierarchy, continuity or physicality. Preserve defining authored interactions from the approved brief; do not silently replace them with a generic fade or remove them solely because implementation is difficult.

## Behaviour
- Make movement deliberate and understandable, including its start, interruption, completion and return states
- For exercise visuals, prioritise legible movement, range and physicality at phone scale; do not imply medical validation or instructional accuracy that has not been reviewed
- Keep synthetic-body rendering sleek and readable rather than adding decorative complexity
- Loading motion must represent actual state; avoid fake progress or availability
- Repeated clicks, cancellation, navigation and background/resume should not trap the user or duplicate actions

## Performance and accessibility
- Check responsiveness and rendering cost on the intended mobile target; report which devices or environments were actually tested
- Heavy 3D, shaders and enhanced transitions need a usable fallback and must not block forms, navigation or core information
- Respect reduced-motion preferences. Provide a stable alternative that preserves meaning and access to controls
- Keep essential information and navigation usable without animation; preserve the repository's progressive-enhancement safeguards

## Evidence
The task brief names the defining motion and acceptance states. The handoff records exact tested source, device/environment, reduced-motion behaviour and untested states. Gamma reviews the experience; an independent reviewer checks regressions, accessibility and performance. See the [review template](collaboration/templates/REVIEW.md).
