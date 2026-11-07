# Blackglass: handover for Claude

**Prepared:** 7 November 2026  
**Purpose:** Transfer the app, website, design and delivery context into the repository so a new Claude session can continue without relying on old chat history.

## Start here

Read in this order:

1. Root CLAUDE.md and AGENTS.md for agent rules.
2. This file for the cross-product handover.
3. docs/PRODUCT_REQUIREMENTS.md for product intent and acceptance criteria.
4. BLACKGLASS_HANDOFF.md for website source and deployment details.
5. docs/DIRECTION.md, docs/MAINTAINING.md, docs/PUBLISHING.md, docs/FUNNEL.md, docs/MOVEMENT_STUDIO.md and docs/APP_V88_DESIGN_INTEGRATION.md as relevant.
6. studio/collaboration/README.md and studio/collaboration/CURRENT_STATE.md before shared or parallel work.

This handover synthesises product context remembered from conversations and repository documents available on 7 November 2026. It is not proof that every feature below exists in the current build, that the current live deployment matches GitHub, or that the private Android source bundle is present in this repository. Reconfirm current source, device and deployment state before making those claims.

## 1. Product in one paragraph

Blackglass is a training product with two deliberately separate paths: an Android training app in development, and a paid coaching service with Josh. The app aims to make training execution clear and repeatable through programme planning, workout execution, movement guidance, nutrition logging and progress context. The website is the public trust and acquisition layer: show real product evidence, let people join the Android preview list, and give people who need direct help a truthful route to coaching. Do not imply the app is publicly downloadable, that an iPhone/web app exists, or that site and app accounts, payments, subscriptions or training records are shared unless that changes in verified source.

Brand sign-off: **Train with intent.**  
Current website hero line documented in source: **Know what today asks of you.**

## 2. Repository and source boundaries

- GitHub repository: https://github.com/joshuanicolai734-sketch/Blackglass
- Default branch observed: claude/blackglass-domain-migration-0pxc6q
- Public website: https://blackglass.co.nz
- This repository is currently public.
- Website source uses a Vinext/Vite + React/TypeScript stack, Cloudflare-compatible runtime and D1 database with Drizzle migrations.
- The complete Android 89.0 source project and development APK were supplied separately; they are not committed to this public website repository.
- GitHub and the hosted ChatGPT Sites project have separate source histories. A GitHub commit does not publish the live domain. A Sites publish does not necessarily update this repository.
- Never replace the repository with an old ZIP export, overwrite newer private preview work, or assume the website and native app are a single codebase.

### Evidence hierarchy

When sources disagree, reconcile them in this order and describe any gap:

1. Actual current source tree and tests at the exact Git ref being edited.
2. Current live Sites version and deployment evidence, checked separately.
3. Current native Android source/build and real-device evidence, checked separately.
4. Existing docs and historical release notes.
5. Older chat notes and concepts.

A historical brief is useful context, not permission to undo later decisions. Never let this document override a newer explicit product decision or the working code.

## 3. Status snapshot

### Website

The handoff document records Sites version 16 as published on 30 September 2026 NZ time, with merged Git commit b873? No: use the exact deployed-source details in BLACKGLASS_HANDOFF.md before publishing. The documented release commit is deb4a6bb2d006ca2acad6cf3ceac25429a1870bf and the deployment was recorded as successful. This is the last documented release in files inspected, not a claim the live site has not changed since then. Verify the current Sites release before describing or publishing the live site.

Main routes and responsibilities:

- Home: product promise, real app screens, showreel and two clear paths.
- /get: app availability and Android preview-list submission.
- /coaching: coaching offer and real enquiry form.
- /links: link-in-bio destination.
- /privacy: privacy notice.
- /movements: browser previews of authored movement artwork exported from Android asset packs. This does not run the app or validate a visitor's form.
- /admin: owner-only enquiry inbox and a 30-day activity/funnel view.

The website settings are in content/site.ts; FAQs are in content/faq.ts. Enquiries and preview-list entries are written to the hosted Cloudflare D1 database. Do not pull or publish customer records. Cookie-free daily action counts live in the existing events system; preserve the DB binding and existing migrations unless a separately reviewed schema change is required.

### Android

The repository documents a reconstructed Java source project and development build named 89.0-source, built from source rather than a patched baseline DEX.

- Application ID: app.forge.obsidia2.refined
- Source namespace: app.forge.obsidia2.hardline
- Version code/name: 900 / 89.0-source
- Minimum SDK 23; target/compile SDK 35.
- The source package contains 460 Java files, resources, 108 S3D movement packs, food data, build scripts and rig/render tooling.
- Documented deliverables were supplied separately; the APK and source archive are not present in this public repository.
- Reported source/build/portable numerical checks passed, including 248,164 assertions and APK/package/signature checks.
- Phone installation, native screen and accessibility review, lifecycle/reduced-motion checks and real-device frame pacing were still outstanding in the handoff. Do not claim native visual QA or release readiness without new evidence.
- 89.0 uses a new development signing certificate. The prior handoff notes a fresh install is required to install this development build over older signed builds. Do not include release signing keys in source control.
- Accounts, workout/food records and client profiles are local in the current prototype; billing and coach-code entitlements are prototype implementations. Website and app do not share accounts or data.

