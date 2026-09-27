# Blackglass launch kit

Prepared for review. Nothing here has been published, and no social accounts exist yet (see "Before you post").

- **Artwork:** `exports/` (PNG stills 1080×1350, carousels as numbered slides, MP4 videos 1080×1920).
- **Editable sources:** `assets.mjs` (copy and layout) and `lib.mjs` (shared design system). Re-render with `node render.mjs` (see `README.md`).
- **Specs checked September 2026.**
  - Instagram and Facebook feed and carousels: 1080×1350 (4:5), with key content inside the central 3:4 area the profile grid shows.
  - Reels, TikTok and YouTube Shorts: 1080×1920 (9:16), H.264 MP4, 30 fps. Text sits inside the safe area (clear of the top ~180 px, the bottom ~360 px and the right-hand action column).
- **Audio:** the videos have no soundtrack. Add a track from each platform's licensed library if you want one, keeping it low; every message is on screen.

## Before you post

1. **Create the accounts.** Choose one handle and use it everywhere (for example `@blackglass.nz`). Then add each profile URL to `content/site.ts → social`, so the site links to it. Until then the site shows no social links.
2. **Set the profile image:** `exports/profile/blackglass-profile-1080.png` (the mark, circle-safe).
3. **Set the bio link** to the matching URL below, so visits are counted by source on the owner page.

## Links and UTM scheme

`utm_source` = platform · `utm_medium` = `bio` | `social` · `utm_campaign` = `launch_2026` · `utm_content` = post id.

| Where | URL |
|---|---|
| Instagram bio | `https://blackglass.co.nz/links?utm_source=instagram&utm_medium=bio&utm_campaign=launch_2026` |
| TikTok bio | `https://blackglass.co.nz/links?utm_source=tiktok&utm_medium=bio&utm_campaign=launch_2026` |
| YouTube channel link | `https://blackglass.co.nz/links?utm_source=youtube&utm_medium=bio&utm_campaign=launch_2026` |
| Facebook page button | `https://blackglass.co.nz/get?utm_source=facebook&utm_medium=bio&utm_campaign=launch_2026` |
| Link inside a Facebook post or YouTube description | `https://blackglass.co.nz/get?utm_source=<platform>&utm_medium=social&utm_campaign=launch_2026&utm_content=<post id>` |

Instagram and TikTok captions can't carry links, so those posts say "link in bio". Campaign links skip the site intro and land directly on the page.

## Profile bios

- **Instagram (150 max):** `Training, technique and food in one Android app. Built in Dunedin, NZ. App in development: join the preview list ↓`
- **TikTok (80 max):** `Training, technique and food in one Android app. Built in Dunedin.`
- **YouTube:** `Blackglass is an Android training app built in Dunedin, New Zealand. It keeps your programme, today's session, movement guides and food targets in one place. It's in development: join the preview list at blackglass.co.nz/get. Coaching with Josh is open now.`
- **Facebook (About):** `Blackglass keeps your programme, today's session, movement guides and food targets in one Android app. Built in Dunedin. The app is in development; join the free preview list at blackglass.co.nz/get. 12-week coaching with Josh is available now.`

## Pinned introduction

Pin **P01** on Instagram (with P02 as the second pin once posted) and **V1** on TikTok.

---

## The nine posts

### P01 · Brand introduction (pinned)
- **Artwork:** `exports/posts/p01-intro.png`
- **Hook:** Train with intent.
- **Caption (Instagram/Facebook):**
  > Meet Blackglass.
  >
  > An Android app that puts your programme, today's session, movement guides and food targets in one place, so you open it, see the work, and get on with it.
  >
  > Built in Dunedin. The app is in development and not publicly available yet. Join the free preview list to hear first when there's a build you can try.
  >
  > Link in bio. (Formerly Obsidian Fitness.)
- **CTA:** Join the preview list · **Destination:** bio → `/links` → `/get`
- **Alt text:** The Blackglass logo, a chamfered octagon of black glass with a bright green highlight in its top-left corner, above the words "Train with intent." and a line explaining that Blackglass is a training app built in Dunedin.

### P02 · Carousel A: what the app does (6 slides)
- **Artwork:** `exports/carousel-a/p02-1.png` … `p02-6.png`
- **Hook:** Know what today asks of you.
- **Caption:**
  > Four screens from the current Android build, and what each one does:
  >
  > 01 Today: pick up the session you started
  > 02 Plan: see the whole week
  > 03 Technique: how the lift should look, phase by phase
  > 04 Fuel: calorie and protein targets beside your training
  >
  > Blackglass is in development. Join the preview list via the link in bio.
  > Screens are real; the figures are examples.
