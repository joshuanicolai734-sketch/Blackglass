# Reference snapshot: the public site at Sites v34 (7 November 2026)

This is a read-only copy of what https://blackglass.co.nz served on 7 November 2026: Sites version 34, still hosted by ChatGPT Sites. It is **build output, not source**, and nothing here is served or built.

**Why it exists:** the v34 source lives only inside the ChatGPT Sites project. If that project goes away before the source is exported to GitHub (`studio/handoffs/2026-11-07-leaving-chatgpt/README.md`, step 2), this snapshot is the reference for rebuilding the v34-only parts on top of this repository.

**What's in it:**
- `pages/`: the HTML of the 8 public pages and the 404 page.
- `files/`: every same-origin file those pages loaded at 1280 px and on Pixel 7 emulation that differs from this repository's `public/` (8 identical files were skipped). That covers the stylesheets, the JavaScript chunks, `site.js`, `intro.js`, the brand SVGs, the curl-study image, and the six Movement Studio clips and posters as served.
- Nothing private. These are public pages fetched with plain GETs. Every `/api/` request was aborted and beacons were stubbed, so no visit was counted. Cloudflare's `/cdn-cgi/` scripts weren't kept.

**How v34 differs from this repository** (page text similarity of the build at `7537c77`, then PR #9's head, against v34):

| Page | Similarity | Notes |
| --- | --- | --- |
| `/` | 0.43 | New home page: the `home-v2`/`performance-hero` hero, the brand intro (`bi-*`, `force-opening` chunk and CSS), the motion poster and study player (`mp-*`, `hs-*`, `study-player`, `home-product-art`, `force-model`, `force-product-handoff` chunks). |
| `/movements` | 0.70 | Movement Studio additions: `movement-stage`, `movement-phase-strip`, `ms-phase-track`, `ms-frame-caption`, `ms-loading-notice`. |
| `/coaching` | 0.88 | Close to PR #9; Gamma's next-steps and route-hint variant (port README item 11). |
| `/get` | 0.99 | Near-identical. |
| `/links`, `/privacy`, `/get/joined`, `/coaching/sent` | 1.00 | Identical text. |

The live stylesheet has 52 class names this repository's build doesn't, and none of this repository's are missing from it.

**Use it only as a reference** for markup, styles and behaviour when rebuilding. Prefer the exported source if it arrives (branch `sites-v34-source`). Keep the clips' licensing and provenance as in `docs/MOVEMENT_STUDIO.md`.