The last documented public app availability remains Android preview list only, with no public download URL. There is no iPhone app or public web app in the verified website settings. Check content/site.ts before changing claims or enabling downloads.

## 4. Commercial and user journey

### Website offer and journey

Current source settings define coaching as available, NZ$59 per week for 12 weeks, a total of NZ$708 (founding coaching offer). This is the paid service currently offered on the website; the Android app has no public price or download URL.

The intended journey is:

1. Explain what Blackglass is using real product evidence.
2. Let a visitor explore how the product works.
3. Send app-curious people to /get to join the preview list.
4. Give visitors who want direct support a separate coaching route.
5. Measure taps separately from successful submissions. A tap is not a signup; a signup is not an install.

Do not invent scarcity, testimonials, client results, qualifications, social handles, app pricing or user counts. No payment is taken on the current website. Do not claim the website coaching funnel and in-app coaching/entitlement features are integrated.

### App's product shape

Visible app screen captures in public/assets document these parts of the prototype:

- Today: session in progress, Resume workout, Preview session, calorie/protein targets, food logging and Quick meal estimate/log.
- Train: active programme and six-day split; Plan, Library, Build, Generate and Forge tabs are shown.
- Exercise guide: animated movement with Brace, Reach and Return phases, Muscles/My record tabs, and an add-to-program action.
- Navigation includes Today, Train, Fuel, Progress and More.

Those captures prove only the visible UI. Do not infer the unverified behaviour of Progress, Generate, Forge, billing, coaching entitlements or other screens from names alone. Some requirements in the accompanying product brief are future acceptance targets and must be checked against code before being marked done.

## 5. Design direction

### Website: use the current implemented direction, not an old mood-board

The current tracked website direction is the crimson-horizon poster system. app/tokens.css is the source of truth for implemented design tokens; design/DESIGN_LANGUAGE.md explains how the visual direction evolved.

- Ground: poster-black / dark glass, documented as #0B0D0E in the current website direction.
- Primary signal: crimson #F43F46; deeper red #B72F36 is a tonal variation.
- Counter-surface: warm bone / Paper.
- Keep the logo geometry, Inter Tight display/body face and Geist Mono for labels/data. The wordmark is the actual artwork, not typed text or a replacement logo.
- Real app screenshots stay unfiltered; graphic elements are not evidence of product functionality.
- Give the product real screen space early, use generous negative space, factual labels and deliberate editorial typography.
- Keep the distinction between app preview and paid coaching obvious.
- The calm pass intentionally removed scroll reveals and ornamental entrance animations. Don't reintroduce fade-in-on-scroll, word reveals or animated section entrances. Most motion belongs in the showreel or in a response to a real user action.
- All motion must respect reduced motion and work usefully without JavaScript.
- Crimson on Glass can be used for primary actions; don't use low-contrast crimson as long body text on Paper.
- Prefer useful, precise UI over decorative cards or invented metrics.

### Native app and movement-art direction

The mobile app must share a coherent brand system, but do not globally replace the website palette because of one animation concept. A conversation brief for exercise illustrations requested a sleek synthetic figure with a bright pink/blue future aesthetic, neon-green accents and a holographic/horn-like silhouette treatment. Treat that as a movement-art exploration, not a verified global brand decision; reconcile it against current source and approved scope before applying it everywhere.

Movement quality is not just colour or rendering polish. Inspect exercise/equipment pairing, opening posture, joint ranges, stable foot/hand contacts, grip, collisions, load/bar path, looping and phase timing from both views. Do not present illustrative assets as personalised form assessment or measured muscle activation.

## 6. Technical map

Use docs/MAINTAINING.md for details. Frequently touched paths:

- content/site.ts: app availability, prices, links, contact, socials, nav and campaign/QR settings.
- content/faq.ts: FAQ content.
- app/page.tsx: homepage copy and demo.
- app/get/, app/coaching/, app/links/, app/privacy/: public pages.
- app/movements/, components/site/movement-studio.tsx, content/movements.ts, public/movements/: movement-preview page.
- components/site/: shared website header/footer/buttons/panes/showreel.
- app/tokens.css, app/site.css: tokens and site styles.
- components/site/reel.tsx, public/reel.js: homepage showreel. Keep pose logic aligned as documented.
- public/site.js: interaction enhancements, mobile menu, demo helpers, scroll-gauge behaviour and measurement.
- app/api/enquiries/route.ts: preview-list and coaching-enquiry submissions.
- app/api/events/route.ts, db/events.ts: cookie-free daily action counts.
- app/admin/, app/api/admin/enquiries/route.ts: owner inbox.
- db/schema.ts, db/enquiries.ts, drizzle/: D1 schema and migrations.
- .openai/hosting.json: hosting/binding configuration.
- social/: launch kit artwork, captions and schedule.
- design/: design language, authored frames and verification captures.
- studio/collaboration/: shared-agent protocol and templates.

