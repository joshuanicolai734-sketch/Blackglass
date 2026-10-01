# Instructions for coding agents (Codex, Claude Code and others)

Read `BLACKGLASS_HANDOFF.md` first, then `docs/MAINTAINING.md` and `docs/PUBLISHING.md`. `docs/DIRECTION.md` explains what the product is and why the site looks as it does.

## Ground rules

- **Branch:** work on `claude/blackglass-domain-migration-0pxc6q` (the default) or a branch made from it. Never force-push, and don't replace the source with an old ZIP snapshot.
- **Deploying:** pushing to GitHub does not deploy. The live site is published from the ChatGPT Sites project (see the handoff).
- **Settings:** app availability, links, prices, social accounts and campaign links live in `content/site.ts`, and questions and answers in `content/faq.ts`. Change them there, not in page files.
- **Claims:**
  - The Android app is in development with no public download, and there is no iPhone app. Don't imply otherwise until `content/site.ts → app` has a real link.
  - Only describe features visible in `public/assets/` screens.
  - Don't invent testimonials, results, user numbers, qualifications or social handles.
- **Design:** use the tokens and components in `app/site.css` and `components/site/`. Crimson (`#F43F46`) is the signal for primary actions, small markers and restrained poster forms. Motion must honour reduced motion and work without JavaScript.
- **Privacy:** don't copy enquiry data from the live database into tools or commits. Site measurement stays cookie-free daily counts (`db/events.ts`).

## Before committing

```sh
pnpm lint && pnpm exec tsc --noEmit && pnpm build
```

For schema changes, edit `db/schema.ts`, run `pnpm db:generate`, and commit the new `drizzle/` file. For the social kit, see `social/README.md`.

## Parallel collaboration

Before starting a shared task, read `studio/collaboration/README.md` and `studio/collaboration/CURRENT_STATE.md`. Use a scoped issue, separate branch/worktree and independent evidence-based review. Confirm current source and approved task direction before relying on historical release or palette descriptions above. Never copy private preview data/assets into this public repository. GitHub collaboration does not automatically connect external agents or deploy Sites.
