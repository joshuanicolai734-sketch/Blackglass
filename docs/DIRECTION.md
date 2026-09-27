# Blackglass: diagnosis, direction and results (September 2026)

## What exists (verified)

- **Android app:** in development, with no public download, store listing or web app, and no iPhone app. The three screen recordings (`public/assets/`) show:
  - **Today:** session in progress, Resume workout, Preview session, calorie and protein targets, Log food, and "Quick meal · estimate & log".
  - **Train:** the active programme ("Week 1 of 6 · Build"), a six-day split, and Plan, Library, Build, Generate and Forge tabs.
  - **Exercise guide:** animated movement with phases (Brace, Reach, Return), Muscles and My record tabs, and Add to my program.
  - Navigation: Today, Train, Fuel, Progress, More. The app still shows "obsidian FITNESS".
- **Coaching:** 12 weeks with Josh, based in Dunedin; founding price NZ$59 a week (NZ$708). Enquiries are saved to the site database and read at `/admin`.
- **Not verified, so not claimed:** what Progress, Generate or Forge do; app pricing; testimonials, results, user numbers or qualifications; social accounts; analytics.

## Diagnosis of the previous site

1. It led with coaching and treated the app as a footnote, although the app has the strongest visual proof.
2. It was one long page with no destination for getting the app, no link in bio, no QR hand-off, no 404, and no sitemap, robots file or per-page metadata.
3. There was a hydration error on every load, heading letters collided (Arial at −0.085em), and a 30 fps canvas kept running.
4. It used generic card grids, and the brand's strongest idea (the chamfered pane and its 45° facet) was barely used beyond the logo.
5. Nothing was measured.

## Direction: "The Facet"

The logo's chamfered pane and 45° seam become the whole system:
- chamfered buttons and panes;
- a lit upper-left facet on every product screen;
- reveals that wipe along 45°;
- the octagon outline as the section marker and the hero "window";
- volt used only as the glint;
- motion that follows light through black glass, from the intro to the ambient shader.

**Primary journey:** understand the app, then /get, which gives honest availability and the Android preview list (a real submission). **Secondary:** coaching, a real paid service with an enquiry form.

## Hero options considered

1. **"Train with intent."** The existing brand line. Memorable, but it doesn't say what the product is.
2. **"Know what today asks of you."** Chosen. It is specific, and the real Today and Train screens prove it.
3. **"Your training, in one clear place."** Accurate, but closest to generic app copy.

"Train with intent." remains the sign-off.

## Verification (production build, September 2026)

- **Journeys:** 41/41 automated checks passed. They cover:
  - the intro rules (first visit, once per session; bypassed for campaign links, deep links, /get, /links and reduced motion; skippable; fails open);
  - demo tabs and keyboard, the mobile menu, the home → /get journey and the QR code;
  - preview-list and enquiry submissions (success, validation and honest failure);
  - iPhone detection, the link-in-bio order, the 404 page, the ambient pause control, reduced motion, and axe accessibility scans on every page;
  - no console errors throughout.
- **Lighthouse mobile (lab, simulated slow 4G, 4× CPU):**

  | Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
  |---|---|---|---|---|---|---|---|
  | / | 95 | 100 | 100 | 100 | 2.6 s | 0 | 10 ms |
  | /get | 98 | 100 | 100 | 100 | 2.1 s | 0.017 | 0 ms |
  | /coaching | 98 | 100 | 100 | 100 | 2.1 s | 0 | 30 ms |

  These are lab numbers. The Core Web Vitals targets (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75) are real-user measures, so check them in Search Console once there's traffic. The homepage's simulated LCP is the hero screen competing with fonts and framework scripts on a modelled slow link; unthrottled, it paints in about 150 ms.
- **Testing limits:** the headless Chromium here uses software rendering, so the WebGL ambient light's frame rate on real phones wasn't measured. It runs at half resolution and about 30 fps and pauses offscreen. Safari and Firefox weren't tested. No real Android handset was available.
