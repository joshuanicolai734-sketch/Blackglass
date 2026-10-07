# v33 port: coaching format and mobile fixes (7 October 2026)

**Approval (Josh, 7 Oct, in chat):** "Go ahead". This answers the line *"Approve Gamma to port PR #9 `753ef84` and PR #13 into v33 staging. No publish."*

- **Covers:** porting the runtime changes from PR #9 at `753ef84` and from PR #13 at `f71266a` into **v33 staging**.
- **Second approval (Josh, 7 Oct, in chat):** "Approve gamma". This answers the line *"Approve Gamma to stage `/movement-clips-sw.js` + the `site.js` append on v33 staging (no publish)."* See item 7.
- **Does not cover:**
  - publishing
  - the Today module (PR #14)
  - any merge on GitHub

## What to port

Patches are against base `b87393d` (the GitHub baseline). v33 has a different source history, so apply them **by hand**, using these files as the exact intent.

| # | Change | Patch | v33 notes |
| --- | --- | --- | --- |
| 1 | `coaching.format` = **"In person in Dunedin, or online anywhere in New Zealand"**. First item of the `/coaching` offer list; in the `/coaching` meta description; new FAQ "Do I need to be in Dunedin?" → "No. Coaching runs in person in Dunedin, or online anywhere in New Zealand." | `pr9-runtime.patch`: `content/site.ts`, `app/coaching/page.tsx`, `content/faq.ts` | Keep the wording exact. Settings belong in `content/site.ts` (AGENTS.md). |
| 2 | Enquiry options "12-week coaching" and "Programme only". The programme FAQ quotes "Programme only". | `components/site/forms.tsx`, `content/faq.ts` | Option **values** (`coaching` / `programme`) are unchanged, so the API, retry pages and admin labels are unaffected. The price stays in the offer panel. |
| 3 | 24 px targets: `.crumbs a`, `.hdr-brand` and `.links-foot a` get `display: (inline-)flex; align-items: center; min-height: 24px`. | `app/site.css` | Breadcrumbs push content down 7–8 px. Header height is unchanged. |
| 4 | 12 px text: `/links` button notes use `var(--fs-label)`; Movement Studio labels and play state are no longer forced to 10 px below 420 px (labels keep `.04em` tracking). | `app/site.css`, `app/tokens.css`, `app/links/page.tsx` | v33 already has a 12 px token (`performance.css`), so skip the `tokens.css` hunk. On `/links`, wrap the preview note in `clauses()` so "no iPhone app" never splits. |
| 5 | Movement Studio play row wraps, and `.ms-state` reserves the width of its longest word. | `app/site.css` | Live v33's row doesn't overflow today. Port only if item 4 makes it overflow (check C6 below tells you). |
| 6 | Owner inbox: coaching enquiries and preview sign-ups **by campaign source**. | `pr13-admin.patch`: `app/admin/page.tsx` | First confirm that v33's enquiry submit still sets `data.src` and that its route still passes `src` to `countEvent`. Otherwise both lines show only `direct/other`. |
| 7 | Clip-range service worker: Movement Studio clips become seekable even though the host ignores `Range`. | `studio/fixes/movement-clip-range/` at `9ccdbc7` (unchanged since) | Copy `movement-clips-sw.js` to the public root, so it's served at `/movement-clips-sw.js` as JavaScript. Append `site-js-append.js` to the end of v33 `public/site.js`. Change nothing in the React player. Rollback: serve `rollback-sw.js` at the same URL and remove the append. The folder's README has the evidence and a phone check. |

## Acceptance check (run against staging)

```sh
npm i playwright   # or use an existing install
node verify-staging.mjs https://<staging-host> [--chromium /path/to/chromium] --clip
```

`--clip` adds **C7** for item 7. It checks that:
- the worker file is served as JavaScript
- the worker controls `/movements`
- a clip `Range: bytes=0-99` request comes back as `206` with 100 bytes
- dragging the slider to 60 % seeks with no "couldn't load" message

Validated on 7 Oct, against local copies of the site that ignore `Range` the way live does:
- **With the worker:** 4/4 pass (`206 bytes 0-99/69396`; the scrub landed at 2.4 s).
- **Without it:** fails (`404`, no controller).
- **Live v33:** fails the same way, since the worker isn't deployed.

The script only reads pages:
- It stubs `navigator.sendBeacon` and aborts every `/api/` request, so nothing is counted or submitted.
- It exits with 0 only if every check passes.

**Checks:**
- **C1:** the format line, meta description and FAQ on `/coaching`.
- **C2:** every enquiry option fits its select at 320 and 360 px.
- **C3:** no text under 12 px.
- **C4:** no target under 24 px tall. Links inside sentences are exempt under WCAG 2.5.8; navigation, breadcrumb and footer links are not.
- **C5:** no horizontal overflow.
- **C6:** the Movement Studio play row fits with "Playing" and "Loading".

C3–C5 run on 8 pages at 320, 360 and 1280 px.

**What the script reported on 7 Oct.** Both runs used headless Chromium; 0 `/api/` requests reached a server.

| Target | Result | Failures |
| --- | --- | --- |
| Baseline build at `753ef84` (local) | 78 / 79 | `/` at 320 px is 331 px wide, from the offer cards. Fixed in PR #11, not in this port. |
| Live v33 (today) | 51 / 79 | All expected: C1 ×3, C2 ×2, `/movements` and `/links` text under 12 px, and targets under 24 px on breadcrumbs, the header brand and the `/links` footer. Live has no homepage overflow at 320 px, so PR #11 isn't needed there. |

**Pass condition for staging:** 83 / 83 with `--clip` (79 without it). Item 7 also needs one real iPhone and one Android phone: drag the Movement Studio slider and confirm the clip follows, as described in the clip README's phone check. Headless Chromium can't test Safari. The script doesn't cover the owner inbox (item 6), because `/admin` needs owner sign-in. Check it by hand:
1. Signed in as owner, `/admin` shows "Coaching enquiries by campaign source" and "Preview sign-ups by campaign source" when such events exist in the last 30 days. Both lines are hidden when there are none.
2. The visits and funnel lines are unchanged.

## Then

1. Post the staging URL, the script output and the v33 commit on issue #7, so Claude can retest the same build.
2. Publishing needs a separate approval from Josh.

## Rollback

Each item is independent: revert its hunk in v33. Item 1 is a single string in `content/site.ts`.
