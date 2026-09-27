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

| Area | Files |
| --- | --- |
| Landing content, copy, splash markup | `app/landing-source.html` |
| Generated markup consumed by the home page | `app/landing-markup.ts` — regenerate after editing the HTML with `node scripts/generate-landing-markup.mjs` |
| Styling, splash sequence, responsive design | `app/globals.css` |
| Intro skip/timing, page interactions, lead-form behavior | `public/site.js` |
| Intro prepaint gate, SEO metadata | `app/layout.tsx` |
| Home page and client script mounting | `app/page.tsx`, `app/site-effects.tsx` |
| Brand mark and app screenshots | `public/brand/`, `public/assets/` |
| Lead form endpoint | `app/api/enquiries/route.ts` |
| Owner inbox and its status/delete endpoint | `app/admin/`, `app/api/admin/enquiries/route.ts` |
| Auth checks and database access | `app/chatgpt-auth.ts`, `db/enquiries.ts`, `db/schema.ts` |
| Database migrations and Sites binding | `drizzle/`, `.openai/hosting.json` |

## Backend and hosting

- The actual owner inbox is https://blackglass.co.nz/admin. It uses Sign in with ChatGPT and accepts Josh's allowed owner account. It displays the most recent 100 enquiries, with status changes and deletion. There is no full content management system or payment checkout yet.
- Coaching enquiries are stored in the live site's Cloudflare D1 database via the `DB` binding. The source archive contains table definitions and migrations, **not customer records**. A new local database starts empty. Do not copy personal enquiries into AI tools just to edit site code.
- To exercise the form locally, build and apply `drizzle/0000_lucky_oracle.sql` and `drizzle/0001_panoramic_beyonder.sql` in order to the local D1 binding. The root README shows the Wrangler command format; use the actual filenames above. Local preview authentication is a mock and may not match the production owner allowlist.
- The live deployment is owned by the existing Sites project. Editing this ZIP in Claude Code does **not** automatically update https://blackglass.co.nz. The edited source must be connected back to that project and published through its build/version flow. Domain DNS remains in the registrar account.
- For long-term collaboration across editors, put the project in a private GitHub repository under an account you control and keep it synced with the Sites project. The ZIP is the portable snapshot; it is not a live Git sync.

## Product status

The site currently sells a conversation about coaching, with a founding coaching offer and an enquiry form. The Android app section is a preview of an app in development; website and app do not currently share accounts, client workouts, subscriptions, or payments. Preserve that distinction when revising copy or adding a checkout.
