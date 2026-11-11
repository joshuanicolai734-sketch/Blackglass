# Source reconciliation, 7 November 2026

`CLAUDE.md` and `docs/CLAUDE_HANDOVER.md` §9 ask for this report before any redesign. The Claude lead checked everything below between 05:00 and 08:00 UTC on 7 November. Where notes and the live site disagree, the live site wins, and the conflict is listed at the end.

## Summary

| Surface | Version and evidence | Next action |
| --- | --- | --- |
| Website source on GitHub | Default branch at `26599f5`. Its code is still Sites v16's (`deb4a6b`, 30 Sep). | Put the v34 source on GitHub. |
| Public site | Sites v34, unchanged today. | None. Fixes ship with the hosting move, on Josh's approval. |
| Android app | 89.0 is documented here. Later builds (927 to 931) are in Josh's Google Drive, with no source found. | Josh names the current build and where its source is kept. |
| Private preview | Not provided to this session. | None until Josh shares one. |

## 1. Website source on GitHub

- **Ref and evidence:**
  - The default branch `claude/blackglass-domain-migration-0pxc6q` is at `26599f5`. Its three 7 Nov commits add docs only.
  - Outside docs, nothing has changed since `deb4a6b`, the commit Sites v16 was published from on 30 Sep.
  - Open draft PRs: #8, #9, #10, #11, #13, #14, #16 and #18. PR #1 is the old export preparation.
- **Verified working** (PR #9's branch):
  - Lint, typecheck and build pass, and CI is green.
  - `pnpm check:hosting` passes its 9 checks.
  - Locally:
    - clips answer byte ranges and seek to the requested time without a service worker;
    - `/admin` refuses forged ChatGPT headers and forged Access tokens.
- **Required but unverified:**
  - Everything on Cloudflare, because there's no account yet.
  - The product changes in PR #14 (Today), #16 (`/cut`) and #18 (`/experience`), which wait for Josh's decisions.
- **Divergence or risk:**
  - GitHub is 18 Sites versions behind the live site.
  - The v34 source exists only in the ChatGPT Sites project. If that project goes before the source is exported, the public snapshot in `studio/reference/sites-v34-2026-11-07/` is all that's left of it.
- **Next action:** put the v34 source on GitHub.
  - The exact route is Josh's one export message (`studio/handoffs/2026-11-07-leaving-chatgpt/README.md`, step 2).
  - Failing that, rebuild v34 on PR #9's branch from the snapshot, checked against the snapshot page by page.

## 2. Public site (blackglass.co.nz)

- **Ref and evidence:**
  - Sites v34, as recorded when it was published (`studio/handoffs/2026-10-07-v33-port/README.md`).
  - Rechecked at 07:37 UTC with plain GETs. All 8 public pages match this morning's snapshot: same text, stylesheets, scripts, `site.js` and `intro.js`.
  - `/cut` and `/experience` return 404, so PRs #16 and #18 aren't live.
  - Hosting: ChatGPT Sites behind Cloudflare, with DNS at Crazy Domains.
- **Verified working:** the v34 acceptance checker passes 99 of 105 checks (05:07 UTC). Passing:
  - copy and FAQ;
  - the enquiry select fits;
  - tap targets of 24 px or more;
  - no overflow at 320 and 360 px;
  - the pages work without JavaScript;
  - the play row fits.
- **Required but unverified:** live enquiry and preview-list submissions, and `/admin`. Nothing was sent to `/api/`.
- **Divergence or risk:**
  - Home labels are under 12 px: 10 px at 320 and 360 px ("Train with intent.", "Dunedin / New Zealand" and others), and 10 to 11 px at 1280 px.
  - Movement Studio clips can't be scrubbed. The host answers byte ranges with a whole file, and the service-worker fix was never published.
  - Only ChatGPT can publish the site, and Josh is leaving ChatGPT.
- **Next action:** none on the live site. Both fixes ship with the hosting move (handoff step 5), after Josh creates his Cloudflare account and approves the domain switch.

## 3. Android app

- **Ref and evidence:**
  - The repo documents build 89.0 (versionCode 900), with SHA-256 hashes for `Blackglass-89.0-Source.zip` and its APK (`docs/APP_V88_DESIGN_INTEGRATION.md`). Neither file is in this repository or on this session's machine.
  - Josh's Google Drive holds later builds:
    - APKs labelled 927, 928 and 929 (15 to 20 Oct);
    - a "931" preview verification bundle and QA addendum (28 Oct).
  - A title search found no source archive with them, and their contents weren't opened.
- **Verified working:** nothing new. The repo docs report the 89.0 build checks (248,164 assertions and signature checks), but they weren't re-run here.
- **Required but unverified:** every phone-review gate:
  - installation;
  - screen rendering;
  - TalkBack;
  - lifecycle and reduced-motion behaviour;
  - frame pacing.

  The 931 QA files may cover some of these.
- **Divergence or risk:**
  - The repo's Android docs stop at 89.0 (versionCode 900), while the Drive builds are labelled 927 to 931.
  - The website's app screens are historical captures (`docs/MAINTAINING.md`), not taken from 89.0 or later.
- **Next action:** Josh says which build is current and where its source is kept. It stays private, never in this public repo. A device review against the gates above comes next.

## 4. Private preview

Not provided to this session, so nothing here is verified. `studio/collaboration/CURRENT_STATE.md` notes that an owner-only preview holds newer work and private assets. None of it is to be copied into this repository.

## Where the new handover docs and the live site disagree

`docs/CLAUDE_HANDOVER.md` and `docs/PRODUCT_REQUIREMENTS.md` describe the GitHub source correctly but not what visitors see:

| Topic | Handover and requirements | Live v34 |
| --- | --- | --- |
| Last release | Sites v16 (30 Sep) | Sites v34 |
| Action colour | Crimson `#F43F46` | Lime `#DFFF00` (`--c-volt`). The live stylesheets contain no `#F43F46`. |
| Home headline | "Know what today asks of you." | "One session. Then the next." |
| Motion | No entrance animation | A brand intro on `/` (details below). |
| Publishing | Through the Sites project | Josh is leaving ChatGPT (7 Nov). The move plan keeps Sites live until he approves the switch. |

The brand intro on `/`:
- plays once per session, for at most 1.7 s, and can be skipped;
- is skipped with reduced motion, Save-Data or a 2-core device;
- never runs without JavaScript.

`CURRENT_STATE.md` already says the crimson-only and minimal-motion descriptions aren't enough of a current brief. So the rebuild keeps v34 as it is live. Bringing back crimson or dropping the intro would be Josh's design decision after the rebuild.

## Not checked

- Live form submissions, `/admin` and the D1 database. These are off limits: no `/api/` requests and no customer data.
- What's inside the private Android builds and QA bundles.
- Anything on a real phone.
