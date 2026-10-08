# v33 port: coaching format and mobile fixes (7 October 2026, updated 8 October)

## Approvals (Josh, 7 Oct, in chat)

1. **"Go ahead"** answers *"Approve Gamma to port PR #9 `753ef84` and PR #13 into v33 staging. No publish."* It covers the runtime changes from PR #9 at `753ef84` and PR #13 at `f71266a`.
2. **"Approve gamma"** answers *"Approve Gamma to stage `/movement-clips-sw.js` + the `site.js` append on v33 staging (no publish)."* See item 7.

**Not covered:** publishing, the Today module (PR #14), or any merge on GitHub.

## Where to port: the owner-only preview, not a fresh copy of live v33

Gamma's [2 Oct staging update](https://github.com/joshuanicolai734-sketch/Blackglass/pull/10#issuecomment-5960897133) says a private, owner-only preview was staged at 20:13 UTC that day. It holds the reviewed 429 enquiry fix (PR #10) and six mobile-clarity changes:
- shorter coaching option labels with a price hint
- duplicate Next Steps removed
- aligned page metadata
- targeted 12 px labels
- 44 px fallback-clip controls

The public site is still v33 (`7daacb8…`), so that preview is the newest source. Port into it, so that one later publish decision covers both sets.

**Where the preview already covers an item** (items 2, 4 and 8 overlap), keep the preview's version if the matching check passes, and only fill what's missing. Don't apply the same change twice.

## What to port

Patches are against base `b87393d` (the GitHub baseline). The preview has a different source history, so apply them **by hand**, using these files as the exact intent.

| # | Change | Patch | Notes for the preview |
| --- | --- | --- | --- |
| 1 | `coaching.format` = **"In person in Dunedin, or online anywhere in New Zealand"**. First item of the `/coaching` offer list; in the `/coaching` meta description; new FAQ "Do I need to be in Dunedin?" → "No. Coaching runs in person in Dunedin, or online anywhere in New Zealand." | `pr9-runtime.patch`: `content/site.ts`, `app/coaching/page.tsx`, `content/faq.ts` | Keep the wording exact. Settings belong in `content/site.ts` (AGENTS.md). If the preview's metadata changes rewrote the description, add the format to that new description. |
| 2 | Enquiry options "12-week coaching" and "Programme only". The programme FAQ quotes "Programme only". | `components/site/forms.tsx`, `content/faq.ts` | **Overlap:** the preview already shortened these labels. Keep the preview's labels if C2 passes, and make the programme FAQ quote the label actually shown. Option **values** (`coaching` / `programme`) must stay unchanged. |
| 3 | 24 px targets: `.crumbs a`, `.hdr-brand` and `.links-foot a` get `display: (inline-)flex; align-items: center; min-height: 24px`. | `app/site.css` | Breadcrumbs push content down 7–8 px. Header height is unchanged. |
| 4 | 12 px text: `/links` button notes use `var(--fs-label)`; Movement Studio labels and play state are no longer forced to 10 px below 420 px (labels keep `.04em` tracking). | `app/site.css`, `app/tokens.css`, `app/links/page.tsx` | **Overlap:** the preview has "targeted 12 px labels". Fill only what C3 still flags. Skip the `tokens.css` hunk (v33 has a 12 px token in `performance.css`). On `/links`, wrap the preview note in `clauses()` so "no iPhone app" never splits. Gamma's 2 Oct check covered `/links` on desktop only, so check it on phones. |
| 5 | Movement Studio play row wraps, and `.ms-state` reserves the width of its longest word. | `app/site.css` | Port only if item 4 makes the row overflow; C6 tells you. |
| 6 | Owner inbox: coaching enquiries and preview sign-ups **by campaign source**. | `pr13-admin.patch`: `app/admin/page.tsx` | First confirm the enquiry submit still sets `data.src` and the route still passes `src` to `countEvent`. Otherwise both lines show only `direct/other`. |
| 7 | Clip-range service worker: Movement Studio clips become seekable even though the host ignores `Range`. | `studio/fixes/movement-clip-range/` at `9ccdbc7` (unchanged since) | Copy `movement-clips-sw.js` to the public root, so it's served at `/movement-clips-sw.js` as JavaScript. Append `site-js-append.js` to the end of `public/site.js`, after the 429 change already there. Change nothing in the React player. Rollback: serve `rollback-sw.js` at the same URL and remove the append. |
| 8 | Fallback clip links ("Open the angled clip" / "Open the front-view clip") get 44 px targets. On live they are 15 px tall in the no-JavaScript view and the media-error state. | `app/site.css` (`.ms-fallback a`) | **Already in the preview** per Gamma ("44px fallback-clip control styling"). This baseline commit only matches it. Nothing to port if the no-JS C4 check on `/movements` passes. |

## Acceptance check

```sh
npm i playwright   # or use an existing install
node verify-staging.mjs https://<preview-host> --clip [--chromium /path/to/chromium] [--storage-state state.json]
```

**Owner-only preview:** the pages need your sign-in. To save a signed-in browser session, run `npx playwright open --save-storage=state.json https://<preview-host>`, sign in, and close the window. Then pass `--storage-state state.json`.

> **`state.json` holds a sign-in cookie.** Keep it on your machine and delete it afterwards. Never commit it, post it or paste it anywhere.

**What the script does:** it only reads pages. It stubs `navigator.sendBeacon` and aborts every `/api/` request, so nothing is counted or submitted. It exits with 0 only if every check passes.

**Checks:**
- **C1:** the format line, meta description and FAQ on `/coaching`.
- **C2:** every enquiry option fits its select at 320 and 360 px.
- **C3:** no text under 12 px.
- **C4:** no target under 24 px tall. A link is exempt only when it sits inside real sentence text (WCAG 2.5.8). A row of links such as "Open A / Open B" isn't a sentence. Navigation, breadcrumb and footer links are never exempt.
- **C5:** no horizontal overflow.
- **C6:** the Movement Studio play row fits with "Playing" and "Loading".
- **C7 (`--clip`):**
  - the worker file is served as JavaScript
  - the worker controls `/movements`
  - a clip `Range: bytes=0-99` request comes back as `206` with 100 bytes
  - dragging the slider to 60 % seeks with no "couldn't load" message

**Where C3–C5 run:** on 8 pages at 320, 360 and 1280 px with JavaScript, and again at 360 px with JavaScript off, where fallback controls appear.

**Results on 8 Oct.** All runs used headless Chromium; 0 `/api/` requests reached a server.

| Target | Result | Failures |
| --- | --- | --- |
| Baseline build with the item 8 fix (local) | 102 / 103 | Only `/` at 320 px is 331 px wide, from the offer cards. Fixed in PR #11; live doesn't have this problem, so it isn't needed there. |
| Baseline build before the item 8 fix (local) | 101 / 103 | Also fails C4 no-JS on `/movements`: both fallback links are 15 px. This shows the new check catches the problem. |
| Live v33, with `--clip` | 66 / 105 | All known gaps: C1 ×3, C2 ×2, C3 ×7, C4 ×25 (with and without JavaScript), and C7 (worker 404, no controller, so its other two checks don't run). |
| Local copies that ignore `Range`, `--clip` only | worker: 4/4 C7; no worker: fails | With the worker, the clip returns `206 bytes 0-99/69396` and the scrub lands at 2.4 s. Without it: `404`, no controller. |

## Pass condition for the preview

1. The script reports **107 / 107** with `--clip`.
2. Signed in as owner, `/admin` shows "Coaching enquiries by campaign source" and "Preview sign-ups by campaign source" when such events exist in the last 30 days, and hides both when there are none. The visits and funnel lines are unchanged.
3. **Josh, on his own iPhone and Android phone**, opens the preview's `/movements` (signed in), drags the slider, and the clip follows. Headless Chromium can't test Safari, and the preview is owner-only, so this check has to be done by hand.

## Then

1. Post the preview's Sites version or commit and the script output on issue #7, and Claude will retest the same build.
2. Publishing needs a separate approval from Josh. That one publish would also take the 2 Oct staged work (the 429 fix and mobile-clarity changes) live.

## Rollback

Each item is independent: revert its hunk. Item 1 is a single string in `content/site.ts`. Item 7 has its own `rollback-sw.js`.
