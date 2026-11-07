# Hosting on Josh's Cloudflare account

This replaces ChatGPT Sites as the way blackglass.co.nz is published (the plan and order are in `studio/handoffs/2026-11-07-leaving-chatgpt/README.md`). Until the domain moves, the public site stays on ChatGPT Sites and nothing here affects it.

## What the code already does

- **Worker entry** (`worker/index.ts`): Movement Studio clips (`/movements/*.mp4`) reach the Worker first (`assets.run_worker_first`), which answers byte ranges with `206` (`lib/byte-range.ts`). Scrubbing then works in every browser, in-app browsers included, with no service worker. Every other request goes to vinext unchanged.
- **Owner sign-in** (`app/owner-auth.ts`): with `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` set, `/admin` and `/api/admin` accept only a valid Cloudflare Access token. The signature, issuer, audience and expiry are checked in `lib/access-jwt.ts`. The owner list in `db/enquiries.ts` still applies.
  - ChatGPT sign-in headers are trusted only in local development, or with `OWNER_AUTH=chatgpt-sites`.
  - Without either, the owner area stays locked.
- **Account settings come from the environment at build time** (`vite.config.ts`): `D1_DATABASE_NAME`, `D1_DATABASE_ID`, `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`. The repository holds no account ids or keys.

Checks: `pnpm check:hosting` (range and Access-token unit checks), plus the usual `pnpm lint && pnpm exec tsc --noEmit && pnpm build`.

## One-time setup

**Josh, in the Cloudflare dashboard:**
1. Create a free account.
2. Create an API token for Claude: My Profile → API Tokens, using the "Edit Cloudflare Workers" template plus D1 Edit. Give it to Claude only through the secure credential form, never in chat.
3. In Zero Trust:
   - Pick a team name; it becomes the team domain, e.g. `blackglass.cloudflareaccess.com`.
   - Add a **self-hosted application** for the preview host and, later, `blackglass.co.nz`. It covers the paths `/admin` and `/api/admin`.
   - Add an **Allow** policy for Josh's two owner addresses, with the one-time PIN login.
   - Note the application's **AUD tag**.

**Claude, with that token:**
```sh
pnpm exec wrangler d1 create blackglass                 # note the database_id it prints
export D1_DATABASE_NAME=blackglass D1_DATABASE_ID=<id>
export CF_ACCESS_TEAM_DOMAIN=<team>.cloudflareaccess.com CF_ACCESS_AUD=<aud>
pnpm build
pnpm cf:migrate                                         # applies drizzle/ to the remote D1 database
pnpm cf:deploy                                          # publishes to https://blackglass.<account>.workers.dev
```
Then check the preview:
- `verify-staging.mjs <preview> --clip` should report `C7 host answers Range natively: yes`.
- Run the journey checks with synthetic data only.
- One real test enquiry: send it, see it in `/admin`, delete it.
- Josh checks the preview on his phone.

## Moving the domain (only on Josh's approval)

On 7 Nov the domain's nameservers were at Crazy Domains. It had no MX or TXT records, so there's no email or verification to carry over. The root domain and `www` pointed at ChatGPT Sites.
1. Josh adds blackglass.co.nz to Cloudflare (free plan) and sets the two nameservers Cloudflare gives him at Crazy Domains.
2. Claude adds `blackglass.co.nz` and `www.blackglass.co.nz` as custom domains of the Worker. It then sets:
   - a `301` from `www` to the apex;
   - "Always Use HTTPS", which gives a `301` from `http`.
3. Add the custom domain to the Access application.
4. Claude runs `verify-staging.mjs https://blackglass.co.nz --clip` and the journey checks against the public domain.

**Rollback:** at Crazy Domains, set the nameservers back to `ns1.crazydomains.com` and `ns2.crazydomains.com`. The ChatGPT Sites records (apex A records, `www` CNAME to `custom-domains.chatgpt.site`) stay there until ChatGPT is cancelled.

## Enquiries

The old enquiries stay in the CSV Josh downloads from ChatGPT. The new inbox starts empty. Importing the old rows is optional and Josh's call: D1 → Console, using an SQL file he makes from the CSV. No agent handles that data, and it never goes to GitHub.

## Cost

The free plans cover this site. Claude checks the current limits when setting up, and asks before anything that would cost money.
