# Blackglass product requirements and acceptance brief

**Prepared:** 7 November 2026

> **Note, 8 November 2026 (Claude lead):** §10 and §11 describe the older GitHub source (v16). The live site is Sites v34, with a lime signal, the headline "One session. Then the next." and a brand intro on `/`. Its source is on PR #9. See the note at the top of `docs/CLAUDE_HANDOVER.md`.

Status labels:
- **Verified present** means current repository documentation or visible product evidence supports it. Re-test before calling it release-ready.
- **Requested requirement** means a feature or quality bar captured from product conversations. It is not proof the current code implements it.
- **Open decision** means scope or product behaviour still needs confirmation.

## 1. Product principles

- Make training more deliberate, structured and repeatable.
- Put a person's next useful action in front of them quickly.
- Make workouts resilient to interruptions, missed taps, loss of connection and app restarts.
- Treat workout, nutrition, coaching and preview-list data as real user data, not disposable demo content.
- Make a good baseline path obvious. Advanced controls must not block starting.
- Use authentic product evidence and truthful marketing. No invented testimonials, results, qualifications, user counts or feature claims.
- Visual ambition is high, but stability, readability, ergonomics, accessibility and data integrity are release gates.

## 2. Verified current prototype surface

The website's tracked screen captures document these app surfaces:

### Today
Shown: session in progress, Resume workout, Preview session, calorie and protein targets, Log food, and Quick meal estimate & log.

### Train
Shown: active programme, a six-day split, and Plan, Library, Build, Generate and Forge tabs.

### Exercise guide
Shown: animated movement with Brace, Reach and Return phases; Muscles and My record tabs; Add to my program.

### Navigation
Today, Train, Fuel, Progress and More.

These descriptions document what appears in tracked captures, not proof every underlying workflow is robust or production-ready. The semantics of Progress, Generate and Forge require source inspection and user confirmation.

## 3. Workout programme builder

**Status: requested requirements; verify individually against the current 89.0 source.**

- Search for multiple exercises and select more than one before confirming selection.
- Show exercises in an editable list with sets, reps and rest accessible inline.
- Reorder exercises deliberately.
- Create a superset/grouping and make it visually obvious.
- Show muscle-volume distribution for the draft programme, with the calculation definition documented.
- Save a draft, leave the builder and return later without losing it.
- Reopen a saved draft and continue editing.
- Start a session from the programme while preserving the relationship between programme and session.

Acceptance:
- Selecting several exercises adds each chosen exercise once and in the intended order.
- Inline changes survive navigation away and back.
- Reordering and grouping are reflected in the final session order.
- Volume is not presented as a medical or precision biomechanical measurement.
- An invalid draft explains what needs attention without silently discarding it.
- Starting a session is explicit and does not overwrite another active workout unexpectedly.

## 4. Workout execution / active session

**Status: requested requirements; some session-in-progress and Resume workout UI is visible in the website's app captures. Verify runtime behaviour.**

- Review previous results where useful before or during a set.
- Enter a set result quickly with reliable touch targets.
- Recover from accidental entry by correcting or undoing the last set.
- Start/use a rest timer, with an obvious way to dismiss or adjust it.
- Substitute an exercise without losing completed sets or corrupting the session.
- Leave and resume a workout.
- Survive backgrounding, process death or device restart without losing the latest committed set.
- Finish with a clear summary and safe handling of partial/incomplete workouts.

Acceptance:
- A set is not duplicated by rapid taps, reconnect retries or app resume.
- A bad entry can be corrected without clearing unrelated data.
- Timer, selected exercise and session position remain understandable after resume.
- Substitution preserves history and visibly explains what changed.
- Finishing is explicit; incomplete sessions remain recoverable or are clearly marked partial.
- Test normal flow, accidental input, back navigation, background/resume, process restart and low/absent network if network-backed data is involved.

## 5. Onboarding and first-use experience

**Status: requested requirements.**

- Keep onboarding concise and skippable.
- Explain the distinction between using the app and receiving direct coaching.
- Provide a clear first action that can be completed immediately.
- Offer a sensible starting programme without forcing long setup before exploration.
- Make empty states intentional: show the next action and a useful example/template where appropriate.
- Returning users should resume their current state rather than repeating onboarding.
- Ask only for data needed for the next step and explain why personal fields are needed.

