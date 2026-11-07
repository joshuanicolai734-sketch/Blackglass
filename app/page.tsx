import type { Metadata } from "next";
import "./home.css";
import { appCta, Footer, hasDownload, Header, StickyCta } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { ForceOpening } from "@/components/site/force-opening";
import { ForceProductHandoff } from "@/components/site/force-product-handoff";
import { HomeProductArt } from "@/components/site/home-product-art";
import { StudyPlayer } from "@/components/site/study-player";
import { Arrow, Button, JsonLd, Pane, SectionHead, Signal, TextLink } from "@/components/site/ui";
import { homeFaq } from "@/content/faq";
import { coaching, contact, ogBase, site, socialLinks } from "@/content/site";

/*
 * The home page as published at Sites v34 (`main.home-v2`): the "One session. Then the next." hero with the Today
 * screen, the motion study (an opt-in <details> holding the force opening), the How it works demo with its scroll
 * handoff, the four principles, the two ways in, questions and the closer.
 *
 * Rebuilt on 7 November 2026 from the page the public site served at v34 (studio/reference/sites-v34-2026-11-07/),
 * because the v34 source wasn't on GitHub. The render tree it shipped fixes the markup and which values come from
 * content/site.ts. The `hasDownload` wording comes from the earlier source; v34 had no download to show it.
 */

const description = "One session. Then the next. Training, movement guides and food targets in one Android app. In development; join the free preview list.";

