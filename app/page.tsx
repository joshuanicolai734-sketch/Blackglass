import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import Intro from "@/components/site/intro";
import { Button, JsonLd, Label, Pane } from "@/components/site/ui";
import { homeFaq } from "@/content/faq";
import { app, coaching, contact, site, socialLinks } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: "Blackglass — Training, technique and food in one app" },
  description: "Know what today asks of you. Blackglass keeps your programme, today's session, movement guides and food targets in one Android app. In development; join the preview list.",
  alternates: { canonical: "/" },
  openGraph: { title: "Blackglass — Know what today asks of you", description: "Your programme, today's session, movement guides and food targets in one Android app. Built in Dunedin.", url: "/", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass: know what today asks of you" }] },
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
    id: "plan", tab: "Plan", src: "/assets/program.webp",
    alt: "Blackglass Train screen showing an active six-day programme, week 1 of 6, with Push, Pull and Legs days listed",
    title: "See the whole week.",
    text: "Your programme lays out every training day, so you know what each session asks of you before you get there.",
    points: ["A six-day split: Push, Pull and Legs, twice through", "Programmes run in blocks. This is week 1 of 6, a build phase", "The movement library sits one tab away"],
  },
  {
    id: "technique", tab: "Technique", src: "/assets/movement.webp",
    alt: "Blackglass exercise guide for the ab wheel rollout, playing the movement with phases labelled Brace, Reach and Return",
    title: "Know how the lift should look.",
    text: "Each exercise guide plays the movement and breaks it into phases, so you can learn the pattern and control it.",
    points: ["Phases you can step through: brace, reach, return", "Tabs for the muscles worked and your own record", "Add an exercise to your programme from its guide"],
  },
];

const benefits = [
  { title: "Walk in with a plan.", text: "No notes to scroll at the rack. The day's exercises and sets are waiting when you open the app." },
  { title: "Lose less to interruptions.", text: "An unfinished session waits for you. Resume it where you stopped instead of starting again." },
  { title: "Move with better control.", text: "Guides show each exercise in phases, so the next rep is more deliberate than the last." },
  { title: "Keep food in the picture.", text: "Calorie and protein targets sit beside your training, not in a separate app." },
];

