# Through Black Glass (studio experiment 01)

A standalone page: a ten-chapter animated film and a field guide to AI agents, the neural network inside a language model, and what science still can't explain about it. It uses the Blackglass visual system (Glass and Paper grounds, one crimson signal, Inter Tight and Geist Mono, chamfers, hairlines, registration brackets, signal squares) but is **not part of the website**. It isn't imported by `app/`, isn't in the sitemap and isn't published to blackglass.co.nz. Nothing on the page makes a claim about the Blackglass app or coaching.

## Open it

Open `index.html` in a browser (double-clicking works; no build step or server needed). Fonts come from Google Fonts with system fallbacks; everything else is local.

## Files

| File | What it holds |
|---|---|
| `index.html` | Markup and all of the field-guide prose, ledger and sources |
| `mind.css` | Styles. Token values mirror `app/tokens.css`, which stays authoritative for the site |
| `core.js` | Shared runtime: palette read from the CSS tokens, DPR-aware canvases, one shared animation frame, visibility gating, reduced motion, seeded randomness, the drawing vocabulary, and the superposition maths used by both the film and chapter 09 |
| `film.js` | The film: ten scenes drawn by a pure `render(t)` (about 2 minutes), chapter toolbar, scrub slider and captions. `BG.film.seek(t)` renders any frame for captures |
| `figures.js` | The interactive figures: agent trace, toy tokenizer, attention explorer, one neuron, next-token draw, a live network trained in the page, the superposition explorer, nine mystery drawings, and two chapter plates that replay film scenes in place |

## Motion rules kept

- The film plays only while at least half of it is on screen and the tab is visible. With reduced motion it never starts on its own and shows each chapter's still; the Play button still works if the visitor asks.
- Everything else rests until used. The mystery drawings play on hover, keyboard focus or press, finish their loop and rest on the finished frame.
- Scene changes load the outgoing scene out before the incoming one drives in, so two scenes never double-expose.
- Without JavaScript all of the text is present; the film shows a short note.

## Accuracy

- Facts, figures and quotations are sourced in the page's Sources list (checked October 2026). Prefer the original paper over secondary reporting when updating.
- Anything invented for explanation is labelled where it appears: token IDs, attention weights, next-token scores, the agent trace, feature names and the 3-D positions in the meaning cloud.
- Drawings that follow a published result name it and are simplified (the Dallas → Texas → Austin trace, the superposition pentagon, the 36 + 59 paths).
- The network in chapter 08 is real: two inputs, two tanh layers, a sigmoid output, binary cross-entropy, backpropagation and Adam, trained full-batch on 200 points.

## Checks

The repository checks still apply (`pnpm lint` lints these scripts):

```sh
pnpm lint && pnpm exec tsc --noEmit && pnpm build
```

To review visually, load the page at 1440 and 390 px wide, scrub every chapter and use each figure. The page should show no console errors and no horizontal scroll at 390 px.
