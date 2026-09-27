# Blackglass website — source handoff

Snapshot: live Sites version 9, source commit `1270577f8a82a75271da0f97179dd00fd54ad616` (28 September 2026 NZ time). Public site: https://blackglass.co.nz

This ZIP contains the tracked website source, brand assets, lockfile, migrations, and hosting configuration. It does not contain the production enquiry database, deployment credentials, DNS account access, `.env` files, dependencies, compiled output, or Git history.

## Open with Claude Code

1. Extract the ZIP and open the `blackglass-site` folder in your editor or terminal.
2. Install Node.js 22.13 or newer and pnpm (the project requests pnpm 11.25.0).
3. Run `pnpm install --frozen-lockfile` and then `pnpm dev`.
4. In Claude Code, point it at this folder and say: “Read BLACKGLASS_HANDOFF.md and inspect the existing code. Preserve the Sites deployment and enquiry flow. Tell me your proposed edits, then implement and check the build.”

`pnpm build` checks the production build. `pnpm lint` and `pnpm exec tsc --noEmit` check code quality and types. The included root `README.md` describes the underlying Vinext starter and local Cloudflare development setup; this file describes the actual Blackglass implementation.

## Where things live

Start with `docs/MAINTAINING.md` (what to edit for common changes), `docs/DIRECTION.md` (what exists and why the site looks the way it does) and `docs/SEO.md`.

| Area | Files |
| --- | --- |
| Settings: app availability, links, prices, socials, nav, UTMs | `content/site.ts` |
| Questions and answers | `content/faq.ts` |
| Pages | `app/page.tsx` (home), `app/get/`, `app/coaching/`, `app/links/`, `app/privacy/`, `app/not-found.tsx` |
| Shared components | `components/site/` (header, footer, buttons, panes, FAQ, intro) |
| Design system and page styles | `app/site.css` (owner inbox styles are in `app/globals.css`) |
| Intro sequence | `components/site/intro.tsx` + `intro.js`, gated in `app/layout.tsx` |
| Enhancements: demo, menu, forms, reveals, ambient light, measurement | `public/site.js` |
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
- Coaching enquiries are stored in the live site's Cloudflare D1 database via the `DB` binding. The source archive contains table definitions and migrations, **not customer records**. A new local database starts empty. Do not copy personal enquiries into AI tools just to edit site code.
- To exercise the form locally, build and apply `drizzle/0000_lucky_oracle.sql` and `drizzle/0001_panoramic_beyonder.sql` in order to the local D1 binding. The root README shows the Wrangler command format; use the actual filenames above. Local preview authentication is a mock and may not match the production owner allowlist.
- The live deployment is owned by the existing Sites project. Editing this ZIP in Claude Code does **not** automatically update https://blackglass.co.nz. The edited source must be connected back to that project and published through its build/version flow. Domain DNS remains in the registrar account.
- For long-term collaboration across editors, put the project in a private GitHub repository under an account you control and keep it synced with the Sites project. The ZIP is the portable snapshot; it is not a live Git sync.

## Product status

The site now leads with the Blackglass Android app, which is in development: its primary action is the Android preview list at /get, a real saved submission. Coaching (NZ$59/week, 12 weeks) is the paid service, with its own page and enquiry form. Website and app do not share accounts, client workouts, subscriptions or payments. Keep that distinction when revising copy or adding a checkout. When a build is downloadable, switch it on in `content/site.ts → app` (see docs/MAINTAINING.md).