const hasDownload = Boolean(app.android.playUrl || app.android.apkUrl);

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
  return (
    <>
      {/* The hero screen is the largest paint on phones: fetch it before the stylesheet finishes. */}
      <link rel="preload" as="image" href="/assets/program.webp" imageSrcSet="/assets/program-480.webp 480w, /assets/program.webp 720w" imageSizes="(min-width: 900px) 380px, 76vw" fetchPriority="high" />
      <Intro />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="ambient" data-ambient aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <Label>Training app · Built in Dunedin</Label>
              <h1 id="hero-title" className="display">Know what today asks of you.</h1>
              <p className="lede">Blackglass keeps your programme, today&rsquo;s session, how each lift should look and what you&rsquo;re eating in one clear place. Open it, see the work, get on with it.</p>
              <div className="actions">
                <Button href="/get" track="cta_get_hero">Get Blackglass</Button>
                <Button href="#how-it-works" variant="quiet" down>See how it works</Button>
                <a className="teaser-btn" href="/media/teaser-landscape.mp4" data-teaser data-track="teaser_open">
                  <span className="teaser-thumb" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static poster */}
                    <img src="/media/teaser-thumb.webp" alt="" width="64" height="36" />
                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 3.5v9l7.5-4.5Z" fill="currentColor" /></svg>
                  </span>
                  <span>Watch the teaser <small>22 s</small></span>
                </a>
              </div>
              <p className="status"><span className="dot" aria-hidden="true" />{hasDownload ? "Available for Android" : "Android app in development · Preview list open"}</p>
            </div>
            <div className="hero-visual">
              <svg className="hero-ring" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
                <path d="M.5 18.2 18.2.5h51.6l17.7 17.7v51.6L69.8 87.5H18.2L.5 69.8Z" />
                <path className="seam" d="M73.45 14.55 14.55 73.45" />
              </svg>
              <Pane className="hero-pane" src="/assets/program.webp" priority
              alt="Blackglass Train screen showing a six-day strength and aesthetics programme"
              caption="Plan view · current Android build" />
            </div>
          </div>
        </section>

        <div className="band" aria-hidden="true" data-band>
          <div className="band-track">
            {[0, 1].map((n) => (
              <span key={n} className="band-set">
                {["Plan.", "Train.", "Learn.", "Fuel."].map((w) => <span key={w} className="band-word"><i />{w}</span>)}
              </span>
            ))}
          </div>
        </div>

        <section className="section demo" id="how-it-works" aria-labelledby="how-title">
          <span id="app" aria-hidden="true" />
          <div className="wrap">
            <div className="section-head">
              <Label index="01">How it works</Label>
              <h2 id="how-title" className="h2" data-wipe>From the plan<br />to the last set.</h2>
              <p className="section-intro">Three screens from the current Android build. Tap through the flow.</p>
            </div>
            <div className="demo-ui" data-demo>
              <div className="demo-tabs" role="tablist" aria-label="App screens">
                {demo.map((d, i) => (
                  <button key={d.id} type="button" role="tab" id={`tab-${d.id}`} aria-controls={`panel-${d.id}`}
                    aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} data-demo-tab={d.id}>
                    <span className="demo-tab-index">0{i + 1}</span>{d.tab}
                  </button>
                ))}
              </div>
              {demo.map((d, i) => (
                <div key={d.id} className="demo-panel" role="tabpanel" id={`panel-${d.id}`} aria-labelledby={`tab-${d.id}`}
                  data-demo-panel={d.id} data-inactive={i !== 0 ? "" : undefined}>
                  <Pane src={d.src} alt={d.alt} className="demo-pane" />
                  <div className="demo-copy">
                    <h3 className="h3">{d.title}</h3>
                    <p>{d.text}</p>
                    <ul className="ticks">{d.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
            <p className="footnote">Real screens recorded on an Android phone. Programme and food figures are examples.</p>
          </div>
        </section>

        <section className="section why" id="method" aria-labelledby="why-title">
          <div className="wrap why-grid">
            <div className="section-head">
              <Label index="02">Why it helps</Label>
              <h2 id="why-title" className="h2" data-wipe>Less guessing.<br />More training.</h2>
            </div>
            <ol className="benefits">
              {benefits.map((b) => (
                <li key={b.title} data-reveal><h3>{b.title}</h3><p>{b.text}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section begin" aria-labelledby="begin-title">
          <div className="wrap">
            <div className="section-head">
              <Label index="03">How to start</Label>
              <h2 id="begin-title" className="h2" data-wipe>Three steps in.</h2>
            </div>
            <ol className="steps">
              {hasDownload ? (
                <>
                  <li data-reveal><span className="step-n">01</span><h3>Open Get Blackglass</h3><p>On your Android phone, or scan the code from your computer.</p></li>
                  <li data-reveal><span className="step-n">02</span><h3>Install the app</h3><p>Follow the steps shown for your phone.</p></li>
                  <li data-reveal><span className="step-n">03</span><h3>Set up your plan</h3><p>Choose your programme and open Today.</p></li>
                </>
              ) : (
                <>
                  <li data-reveal><span className="step-n">01</span><h3>Join the preview list</h3><p>Your name and email. It&rsquo;s free and takes a few seconds.</p></li>
                  <li data-reveal><span className="step-n">02</span><h3>Hear when it&rsquo;s ready</h3><p>{site.founder} emails you when there&rsquo;s an Android build you can try.</p></li>
                  <li data-reveal><span className="step-n">03</span><h3>Install and set up</h3><p>The Get Blackglass page will show exactly how to install it.</p></li>
                </>
              )}
            </ol>
            <div className="actions"><Button href="/get" track="cta_get_steps">{hasDownload ? "Get Blackglass" : "Join the preview list"}</Button></div>
          </div>
        </section>

        {coaching.available && (
          <section className="section coach-band" id="coaching" aria-labelledby="coach-title">
            <div className="wrap coach-grid" id="apply">
              <div>
                <Label index="04">Coaching</Label>
                <h2 id="coach-title" className="h2" data-wipe>Want someone<br />in your corner?</h2>
              </div>
              <div className="coach-copy">
                <p>Work directly with {site.founder} for {coaching.weeks} weeks: a plan built around your week, a check-in every week, and adjustments as you progress.</p>
                <p className="price"><strong>{coaching.currency}{coaching.weekly}</strong><span>a week for {coaching.weeks} weeks<br />{coaching.currency}{coaching.total} total · founding price</span></p>
                <Button href="/coaching" variant="ghost" track="cta_coaching_home">Explore coaching</Button>
              </div>
            </div>
          </section>
        )}

        <section className="section questions" id="questions" aria-labelledby="faq-title">
          <div className="wrap faq-grid">
            <div className="section-head">
              <Label index="05">Questions</Label>
              <h2 id="faq-title" className="h2" data-wipe>Straight<br />answers.</h2>
            </div>
            <Faqs items={homeFaq} />
          </div>
        </section>

        <section className="section closer" aria-labelledby="closer-title">
          <div className="wrap closer-inner">
            <svg className="closer-mark" viewBox="0 0 88 88" aria-hidden="true" focusable="false" data-closer>
              <defs>
                <mask id="cm-rim" maskUnits="userSpaceOnUse" x="-10" y="-10" width="108" height="108">
                  <path className="cm-rs" d="M10.361 13.189 20.05 3.5H67.95L84.5 20.05V67.95L74.811 77.639" />
                  <path className="cm-rs" d="M13.189 10.361 3.5 20.05V67.95L20.05 84.5H67.95L77.639 74.811" />
                </mask>
                <clipPath id="cm-oc"><path d="M7 22.101 22.101 7h43.798L81 22.101v43.798L65.899 81H22.101L7 65.899Z" /></clipPath>
                <linearGradient id="cm-lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="8" y2="8"><stop offset="0" stopColor="#F4F5EF" stopOpacity="0" /><stop offset=".5" stopColor="#F4F5EF" stopOpacity=".38" /><stop offset="1" stopColor="#F4F5EF" stopOpacity="0" /></linearGradient>
              </defs>
              <path className="m-pane" d="M7 22.101 22.101 7h43.798L81 22.101v43.798L65.899 81H22.101L7 65.899Z" />
              <path className="m-facet" d="M73.45 14.55 65.899 7H22.101L7 22.101v43.798l7.55 7.551Z" />
              <path className="m-glint" d="M22.101 7H41L7 41V22.101Z" />
              <g clipPath="url(#cm-oc)"><path className="m-sweep" fill="url(#cm-lg)" d="M-100 100 100-100h16L-84 100Z" /></g>
              <path className="m-rim" mask="url(#cm-rim)" fillRule="evenodd" d="M0 18 18 0h52l18 18v52L70 88H18L0 70ZM7 22.101 22.101 7h43.798L81 22.101v43.798L65.899 81H22.101L7 65.899Z" />
            </svg>
            <h2 id="closer-title" className="display closer-title">{site.tagline}</h2>
            <p className="lede">{hasDownload ? "Get Blackglass for Android and open today's session." : "Join the preview list and be among the first to try Blackglass for Android."}</p>
            <Button href="/get" track="cta_get_closer">Get Blackglass</Button>
          </div>
        </section>
      </main>
      <dialog className="teaser-dialog" data-teaser-dialog aria-label="Blackglass teaser video">
        <button type="button" className="teaser-close" data-teaser-close aria-label="Close video"><span aria-hidden="true" /></button>
        <video playsInline controls preload="none" data-teaser-video
          data-poster-landscape="/media/teaser-landscape-poster.webp" data-landscape="/media/teaser-landscape.mp4" data-vertical="/media/teaser-vertical.mp4"
          data-poster-vertical="/media/teaser-vertical-poster.webp" />
        <p className="teaser-caption">22-second teaser. Real screens from the current Android build.</p>
      </dialog>
      <Footer />
      <JsonLd data={jsonLd} />
    </>
  );
}
