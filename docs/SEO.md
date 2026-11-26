# Search: what's implemented, what needs an account, and what to write next

No ranking is guaranteed. This follows Google Search Central guidance (people-first content, crawlable HTML, accurate structured data).

## Implemented in the code

- **Routes.** `/` is the product. `/get` is how to get the app, and `/coaching` is the paid service. `/privacy` and `/links` (the link-in-bio page, set to `noindex, follow` because it repeats other pages' links) round it out, and there is a real 404 page. The old site only had `/`, `/privacy` and `/admin`, so no inbound URLs were lost. Old anchors (`/#apply`, `/#coaching`, `/#app`, `/#method`) still land on matching sections. Short URLs `/download`, `/android` and `/app` redirect (308) to `/get`, `/apply` goes to `/coaching#enquire` and `/bio` goes to `/links`.
- **Rendering.** Every page is server-rendered, so the copy, headings, links and FAQs are in the delivered HTML. JavaScript only enhances.
- **Titles and descriptions:** unique per page, with canonical URLs on `https://blackglass.co.nz`.
- **Open Graph and Twitter cards** use branded 1200×630 images (`public/og/`).
- **Headings:** one `h1` per page, with sections as `h2`/`h3` in order.
- **Semantic HTML:** landmarks (`header`, `nav`, `main`, `footer`), a breadcrumb `nav` on inner pages, `details` for questions, labelled form fields and a skip link.
- **Links and images:** links are descriptive (no "click here"), and every app screen has alt text describing what it shows.
- **`/sitemap.xml`** lists the indexable pages. **`/robots.txt`** allows everything except `/admin` and `/api/`, and points to the sitemap.
- **Structured data**, only where the visible content supports it:
  - **Organization** (name, URL, logo, email, Dunedin NZ; `sameAs` only for verified social accounts) and **WebSite** on the homepage.
  - **BreadcrumbList** on `/get` and `/coaching`.
  - **Service** on `/coaching`: the coaching offer, its provider and where it runs (Dunedin, and New Zealand for online coaching), with no price.
  - **Deliberately not added:** FAQPage (Google limits these results to government and health sites), SoftwareApplication (the app isn't available to download, and there are no ratings), and Product or Offer prices for coaching (not eligible for a rich result, and prices are confirmed in writing; that's why the Service block has no `offers`).
- **Lab checks** (Lighthouse mobile, production build): SEO 100 on every indexable page.

## Needs account access (not done)

1. **Google Search Console.** Add a *Domain property* for `blackglass.co.nz` and verify it with the DNS TXT record Google gives you, added at Crazy Domains.
   - Submit `https://blackglass.co.nz/sitemap.xml`.
   - Use URL Inspection on `/`, `/get` and `/coaching`, then request indexing.
   - After the first month, check Pages (indexing), Core Web Vitals (real-user LCP, INP and CLS) and Performance (queries). Search Console is where the real-user Core Web Vitals appear once there's enough traffic.
2. **Bing Webmaster Tools.** Import from Search Console. This also covers DuckDuckGo and Ecosia results.
3. **Google Business Profile.** Coaching now runs in person in Dunedin, so Blackglass can have one. Set it up as a service-area business (Dunedin, with the address hidden) unless clients visit a staffed Blackglass location. This needs Josh's Google account. Don't create one for the app alone.
4. **Redirect `www` and `http` permanently.** Checked 15 Oct: `https://www.blackglass.co.nz` serves a full copy of the site (200, with canonicals to the apex), and `http://` redirects to `https://` with a temporary `302`. In the Sites or Cloudflare domain settings, make `www` a `301` to `https://blackglass.co.nz` (keeping the path), and make the `http` upgrade a `301`. Canonicals cover it for now, but permanent redirects consolidate signals faster.
5. **Social profiles.** Once they exist, add them to `content/site.ts → social`. That updates `sameAs` and the footer.

## Search intent (no volume figures; check them in Search Console once data exists)

| Intent | Page that answers it |
|---|---|
| "blackglass app", "blackglass fitness" (brand) | Home, /get |
| "strength training app android", "workout planner app", "gym programme app" | Home (demo) → /get. Honest availability matters more than ranking here. |
| "strength coaching dunedin", "personal training dunedin", "physique coaching nz" | /coaching (in person in Dunedin, stated price) |
| "online strength coach nz", "online personal trainer new zealand", "online physique coaching" | /coaching (online anywhere in New Zealand, stated price) |
| "push pull legs 6 day split", "ab wheel rollout form" (informational) | Backlog below. Only publish with Josh's review. |

New Zealand and Dunedin wording is used only where it's true of the offer: coaching runs in person in Dunedin or online anywhere in New Zealand, and "built in Dunedin" is a brand fact.

## Content backlog (useful pages, not keyword pages)

Each item comes from a real screen or question. Write it in Josh's voice, and have him check any training advice.

1. **"How Blackglass structures a training week."** Blocks (week 1 of 6, build phase), days with a job, and sessions with a set count, using the real screens.
2. **Exercise guide pages**, starting with the ab wheel rollout (brace, reach, return), each mirroring the in-app guide. This needs Josh's coaching cues and a clear note that it isn't medical advice.
3. **"What coaching with Josh looks like, week by week"**, expanding the three steps with real (anonymised, consented) examples once clients agree.
4. **"Getting the Android preview"**: what to expect from the first build, and install help. Publish when a build exists.
5. **Josh's background and qualifications**, only once they've been supplied and can be verified.

Avoid thin city or keyword variants, AI-written filler, and unsupported fitness claims.
