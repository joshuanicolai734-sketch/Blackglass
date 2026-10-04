# Instructions for coding agents (Codex, Claude Code and others)

Read `BLACKGLASS_HANDOFF.md` and `studio/collaboration/CURRENT_STATE.md` first, then `docs/MAINTAINING.md` and `docs/PUBLISHING.md`. The dated current-state map separates this public checkout from newer external review work; historical release notes are not the current build brief. `docs/DIRECTION.md` explains what the product is and why the site looks as it does.

## Ground rules

- **Branch:** verify the exact source, branch, commit and approved task before editing. The default is `claude/blackglass-domain-migration-0pxc6q`; use a scoped branch from the agreed base. Preserve existing local work. Never force-push or replace any source with an old ZIP snapshot.
- **Deploying:** pushing to GitHub does not deploy. The live site is published from the ChatGPT Sites project (see the handoff).
- **Settings:** app availability, links, prices, social accounts and campaign links live in `content/site.ts`, and questions and answers in `content/faq.ts`. Change them there, not in page files.
- **Claims:**
  - The Android app is in development with no public download, and there is no iPhone app. Don't imply otherwise until `content/site.ts → app` has a real link.
  - Only describe features visible in `public/assets/` screens.
  - Don't invent testimonials, results, user numbers, qualifications or social handles.
- **Design:** start with the selected source's tokens and components; `app/site.css` and `components/site/` describe this GitHub baseline. Its crimson (`#F43F46`) signal is historical source context, not a requirement to revert newer lime/pink/cyan work. Follow the approved task brief and [design guidance](studio/DESIGN_SYSTEM.md): bold light/dark contrast, clean future-fitness direction, precise typography and authored motion. Preserve reduced-motion behavior and relevant no-JavaScript fallbacks. New design proposals are not implementation approval.
- **Privacy:** don't copy enquiry data from the live database into tools or commits. Site measurement stays cookie-free daily counts (`db/events.ts`).

## Before committing

```sh
pnpm lint && pnpm exec tsc --noEmit && pnpm build
```

For schema changes, edit `db/schema.ts`, run `pnpm db:generate`, and commit the new `drizzle/` file. For the social kit, see `social/README.md`.

## Parallel collaboration

Before starting a shared task, read `studio/collaboration/README.md` and `studio/collaboration/CURRENT_STATE.md`. Use a scoped issue, separate branch/worktree and independent evidence-based review. Confirm current source and approved task direction before relying on historical release or palette descriptions above. Never copy private preview data/assets into this public repository. GitHub collaboration does not automatically connect external agents or deploy Sites.

For substantial product, design or engineering work, also read:
- [Blackglass product intent](studio/BLACKGLASS.md)
- [Product principles](studio/PRODUCT_PRINCIPLES.md)
- [Design guidance](studio/DESIGN_SYSTEM.md)
- [Motion guidance](studio/MOTION_SYSTEM.md)
- The approved task brief, linked from its issue

The collaboration guide defines the intended roles: Gamma for creative direction and final visual review, Codex for production engineering, Claude for independent critique/QA, with Replit inactive at Josh's request from 4 October 2026. Do not assign or reconnect Replit; retain its historical source evidence. An assignment is not an account connection or permission to invoke another agent. Use a stable `BG-###` task ID and a separate GitHub issue URL. Preserve issue #7 as the read-only source-reconciliation prerequisite; `BG-001` Exercise Player V2 remains a planned implementation rehearsal.