- **CTA:** Join the preview list · **Destination:** bio → `/get`
- **Alt text, by slide:**
  1. The headline "Know what today asks of you." beside the app's Today screen.
  2. The Today screen showing a Push A session in progress with 5 exercises and 12 sets and a Resume workout button, next to three benefits.
  3. The Train screen showing a six-day programme, week 1 of 6, next to three benefits.
  4. The exercise guide for the ab wheel rollout with a 3D figure mid-movement, next to three benefits.
  5. The nutrition panel with calorie and protein targets and a quick meal option, next to three benefits.
  6. The words "Be first on the Android build." with a "Join the preview list" button and a note that there is no iPhone app.

### P03 · Benefit: walk in with a plan
- **Artwork:** `exports/posts/p03-plan.png`
- **Hook:** Walk in with a plan.
- **Caption:**
  > No notes to scroll at the rack.
  >
  > Blackglass lays out every training day, so the exercises and sets are waiting when you open the app. This plan: Push, Pull and Legs, twice through, in a six-week block.
  >
  > Android app in development. Preview list: link in bio.
- **CTA:** Join the preview list · **Destination:** bio → `/get`
- **Alt text:** The headline "Walk in with a plan." beside the app's Train screen, listing Monday to Sunday sessions in a six-day strength programme.

### P04 · Real app demonstration: the exercise guide
- **Artwork:** `exports/posts/p04-technique.png`
- **Hook:** Brace. Reach. Return.
- **Caption:**
  > Every exercise guide in Blackglass plays the movement and splits it into phases.
  >
  > For the ab wheel rollout: brace, reach, return. Step through each one, see the muscles worked, and add the exercise to your programme from the same screen.
  >
  > Link in bio to join the Android preview list.
- **CTA:** Join the preview list · **Destination:** bio → `/get`
- **Alt text:** The words "Brace. Reach. Return." stacked, with "Reach." in green, beside the app's exercise guide showing a 3D figure performing a kneeling ab wheel rollout.

### P05 · Practical tip: resume, don't restart
- **Artwork:** `exports/posts/p05-tip-resume.png`
- **Hook:** Stopped mid-session? Resume it.
- **Caption:**
  > Tip 01: Life interrupts training. When it does, Blackglass keeps your unfinished session on Today, so you continue where you stopped instead of starting again.
  >
  > Today → Resume workout.
  >
  > Blackglass for Android is in development. Link in bio.
- **CTA:** Join the preview list · **Destination:** bio → `/get`
- **Alt text:** The headline "Stopped mid-session? Resume it." beside the app's Today screen with a Resume workout button.

### P06 · Carousel B: how to read your week (5 slides)
- **Artwork:** `exports/carousel-b/p06-1.png` … `p06-5.png`
- **Hook:** How to read your week in Blackglass.
- **Caption:**
  > Three things on the Train screen tell you what's coming:
  >
  > 01 Blocks: "Week 1 of 6 · Build" shows where you are in the programme
  > 02 Days: each row is one session with a job (Push, Pull, Legs)
  > 03 Sessions: the exercises and sets waiting for you today
  >
  > Save this for when the Android build lands. Preview list: link in bio.
- **CTA:** Save + join the preview list · **Destination:** bio → `/get`
- **Alt text, by slide:**
  1. The headline "How to read your week in Blackglass."
  2. A close-up of the active programme card reading "Week 1 of 6 · Build".
  3. A close-up of the session list: Monday Push A, Tuesday Pull A, Wednesday Legs A.
  4. A close-up of a session card: "MON · Push A, 05 exercises / 12 sets".
  5. The words "Want it on your phone?" and a "Join the preview list" button.

### P07 · Benefit: keep food in the picture
- **Artwork:** `exports/posts/p07-fuel.png`
- **Hook:** Keep food in the picture.
- **Caption:**
  > Training and food shouldn't live in separate apps.
  >
  > Blackglass shows your daily calorie target and protein goal next to today's session, and lets you estimate and log a quick meal.
  >
  > Android app in development. Link in bio.
- **CTA:** Join the preview list · **Destination:** bio → `/get`
- **Alt text:** The headline "Keep food in the picture." beside the app's nutrition panel showing a calorie target, a 180 g protein goal and a quick meal button.

