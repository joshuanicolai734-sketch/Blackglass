# Blackglass website — source handoff

Source repository: https://github.com/joshuanicolai734-sketch/Blackglass (default branch: `claude/blackglass-domain-migration-0pxc6q`). Live site: https://blackglass.co.nz. This repository imported the exact Sites version 9 source and then continued with newer work. Always check what version Sites is running before assuming a GitHub commit is live.

**Latest live release (28 September 2026, NZ):** Sites version 12 was published from GitHub commit `ead39d2de4eb07a4d9c1b97a0de2a3c3735ab344` (Sites source commit `ca606fa0ebbb1b256054d66e96b0266631de2a43`). Both commits have Git tree `a8a677b0cb29d5bfb190bdf6ae2df603fcabacd4`, so the published source matches the selected GitHub version. Version 11 previously published `be454ff8615af52db1770eeaa64d83abbfb8f41e` (Sites source `7ad2d7e72a26994aa40892b15fde74e25e53e5ec`). Later GitHub commits do not go live until a separate Sites publish. The public domain and `DB` binding were preserved; the `events` migration is present in production.

This repository contains the tracked website source, brand assets, lockfile, migrations, and hosting configuration. It does not contain the production enquiry database, deployment credentials, DNS account access, `.env` files, or installed dependencies.

## Open with Claude Code

1. Clone this repository and open the project folder in your editor or terminal. Continue on its existing default branch or make a feature branch from it; do not replace it with an old ZIP snapshot.
2. Install Node.js 22.13 or newer and pnpm (the project requests pnpm 11.25.0).
3. Run `pnpm install --frozen-lockfile` and then `pnpm dev`.
4. In Claude Code, point it at this folder and say: “Read BLACKGLASS_HANDOFF.md and inspect the existing code. Preserve the Sites deployment and enquiry flow. Tell me your proposed edits, then implement and check the build.”

`pnpm build` checks the production build. `pnpm lint` and `pnpm exec tsc --noEmit` check code quality and types. The root `README.md` describes the underlying Vinext starter and local Cloudflare development setup; this file describes the actual Blackglass implementation.

## Where things live

Start with `docs/MAINTAINING.md` (what to edit for common changes), `docs/DIRECTION.md` (what exists and why the site looks the way it does) and `docs/SEO.md`.

| Area | Files |
| --- | --- |
| Settings: app availability, links, prices, socials, nav, UTMs | `content/site.ts` |
| Questions and answers | `content/faq.ts` |
| Pages | `app/page.tsx` (home), `app/get/`, `app/coaching/`, `app/links/`, `app/privacy/`, `app/not-found.tsx` |
| Shared components | `components/site/` (header, footer, buttons, panes, FAQ, showreel) |
| Design system and page styles | `app/tokens.css`, `app/site.css` (owner inbox styles are in `app/globals.css`) |
| Homepage showreel | `components/site/reel.tsx` + `public/reel.js`; see `docs/MAINTAINING.md` |
| Enhancements: demo, menu, forms, reveals, scroll gauge, measurement | `public/site.js` |
| Logo geometry used by the intro, OG images and social kit | `content/brand.ts` |
| Brand mark, lockup, app screens, fonts, OG images, QR | `public/brand/`, `public/assets/`, `public/fonts/`, `public/og/`, `public/qr/` |
| Enquiry and preview-list endpoint | `app/api/enquiries/route.ts` |
| Daily action counts | `app/api/events/route.ts`, `db/events.ts` |
| Owner inbox, with a 30-day activity view | `app/admin/`, `app/api/admin/enquiries/route.ts` |
| Auth checks and database access | `app/chatgpt-auth.ts`, `db/enquiries.ts`, `db/schema.ts` |
| Database migrations and Sites binding | `drizzle/` (0002 adds `events`), `.openai/hosting.json` |
| Sitemap, robots, redirects | `app/sitemap.ts`, `app/robots.ts`, `next.config.ts` |
| Social launch kit (artwork, captions, schedule) | `social/` (`KIT.md`, `exports/`) |

## Backend and hosting

- The actual owner inbox is https://blackglass.co.nz/admin. It uses Sign in with ChatGPT and accepts Josh's allowed owner account. It displays the most recent 100 enquiries, with status changes and deletion. There is no full content management system or payment checkout yet.
- Coaching enquiries are stored in the live site's Cloudflare D1 database via the `DB` binding. The repository contains table definitions and migrations, **not customer records**. A new local database starts empty. Do not copy personal enquiries into AI tools just to edit site code.
- To exercise the form locally, build and apply `drizzle/0000_lucky_oracle.sql`, `drizzle/0001_panoramic_beyonder.sql` and `drizzle/0002_short_agent_brand.sql` (the `events` table for site counts) in order to the local D1 binding. The root README shows the Wrangler command format; use the actual filenames above. Local preview authentication is a mock and may not match the production owner allowlist.
- The live deployment is owned by the existing Sites project. Pushing to GitHub does **not** automatically update https://blackglass.co.nz. To publish, bring the chosen GitHub commit into the Sites source, run checks and build, save a Sites version, and deploy it. Publishing in Sites does not automatically update this GitHub branch either. Domain DNS remains in the registrar account.
- This GitHub repository is currently **public**. If you want the source, brand assets, and social kit restricted, change its visibility in GitHub settings. Keep this branch as the source for future edits and reconcile changes from the live Sites checkout before publishing; never force-push over work from another editor.

## Product status

The site now leads with the Blackglass Android app, which is in development: its primary action is the Android preview list at /get, a real saved submission. Coaching (NZ$59/week, 12 weeks) is the paid service, with its own page and enquiry form. Website and app do not share accounts, client workouts, subscriptions or payments. Keep that distinction when revising copy or adding a checkout. When a build is downloadable, switch it on in `content/site.ts → app` (see docs/MAINTAINING.md).