Acceptance:
- A new user can skip optional onboarding and still reach a meaningful first action.
- A returning user reaches their current state.
- Empty Today, Train, Fuel and Progress states have useful guidance and no dead-end buttons.
- Coaching is presented as a separate service, not required to use the app.
- Errors and permission denials explain recovery without blaming the user.

## 6. Reliability across a week of use

**Status: requested requirements; architecture is an open decision until source is inspected.**

- Preserve latest saved state across repeat visits.
- Support offline work if the product surface claims it; queue local changes safely and synchronise on reconnection.
- Handle process death and reconnect without losing committed entries.
- Make pending sync visible when it affects user confidence.
- Avoid duplicate writes, stale overwrites and confusing conflict resolution.
- Keep local state distinct from future server sync or coaching accounts until an approved architecture defines otherwise.

Acceptance:
- Test offline/online, delayed network, repeated requests, termination while editing and restore after launch.
- Define conflict behaviour for edits on two devices before implementing cross-device sync.
- Protect retries with idempotency or equivalent.
- Never claim cloud backup when data is local only.
- Do not create a PWA/server-sync architecture merely because “offline” appears in this brief; first confirm intended scope and data model.

## 7. Coach/client workflows

**Status: requested requirements, not confirmed production-ready. The 89.0 build documentation describes local client profiles and prototype coach-code/billing entitlements.**

Desired direction:
- Coach invitation and client approval.
- Clear invitation state and accept/decline path.
- Read states for shared programme or message/attachment material.
- Attachments with safe file handling and clear ownership.
- A “Today” module or shared daily view showing the next relevant action.

Acceptance:
- A user cannot access another user's records by guessing an ID.
- Invitation and approval states are explicit and recoverable.
- Read states are tied to the intended user and item.
- Attachments have size/type limits, safe display/download and failure paths.
- Scope identity, coaching data and entitlements before connecting app to website/payments/backend.
- Keep prototype entitlements labelled as prototypes until real billing/authorisation is designed and verified.

## 8. Training analytics and exercise content

**Status: mixed.** The app prototype visibly contains a movement guide; specific tools below are requested features and must be verified.

Requested tools:
- RPE and tempo support.
- Plate calculator.
- One-rep-max (1RM) estimate.
- Warm-up generator.
- Muscle-volume distribution.
- Rest timer.
- Movement phase labels and prior-session context.
- Exercise substitution that preserves programme/session integrity.
- Robust animated exercise demonstrations.

### Movement animation QA

A conversation brief requested replacing remaining older-style exercise animations with a newer movement-figure style. The exploration described a sleek synthetic figure, bright pink/blue future palette, neon-green accents and a holographic/horn-like silhouette. Confirm whether this remains the accepted direction and which surface it applies to before a sweeping redesign.

For each exercise, inspect:
- correct exercise/equipment pairing;
- opening and closing poses;
- feet/hands maintaining contact with floor, bench, bar or equipment;
- no skating, floating, clipping, implausible grips or body collisions;
- joint ranges and movement direction;
- bar/load path and phase timing;
- alternate camera views;
- normal and reduced playback speeds;
- pause, replay, phase jump and scrubbing;
- static fallback when motion is disabled or fails.

Do not claim movement art is personalised coaching, form assessment or measured muscle activation. Rendering quality alone is not enough.

## 9. Nutrition and daily planning

**Status: food logging, calorie/protein targets and quick meal estimate/log appear in existing screen captures. Verify behaviour in current source.**

Desired direction:
- Daily calorie and protein targets.
- Log food and estimate a quick meal.
- Food database/search where available.
- Preserve drafts and avoid duplicate meals after retries/resume.
- Distinguish estimates from measured/labelled nutrition.
- Allow correction without losing unrelated entries.

Acceptance should include empty day, duplicate tap, estimate correction, date/time-zone boundary and local persistence. Do not position calorie estimates as exact measurements.

## 10. Website requirements

**Status: the current repository documents these as implemented; re-test before release.**