### P08 · A note on the name
- **Artwork:** `exports/posts/p08-formerly.png`
- **Hook:** Obsidian → Blackglass.
- **Caption:**
  > Same app, new name.
  >
  > Blackglass was previously called Obsidian Fitness. You'll still see the earlier name on some screens in the current Android build.
  >
  > Everything on blackglass.co.nz is the same project. Link in bio.
- **CTA:** Visit blackglass.co.nz · **Destination:** bio → `/links`
- **Alt text:** The word "Obsidian" struck through above "Now Blackglass.", with a strip of the app's Today screen that still shows the Obsidian logo.

### P09 · Getting started
- **Artwork:** `exports/posts/p09-start.png`
- **Hook:** How to get Blackglass.
- **Caption:**
  > 1. Tap the link in our bio
  > 2. Join the Android preview list: name and email, free, no newsletter
  > 3. Hear from Josh when there's a build to try
  >
  > There's no iPhone app. If you'd like a coach now, Josh's 12-week coaching is open: NZ$59 a week, NZ$708 total.
- **CTA:** Join the preview list (secondary: coaching) · **Destination:** bio → `/links`
- **Alt text:** The headline "How to get Blackglass." above three numbered steps: tap the link in our bio, join the preview list, hear when it's ready. A note below says there's no iPhone app and coaching is NZ$59 a week.

---

## The three vertical videos (Reels, TikTok, Shorts)

### V1 · Train with intent (12 s)
- **File:** `exports/video/v1-train-with-intent.mp4`
- **Opening (0–2 s):** the logo draws itself and light catches the glint.
- **Sequence:** the wordmark resolves, the camera flies through the glass, "Know what today asks of you." appears over the Plan screen, then the end card: "Train with intent. Join the preview list."
- **Instagram Reels caption:** `Blackglass: your programme, today's session, movement guides and food targets in one Android app. In development. Preview list: link in bio.`
- **TikTok caption:** `Training, technique and food in one Android app. Built in Dunedin 🇳🇿 Preview list in bio. #strengthtraining #gymapp #dunedin`
- **YouTube Shorts title/description:** `Blackglass: train with intent` / `An Android training app in development, built in Dunedin. Join the preview list: https://blackglass.co.nz/get?utm_source=youtube&utm_medium=social&utm_campaign=launch_2026&utm_content=v1_intro`
- **CTA:** Join the preview list · **Alt text/description:** The Blackglass logo forms from light, the camera passes through it to the headline "Know what today asks of you." over the app's plan screen, and it ends on "Train with intent."

### V2 · From the plan to the last set (15 s)
- **File:** `exports/video/v2-plan-to-last-set.mp4`
- **Opening (0–2 s):** "Your whole week. One app."
- **Sequence:** 01 Today, "Pick up where you left off."; 02 Plan, "See the whole week."; 03 Technique, "Brace. Reach. Return."; then the end card.
- **Instagram caption:** `Today → Plan → Technique. Three real screens from the Blackglass Android build. Preview list: link in bio.`
- **TikTok caption:** `3 screens that answer "what am I doing today?" Android app in development, link in bio. #workoutplan #strengthtraining #gymtok`
- **Shorts link:** `https://blackglass.co.nz/get?utm_source=youtube&utm_medium=social&utm_campaign=launch_2026&utm_content=v2_flow`
- **CTA:** Join the preview list · **Description:** Real app screens wipe in one after another (the Today session screen, the weekly plan, the exercise guide), each with a short headline, ending on "From the plan to the last set."

### V3 · Brace. Reach. Return. (12 s)
- **File:** `exports/video/v3-brace-reach-return.mp4`
- **Opening (0–2 s):** "Brace." over the ab wheel rollout guide.
- **Sequence:** "Brace.", "Reach.", "Return." in turn over a slow push into the exercise guide, then the end card: "Learn the pattern. Control the rep."
- **Instagram caption:** `Every exercise guide in Blackglass breaks the movement into phases. Ab wheel rollout: brace, reach, return. Preview list: link in bio.`
- **TikTok caption:** `Ab wheel rollout in 3 phases: brace, reach, return. Blackglass exercise guides break every lift down like this. Link in bio. #abwheel #coreworkout #formcheck`
- **Shorts link:** `https://blackglass.co.nz/get?utm_source=youtube&utm_medium=social&utm_campaign=launch_2026&utm_content=v3_technique`
- **CTA:** Join the preview list · **Description:** The words Brace, Reach and Return appear one at a time over the app's ab wheel rollout guide, ending on "Learn the pattern. Control the rep."

---

## Launch teaser (24 s, with sound design)