### Local website development

Requirements documented in the repository:

- Node.js >=22.13.0
- pnpm 11.25.0 from package metadata

Typical checks:

- pnpm install --frozen-lockfile
- pnpm dev
- pnpm lint
- pnpm exec tsc --noEmit
- pnpm build

Use the repo's existing install/runtime scripts and docs/PUBLISHING.md if the environment requires the Sites-specific profile. Don't run overlapping dependency installers. Do not commit .sites-runtime/, .wrangler/, .env files, secrets or generated local state.

### Publishing rules

- A push or merge to GitHub does not publish blackglass.co.nz.
- A reviewed source ref must be reconciled with the live Sites version before publishing.
- Build and run checks, inspect mobile layout, navigation, lead forms, motion/reduced-motion behaviour and any migrations.
- Preserve the existing domain, D1 binding and production records.
- Publish via the existing Sites project only after explicit release intent and review. Record both GitHub SHA and Sites version/deployment in the handoff.
- DNS was previously managed through the registrar account; verify the actual current setup rather than guessing.

## 7. Product and quality principles

1. Truthful product claims: show what exists; label prototypes and previews honestly.
2. Reliable daily use: preserve session drafts and make accidental actions recoverable.
3. Accessible, usable motion: stable first frame, clear controls, readable normal/reduced-speed states, pause/replay and reduced-motion support.
4. Data integrity: never lose completed sets or duplicate actions after reconnect; avoid destructive edits without undo/confirmation.
5. Clear separation: public website, preview-list data, native app data, coaching leads, app subscription ideas and production hosting are separate until a deliberate architecture change says otherwise.
6. Evidence over claims: tests are not device validation; an export is not a real app screen; a visual review is not biomechanics validation.
7. No regressions to working infrastructure: especially database bindings, existing customer data, authentication, domain routing, responsive layout and no-JavaScript paths.
8. Polished does not mean busy: a clean user-facing path beats more decoration, settings or feature claims.

## 8. Collaboration protocol

GitHub is the shared review surface, not automatic agent-to-agent orchestration.

- Josh owns product direction and commercial/security approvals.
- Choose one accountable implementer and a separate reviewer for each substantial task.
- Use a scoped issue, a short branch, a draft PR and an evidence-based handoff.
- Keep parallel branches/worktrees separate, with clear file ownership. Do not edit the same checkout concurrently.
- Review current source before relying on archived references.
- A second agent agreeing does not count as independent review.
- Never commit private preview assets, customer enquiry records, personal training/financial records, signing keys, tokens, .env values or raw private conversations.
- This repository is public. Personal financial targets and private commercial strategy have intentionally not been copied into it. If those need to be available to Claude, first choose an appropriately private destination rather than committing them here.

## 9. Recommended first Claude session

Start read-only. Do not begin with a redesign.

Ask Claude to produce a concise source-reconciliation report with these columns:

- Surface (website, Android source, public deployment, private preview if owner-provided).
- Exact ref/version and evidence actually inspected.
- What is verified working.
- What is required but unverified.
- Divergence or risk.
- The single best bounded next action.

The report should explicitly verify the current GitHub head, current Sites deployment, whether the private 89.0 source bundle is locally available, and the native phone-review gates. Don't claim access to a private preview or external agent unless it has actually been provided and connected.

After reconciliation, choose one small user journey to improve and agree acceptance criteria before parallel implementation. Suggested candidates: workout-run recovery/undo; programme-builder completion; or a friction audit of the website-to-preview-list journey. Choose based on fresh evidence, not preference alone.

## 10. Explicit unknowns to resolve

- What is the exact current live Sites version and deployment as of the next release?
- Is the complete 89.0 Android source bundle still available in the owner's working environment, and what files have changed since the handoff?
- Which product requirements in docs/PRODUCT_REQUIREMENTS.md have been implemented, tested, or superseded?
- Have native installation, accessibility, movement playback and lifecycle/reduced-motion behaviours been tested on a real Android handset?
- What is the approved current movement-figure visual direction, and does it apply only to exercise previews or to more of the app?
- Are app subscriptions, coach/client entitlements, offline sync and a web/PWA surface future work or still out of scope? Do not make an architecture commitment until Josh decides.
