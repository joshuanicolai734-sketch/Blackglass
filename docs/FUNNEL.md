# How the site communicates and earns

## What makes money today

**Coaching with Josh** is the product people can buy now: NZ$59 a week for 12 weeks (NZ$708), a founding price set in `content/site.ts → coaching`.

The **Android app** has no public download and no price yet. Its jobs today are:
- to collect the **preview list**, the launch audience
- to show the method, which builds the trust that coaching sells on

The site must never imply the app can be bought or installed until `content/site.ts → app` has a real link.

## The path through the home page

1. **Hero:** the promise ("Know what today asks of you.") and two doors.
   - The primary button goes to the app (`/get`).
   - A direct text link reads "Coaching with Josh · NZ$59/wk".
   - The status line says the app is in development and **coaching is available now**.
2. **Showreel:** the method in 24 s. The specimen is a **back squat**, the lift people most want coached. Its callouts show that every rep has phases and a working area, which bridges to coaching.
3. **How it works:** the proof, with three real screens.
4. **Why it helps** (Paper): the benefits, each tied to a real screen.
5. **Choose your start:** the fork, side by side.
   - **The app** is the free preview list, shown as a hairline panel with its three steps and a volt button.
   - **Coaching** is the heavier Paper panel: the monumental 59, what's included, an "Enquire" button, and "No payment is taken on this site".
   - The paid path carries the visual weight; the free path carries the colour.
6. **Questions:** answers the objections.
7. **Closer:** "Train with intent." with both paths: join the preview list, or work directly with Josh.

## Measurement

Each money door has its own event, so `/admin` can compare the two paths. Its "Funnel" line shows two ratios:
- taps towards coaching, against coaching enquiries
- taps towards the app, against preview sign-ups

| Path | Events |
|---|---|
| Coaching | `cta_coaching_hero`, `cta_offer_coaching`, `cta_coaching_closer`, plus `cta_enquire_hero`, `cta_enquire_header` (the header on `/coaching`), `cta_coaching_sticky`, `cta_enquire_sticky` (the phone bar) and `links_coaching` |
| App | `cta_get_hero`, `cta_offer_app`, `cta_get_closer`, `cta_get_header`, `cta_get_menu`, `cta_get_sticky` (the phone bar), `cta_preview_header` (the header on `/get`), `cta_preview_anchor` and `links_get` |

- Enquiries and sign-ups are counted on the server only when the database insert succeeds.
- A tap is not an enquiry, and a sign-up is not an install.

## Rules

- **Honesty:**
  - No invented urgency, scarcity, testimonials, client results or app pricing.
  - "Founding price" is the offer's real name.
  - Don't say "limited" unless it's true and stated in `content/site.ts`.
- **When the app launches:** set its link in `content/site.ts`. The hero, the fork's app panel, the steps and the closer switch to "Get Blackglass" and install steps by themselves.
- **If coaching closes:** set `coaching.available: false`.
  - The hero link falls back to "See how it works".
  - The fork shows only the app.
  - The closer drops the coaching link.