- **Files:**
  - `exports/video/blackglass-teaser-1080x1920.mp4` (vertical: Reels, TikTok, Shorts)
  - `exports/video/blackglass-teaser-1920x1080.mp4` (landscape: YouTube, website, presentations)
  - `-silent.mp4` versions of both, for adding platform music instead
- **Source:** `teaser.mjs` (visuals: WebGL light field, 3D glass slab, a camera through a field of real app screens) and `teaser-sound.py` (the soundtrack, synthesised from scratch, so it has no licensing restrictions).
- **Sequence:**

| Time | What happens |
|---|---|
| 0–2 s | A line of light cuts the frame on the 45° axis and folds into the rim |
| 2–5 s | The glass sets, light passes through, the glint catches, and the slab turns to show its depth |
| 5–7 s | The camera dives through the pane into a field of real app screens |
| 7–12.6 s | **PLAN. / TRAIN. / LEARN. / FUEL.**, each cut on the facet with its real screen and a one-line caption |
| 12.6–16.6 s | "Know what today asks of you." |
| 16.6–19 s | Everything collapses back into the mark |
| 19–24 s | The lockup and "Train with intent. blackglass.co.nz". "Android app in development · Join the preview list" stays on screen |

- **Hook (first 2 s):** a single line of light, a sound riser, then the logo drawing itself.
- **Instagram Reels caption:** `Train with intent. Blackglass: your programme, today's session, every lift phase by phase, and your food targets in one Android app. In development, preview list open: link in bio.`
- **TikTok caption:** `Plan. Train. Learn. Fuel. One Android app, built in Dunedin 🇳🇿 In development. Preview list in bio. #strengthtraining #gymtok #fitnessapp`
- **YouTube (landscape) title:** `Blackglass: Train with intent (teaser)`
- **YouTube description:** `Blackglass keeps your programme, today's session, movement guides and food targets in one Android app. It's in development: join the preview list at https://blackglass.co.nz/get?utm_source=youtube&utm_medium=social&utm_campaign=launch_2026&utm_content=teaser`
- **CTA:** Join the preview list · **Destination:** bio → `/links`, or the tracked /get link above.
- **Alt text / description:** A line of light folds into the Blackglass logo, a chamfered octagon of black glass with a green highlight, which turns in 3D before the camera flies through it into a field of real app screens. The words Plan, Train, Learn and Fuel each appear beside the matching screen, followed by "Know what today asks of you." Everything collapses back into the logo, ending on "Train with intent. blackglass.co.nz. Android app in development."
- **Where it fits:** post it on day 1 in place of V1, or as a day-15 "launch week wrap". Pin it on TikTok and YouTube. The landscape cut can also sit on the website later (muted, with a poster frame and a pause control).

---

## Two-week publishing sequence

| Day | Instagram / Facebook | TikTok / Shorts | Why here |
|---|---|---|---|
| 1 (Mon) | **P01** intro (pin) | **V1** (pin on TikTok) | Establish the brand and name |
| 2 (Tue) | | | |
| 3 (Wed) | **P02** carousel A | | Show what it does |
| 4 (Thu) | Reel: **V2** | **V2** | Product in motion |
| 5 (Fri) | **P03** walk in with a plan | | First benefit |
| 6 (Sat) | | | |
| 7 (Sun) | **P08** a note on the name | | Answer "is this Obsidian?" early |
| 8 (Mon) | **P04** brace, reach, return | | Demonstration |
| 9 (Tue) | Reel: **V3** | **V3** | Demonstration in motion |
| 10 (Wed) | **P05** tip: resume | | Practical tip |
| 11 (Thu) | | | |
| 12 (Fri) | **P06** carousel B | | Save-worthy guide |
| 13 (Sat) | **P07** keep food in the picture | | Second benefit |
| 14 (Sun) | **P09** getting started (second pin) | Repost **V1** | Clear next step |

Check the owner page (`/admin`) weekly for visits and preview sign-ups by source, and move time to whatever brings people to `/get`. A tap on "Join the preview list" is not a sign-up, and a sign-up is not an install.

## Claims checklist (keep true)

- The app is in development and not publicly available. Change "preview list" copy only when a build is live.
- Android only; no iPhone app.
- Every feature shown is visible in the three real screens. Don't describe Progress, Generate or Forge until they can be shown.
- Coaching: NZ$59/week × 12 weeks = NZ$708, founding price, with Josh, based in Dunedin.
- No testimonials, results, user numbers or qualifications, because none have been supplied.