export const metadata: Metadata = {
  title: { absolute: "Blackglass — Training, technique and food in one app" },
  description,
  alternates: { canonical: "/" },
  openGraph: { ...ogBase, title: "Blackglass — One session. Then the next.", description, url: "/", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass Android training app preview" }] },
};

const demo = [
  {
    id: "today", tab: "Today", src: "/assets/dashboard.webp",
    alt: "Blackglass Today screen showing a Push A session in progress with 5 exercises and 12 sets, a Resume workout button, and a nutrition panel with calorie and protein targets",
    title: "Pick up where you left off.",
    text: "Today opens on the session you're part-way through, with one button to carry on and your food targets underneath.",
    points: ["Resume or preview the day's session", "Calorie and protein targets on the same screen", "Log food, or estimate a quick meal and log it"],
  },
  {
    id: "plan", tab: "Train", src: "/assets/program.webp",
    alt: "Blackglass Train screen showing an active six-day programme, week 1 of 6, with Push, Pull and Legs days listed",
    title: "See the whole week.",
    text: "Your programme lays out every training day, so you know what each session asks of you before you get there.",
    points: ["Your saved training days, in order", "This example shows a six-day programme in week 1 of 6", "Open the exercise library when you need a guide"],
  },
  {
    id: "technique", tab: "Learn", src: "",
    alt: "",
    title: "Study the movement before the set.",
    text: "A separate rendered study of one curl repetition. Inspect the movement at your own pace; this is artwork, not an Android recording.",
    points: ["Exercise-specific phases, with pause and replay", "Controlled lift, brief hold and a slower return"],
  },
];

// Each principle points at the real screen that backs it.
const principles: { title: string; text: string; screen: [string, string] }[] = [
  { title: "Walk in with a plan.", text: "No notes to scroll at the rack. The day's exercises and sets are waiting when you open the app.", screen: ["Screen", "Train › Plan"] },
  { title: "Lose less to interruptions.", text: "An unfinished session waits for you. Resume it where you stopped instead of starting again.", screen: ["Screen", "Today"] },
  { title: "Understand the next exercise.", text: "Pause or slow a supported movement study to inspect its phases. A guide is a reference, not a check of your own form.", screen: ["Screen", "Exercise guide"] },
  { title: "Keep food in the picture.", text: "Calorie and protein targets sit beside your training, not in a separate app.", screen: ["Screen", "Today › Nutrition"] },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url,
        logo: `${site.url}/icon-512.png`, email: contact.email,
        address: { "@type": "PostalAddress", addressLocality: "Dunedin", addressCountry: "NZ" },
        ...(socialLinks.length ? { sameAs: socialLinks.map((s) => s.href) } : {}),
      },
      { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url, publisher: { "@id": `${site.url}/#org` }, inLanguage: "en-NZ" },
    ],
  };
  const steps = hasDownload
    ? [["Open Get Blackglass", "On your Android phone, or scan the code from your computer."], ["Install the app", "Follow the steps shown for your phone."], ["Set up your plan", "Choose your programme and open Today."]]
    : [["Join the preview list", "Your name and email. It’s free and takes a few seconds."], ["Hear when it’s ready", `${site.founder} emails you when there’s an Android build you can try.`], ["Install and set up", "The Get Blackglass page will show exactly how to install it."]];
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <StickyCta />
      <main id="main" className="home-v2">
        <section className="home-hero hero" aria-labelledby="hero-title" data-sec>
          <div className="wrap">
            <div className="home-hero-topline label"><p><Signal />Train with intent.</p><p>Dunedin / New Zealand</p></div>
            <div className="home-hero-grid">
              <div className="home-hero-copy">
                <h1 className="home-hero-title" id="hero-title"><span>One<br />session.</span><span className="home-hero-next">Then the next.</span></h1>
                <p className="home-hero-summary"><strong>Your training, brought together.</strong> Programme, movement guides and food targets in one Android app.</p>
                <div className="actions">
                  <Button href="/get" track="cta_get_hero">{appCta}</Button>
                  <TextLink href="#how-it-works" down>Explore the app</TextLink>
                </div>
                <p className="home-availability">{hasDownload ? "Available for Android." : "Android app in development. Free to join the preview list."}</p>
                {coaching.available && (
                  <a className="home-coaching-link" href="/coaching" data-track="cta_coaching_hero">
                    Coaching with {site.founder} · {coaching.currency}{coaching.weekly}/week <Arrow />
                  </a>
                )}
              </div>
              <HomeProductArt />
            </div>
            <div className="home-hero-bottomline label">
              <p>Programme / Movement / Food</p>
              <a href="#how-it-works">Inside Blackglass <Arrow down /></a>
            </div>
          </div>
        </section>

        {/* The motion study opens on request; its record then hands off into the Today screen as the demo scrolls in. */}
        <div className="force-product-journey home-motion-journey" data-force-product-journey>
          <details className="home-motion-chapter">
            <summary>
              <span className="label">The Blackglass motion study</span>
              <span>Load. Repeat. Record.</span>
              <span className="home-motion-open">Explore <span aria-hidden="true">＋</span></span>
            </summary>
            <ForceOpening study />
          </details>
          <section className="section demo force-product home-demo" id="how-it-works" aria-labelledby="how-title" data-sec>
            <span id="app" aria-hidden="true" />
            <div className="wrap">
              <div className="home-section-label"><SectionHead index="01" title="How it works" /></div>
              <div className="demo-ui" data-demo>
                <div className="section-head">
                  <h2 id="how-title" className="display">A plan.<br />A session.<br />A way forward.</h2>
                  <p className="body-2">See how training comes together. Explore real Android screens and the movement artwork.</p>
                </div>
                <div className="demo-tabs" role="tablist" aria-label="How it works views">
                  {demo.map((d, i) => (
                    <button key={d.id} type="button" role="tab" id={`tab-${d.id}`} aria-controls={`panel-${d.id}`}
                      aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} data-demo-tab={d.id}>
                      <Signal />0{i + 1} {d.tab}
                    </button>
                  ))}
                  {/* One shared indicator: the hairline and the signal square drive to the chosen tab (public/site.js). */}
                  <span className="demo-bar" aria-hidden="true" /><span className="demo-sq" aria-hidden="true" />
                </div>
                {demo.map((d, i) => (
                  <div key={d.id} className="demo-panel" role="tabpanel" id={`panel-${d.id}`} aria-labelledby={`tab-${d.id}`}
                    data-demo-panel={d.id} data-inactive={i !== 0 ? "" : undefined} tabIndex={0}>
                    {d.id === "technique" ? (
                      /* A rendered movement study, clearly separate from the real app screens. */
                      <figure className="pane demo-pane movement-card">
                        <StudyPlayer variant="home-curl" compact />
                        <figcaption className="label">Dumbbell curl / Rendered movement study</figcaption>
                      </figure>
                    ) : (
                      /* Today loads with the page (the handoff lands on it); Train waits until site.js warms it. */
                      <Pane src={d.src} alt={d.alt} className={`demo-pane crop-${d.id}`} defer={d.id !== "today"} />
                    )}
                    <div className="demo-copy">
                      <h3 className="title">{d.title}</h3>
                      <p>{d.text}</p>
                      <ul className="ticks">{d.points.map((p) => <li key={p}>{p}</li>)}</ul>
                      {d.id === "technique" && <TextLink href="/movements" track="cta_movement_home">Explore the existing Movement Studio</TextLink>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="footnote">Today and Train are real screens from an earlier Android development build. Learn shows separate movement artwork, not an Android recording or a technique assessment. Programme and food figures are examples.</p>
            </div>
          </section>
          <ForceProductHandoff />
        </div>

        <section className="section home-method paper" id="method" aria-labelledby="why-title" data-sec>
          <div className="wrap home-method-grid">
            <div className="section-head">
              <SectionHead index="02" title="The approach" />
              <h2 id="why-title" className="display">Less guessing.<br />More training.</h2>
              <p>A clear next step, from the plan to the last set.</p>
            </div>
            <ol className="home-principles">
              {principles.map((b, i) => (
                <li key={b.title}>
                  <span className="home-principle-number label">0{i + 1}</span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                    <p className="home-principle-screen label">{b.screen[0]} / {b.screen[1]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The fork: the free app preview and paid coaching, once the product has been shown. */}
        <section className="section home-start" id="start" aria-labelledby="start-title" data-sec>
          <div className="wrap">
            <div className="section-head">
              <SectionHead index="03" title="Get started" meta={coaching.available ? "02 ways in" : "01 way in"} />
              <h2 id="start-title" className="display">Your next move.</h2>
            </div>
            <article className="home-app-offer" aria-labelledby="offer-app-title">
              <div>
                <p className="spec-k label"><Signal /><span>01 / The app</span></p>
                <h3 id="offer-app-title">Blackglass<br />for Android.</h3>
                <p className="body-2">{hasDownload ? "Your programme, today’s session, movement guides and food targets on your phone." : "In development and not yet publicly available. Join the free preview list and hear first when there’s a build you can try."}</p>
                <dl className="colophon label">
                  <dt>Status</dt><dd>{hasDownload ? "Available for Android" : "In development"}</dd>
                  {!hasDownload && <><dt>Cost</dt><dd>Free to join</dd></>}
                  <dt>Phones</dt><dd>Android · no iPhone app</dd>
                </dl>
              </div>
              <div>
                <ol className="install">{steps.map(([t, x]) => <li key={t}><strong>{t}.</strong> {x}</li>)}</ol>
                <div className="actions"><Button href="/get" track="cta_offer_app">{appCta}</Button></div>
              </div>
            </article>
          </div>
          {coaching.available && (
            <article className="home-coach" id="coaching" aria-labelledby="offer-coach-title">
              <span id="apply" aria-hidden="true" />
              <div className="home-coach-grid">
                <div className="home-coach-copy">
                  <p className="spec-k label"><Signal /><span>02 / Coaching with {site.founder}</span></p>
                  <h3 id="offer-coach-title">A plan.<br />A person<br />in your corner.</h3>
                  <p className="body-2">Work directly with {site.founder}. A plan built around your week, a check-in every week, and adjustments as you progress. {coaching.format}.</p>
                  <div className="price">
                    <p className="monument">{coaching.weekly}</p>
                    <p className="price-labels label"><span>{coaching.currency} a week</span><span>{coaching.weeks} weeks · {coaching.currency}{coaching.total} total</span><span>{coaching.offerName}</span></p>
                  </div>
                  <ul className="includes">
                    <li>A plan for your goal, available days and equipment</li>
                    <li>One check-in with {site.founder} each week</li>
                    <li>Adjustments as you progress</li>
                  </ul>
                  <p className="form-note">Available now, with any phone. No payment is taken on this site. You’ll see the written scope and payment terms before you commit.</p>
                  <div className="actions">
                    <Button href="/coaching#enquire" track="cta_offer_coaching">Enquire about coaching</Button>
                    <TextLink href="/coaching">How it works</TextLink>
                  </div>
                </div>
              </div>
            </article>
          )}
        </section>

        <section className="section questions" id="questions" aria-labelledby="faq-title" data-sec>
          <div className="wrap faq-grid">
            <div className="section-head">
              <SectionHead index="04" title="Questions" meta={`${String(homeFaq.length).padStart(2, "0")} answers`} />
              <h2 id="faq-title" className="display">Straight answers.</h2>
            </div>
            <Faqs items={homeFaq} />
          </div>
        </section>

        <section className="section closer home-closer" aria-labelledby="closer-title" data-sec>
          <div className="wrap closer-inner">
            <h2 id="closer-title" className="display">Make the<br />next session<br />count.</h2>
            <div>
              <p className="body-2">{hasDownload ? "Get Blackglass for Android and open today’s session." : "Join the preview list to hear first when the Android build is ready."}</p>
              <div className="actions closer-actions">
                <Button href="/get" track="cta_get_closer">{appCta}</Button>
                {coaching.available && <Button href="/coaching" variant="ghost" track="cta_coaching_closer">{`Coaching with ${site.founder} · ${coaching.currency}${coaching.weekly}/wk`}</Button>}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={jsonLd} />
    </>
  );
}
