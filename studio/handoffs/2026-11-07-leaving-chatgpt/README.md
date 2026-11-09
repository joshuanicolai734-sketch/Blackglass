# Leaving ChatGPT: moving blackglass.co.nz to hosting Claude can publish (7 November 2026)

Josh no longer uses ChatGPT, so Gamma (the ChatGPT Sites agent) and Codex are retired. Claude takes over coordination, integration, final review and, once hosting moves, publishing. Comments from that role on issue #7 are headed **"Claude lead"**.

The public site still depends on ChatGPT Sites in four ways. Nothing below changes what visitors see until step 6.

| Dependency today | Where it is | Replacement |
| --- | --- | --- |
| Hosting and publishing | The Sites project in `.openai/hosting.json` serves blackglass.co.nz (Sites v34). Only ChatGPT can publish it. | Cloudflare Workers on Josh's own Cloudflare account. The site is already a Workers build (vinext and wrangler), so the code doesn't need a new framework. |
| Database | The Sites D1 database, bound as `DB` (enquiries and daily counts). | A D1 database in Josh's account, with the same schema (`drizzle/` migrations). |
| `/admin` sign-in | "Sign in with ChatGPT" headers (`app/chatgpt-auth.ts`). | Cloudflare Access (a one-time email code for Josh) in front of `/admin` and `/api/admin`, with the token verified in code. |
| Current source | The v34 source exists only inside the Sites project. GitHub has the older baseline plus open PRs. | Export it to GitHub once (message below). Failing that, rebuild it from this repository, using the live site's complete stylesheet, pages and `site.js` as the reference. |

## Order

1. **Josh: keep ChatGPT and the Sites project until step 7.** Cancelling or deleting first could take the site, its enquiry inbox and the enquiries offline.
2. **Optional since 8 Nov: Josh sends ChatGPT one last message (below).** It would put the exact v34 source on GitHub. The rebuild on PR #9 already matches v34 (`pnpm check:v34`), so the export is only a cross-check. No customer data goes to GitHub.
3. **Josh: save the enquiries.** Either ask ChatGPT in the same chat for a CSV download, or copy them from `/admin`. Keep them private: the repository is public. The new inbox can start empty, with the old enquiries kept as a file.
4. **Josh: create a free Cloudflare account.** Claude then asks for a deploy token through the secure credential form. Never paste a token in chat.
5. **Claude: build and preview** (runbook: `docs/HOSTING.md`).
   - Done on PR #9: v34 on GitHub, with the 12 px home labels (9 Nov). Clip seeking needs no service worker on this host: the Worker answers ranges itself (`worker/index.ts`).
   - Create the D1 database and apply the migrations.
   - Replace the ChatGPT sign-in with Cloudflare Access.
   - Deploy to a `workers.dev` preview, then run `verify-staging.mjs`, the journey checks and an enquiry test with synthetic data.
   - Josh checks the preview on his phone.
6. **Josh approves the switch.** Point blackglass.co.nz at Cloudflare, by moving the nameservers from Crazy Domains to Cloudflare. Claude then:
   - checks the public domain;
   - makes `www` and `http://` permanent `301` redirects;
   - confirms that a real enquiry reaches `/admin`.
7. **After a week on the new host, Josh can cancel ChatGPT.**

**Rollback until step 7:** point the domain back at ChatGPT Sites; nothing there is deleted.

**Cost:** Cloudflare's free plan should cover this site: Workers (100,000 requests a day at the time of writing), D1, and Access (up to 50 users). Claude rechecks the current limits at sign-up. The domain registration stays at Crazy Domains. Nothing here needs a paid plan. If that ever changes, Claude asks first.

## The one ChatGPT message (Josh pastes it once, in the Blackglass project)

> This is Josh. I'm moving Blackglass off ChatGPT. Please push the exact source of the published Blackglass Site (Sites version 34) to a new branch `sites-v34-source` in joshuanicolai734-sketch/Blackglass, as one commit. Leave out `.env` files, credentials, private assets and any database rows. Reply with the commit hash and the Sites version. Then give me the enquiries table as a CSV file to download here, not on GitHub. Don't publish, change or delete anything else.

## What Claude does meanwhile (no account or approval needed)

- Coordinates on issue #7 as "Claude lead". It assigns and reviews Claude Builder's work. The daily Claude critic stays the independent reviewer.
- Keeps PR #9's home-page label fix ready. It ships with the move in step 5, since nothing can reach the ChatGPT-hosted site.
- **Done on PR #9's branch (7 Nov):** the Cloudflare changes. Nothing is deployed before step 4.
  - The Worker entry answers clip byte ranges with `206`. That's tested locally: the player seeks to 2.4 s for a 2.4 s target, with no service worker.
  - Cloudflare Access sign-in for `/admin`, with token checks. Forged ChatGPT headers and forged tokens are refused.
  - The D1 settings and migration and deploy commands. See `docs/HOSTING.md`.
- **Done on PR #9's branch (7 and 8 Nov, approved by Josh):** v34 rebuilt from the published site, so step 5 no longer waits for the export.
  - It covers the shell, styles, home page and Movement Studio, plus the /coaching, /get and /get/joined details.
  - `pnpm check:v34` shows it matches the live pages, stylesheets and media.
  - The exported source still wins if it arrives.
- **Done on PR #9's branch (9 Nov, approved by Josh):** home-page text at 12 px, link-preview titles that match the page titles on `/` and `/links`, and PR #10's 429 message. `pnpm check:v34` lists these as the only differences from v34.

## Never

- No customer data, tokens or account details in this public repository or its comments.
- No DNS change, deploy to blackglass.co.nz, account creation or spending without Josh's yes for that step.