### Primary user job
Understand the product and choose between Android preview list and direct coaching. Show real product evidence early. Keep both paths truthful and distinct.

### Existing routes
- Home: “Know what today asks of you.” with real app screenshots and showreel.
- /get: truthful Android preview-list flow until a real public link is enabled.
- /coaching: coaching details and enquiry form.
- /links: link in bio.
- /privacy: privacy notice.
- /movements: authored artwork browser previews, not the live app.
- /admin: owner-only enquiry inbox and daily activity/funnel review.

### Copy and conversion rules
- Current website source sets coaching to NZ$59/week for 12 weeks (NZ$708) and enables the offer.
- Do not add social accounts unless the exact profile is verified.
- Never fabricate scarcity, results, testimonials, user counts or qualifications.
- Distinguish button taps from completed server-side submissions; distinguish preview list from installation.
- No payment checkout or shared app/site account system is documented as implemented.
- Verify mobile, no-JavaScript, reduced-motion, validation and failure paths, not only the happy path.

### Engineering safeguards
- Preserve live D1 binding, existing enquiries and migration order.
- Keep measurement cookie-free; don't add invasive tracking casually.
- Root README, AGENTS.md, BLACKGLASS_HANDOFF.md and docs/PUBLISHING.md define the publishing boundary.
- GitHub changes are not live until separately published through the existing Sites project and confirmed.
- Public repository: never commit customer records, secrets, keys, personal training/financial records, private previews or raw conversation history.

## 11. Design system and experience quality bar

### Website design in current source
- Poster-black, warm bone and crimson signal; authoritative tokens are in app/tokens.css.
- Inter Tight for display/body and Geist Mono for labels/data.
- Actual logo geometry and real app captures, not substitute logos or tinted screenshots.
- Strong negative space, concise labels, purposeful pane/facet forms and editorial hierarchy.
- Current calm motion direction has no content entrance animation on load/scroll. Motion is concentrated in the showreel and direct control responses.
- Reduced-motion and no-JavaScript paths remain complete.

### Product design quality
- Consistent touch targets, keyboard support and accessible labels.
- Obvious primary action, recoverable errors and no dead-end empty states.
- Readable under font scaling and on small phones.
- Stable first frame; no layout shifts while assets load.
- Motion answers user intent.
- Clear saved, pending, failed and completed states.
- Polish the full interaction, not only screenshots.

## 12. Reliability, privacy and security

For changes affecting persistent data, account access, sync or coach/client data, require:
- documented data model and ownership;
- boundary input validation;
- duplicate/retry safety;
- explicit offline/error/conflict behaviour;
- privacy-minimising logs and synthetic test data;
- regression tests for existing flows;
- migration/rollback plan if schema changes;
- statement of what was not tested.

Never fetch live customer enquiry data into AI context just to edit code. Never add real user food/training/client data to fixtures. Keep production/release signing keys out of the repo.

## 13. Suggested prioritisation

Do not implement everything at once. After source reconciliation, use one bounded task and independent review.

1. **Source/release reconciliation:** current GitHub head, current live Sites version and available Android source; record exact evidence.
2. **Core workout reliability:** start/resume session, record a set and recover accidental input without data loss.
3. **Programme-builder completion:** exercise selection, inline editing, order/groups, draft persistence and session start.
4. **Week-of-use resilience:** offline, retry/idempotency and process-death tests for the confirmed data architecture.
5. **Coach/client scope:** only after identity, privacy, data ownership and entitlements are explicit.
6. **Movement/content QA:** fix contact, clipping, phase, controls and reduced-motion defects before global style polish.
7. **Website-to-preview-list friction:** only after confirming current live path and measurement.

Change this order if fresh evidence reveals a release blocker. Finish one journey end-to-end rather than starting multiple partial features.

## 14. Definition of done

For each feature, record:
- user problem and scope;
- source paths and base commit;
- expected state transitions and failure cases;
- tests and results;
- screenshots/device/browser matrix where relevant;
- accessibility/reduced-motion result;
- data/migration implications;
- known limitations and explicit untested states;
- independent reviewer feedback.

Separate **implemented**, **automated-tested**, **browser-reviewed**, **real-device-tested**, and **published**. Do not compress these into a vague “complete”.
