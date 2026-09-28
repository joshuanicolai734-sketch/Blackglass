import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { Reel } from "@/components/site/reel";
import { Button, JsonLd, Pane, SectionHead, Signal, SpecCard, TextLink, Words } from "@/components/site/ui";
import { paths } from "@/content/brand";
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

// Each card points at the real screen that backs it.
const benefits: { key: string; title: string; text: string; specs: [string, string][] }[] = [
  { key: "Plan", title: "Walk in with a plan.", text: "No notes to scroll at the rack. The day's exercises and sets are waiting when you open the app.", specs: [["Screen", "Train › Plan"], ["Shows", "5 exercises a day"]] },
  { key: "Today", title: "Lose less to interruptions.", text: "An unfinished session waits for you. Resume it where you stopped instead of starting again.", specs: [["Screen", "Today"], ["Shows", "Session in progress"]] },
  { key: "Learn", title: "Move with better control.", text: "Guides show each exercise in phases, so the next rep is more deliberate than the last.", specs: [["Screen", "Exercise guide"], ["Phases", "Brace · Reach · Return"]] },
  { key: "Fuel", title: "Keep food in the picture.", text: "Calorie and protein targets sit beside your training, not in a separate app.", specs: [["Screen", "Today › Nutrition"], ["Targets", "kcal · protein"]] },
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
  const steps = hasDownload
    ? [["Open Get Blackglass", "On your Android phone, or scan the code from your computer."], ["Install the app", "Follow the steps shown for your phone."], ["Set up your plan", "Choose your programme and open Today."]]
    : [["Join the preview list", "Your name and email. It’s free and takes a few seconds."], ["Hear when it’s ready", `${site.founder} emails you when there’s an Android build you can try.`], ["Install and set up", "The Get Blackglass page will show exactly how to install it."]];
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title" data-sec>
          {/* The hero's one dominant shape: the Glass Pane's outline, drawn side by side (desktop). */}
          <svg className="hero-oct" viewBox="-1 -1 90 90" aria-hidden="true" focusable="false">
            {[[0, 18, 18, 0], [18, 0, 70, 0], [70, 0, 88, 18], [88, 18, 88, 70], [88, 70, 70, 88], [70, 88, 18, 88], [18, 88, 0, 70], [0, 70, 0, 18]].map(([x1, y1, x2, y2], i) => (
              <g key={i} transform={`translate(${x1} ${y1}) rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI})`}>
                <line className="ho-seg" style={{ "--i": i } as CSSProperties} x1="0" y1="0" x2={Math.hypot(x2 - x1, y2 - y1)} y2="0" />
              </g>
            ))}
            <g transform="translate(73.45 14.55) rotate(135)"><line className="ho-seg ho-seam" style={{ "--i": 8 } as CSSProperties} x1="0" y1="0" x2="83.3" y2="0" /></g>
          </svg>
          <div className="wrap">
            <div className="hero-copy">
              <SectionHead index="00" title="Training app" meta="Built in Dunedin" />
              <h1 id="hero-title" className="display"><Words>Know what today asks of you.</Words></h1>
              <p className="body-2">Blackglass keeps your programme, today&rsquo;s session, how each lift should look and what you&rsquo;re eating in one clear place. Open it, see the work, get on with it.</p>
              <div className="actions">
                <Button href="/get" track="cta_get_hero">Get Blackglass</Button>
                <TextLink href="#how-it-works" down>See how it works</TextLink>
              </div>
              <p className="status label"><Signal />Status — {hasDownload ? "Available for Android" : "Android app in development · Preview list open"}</p>
            </div>
          </div>
        </section>

        <Reel />

        <section className="section demo" id="how-it-works" aria-labelledby="how-title" data-sec>
          <span id="app" aria-hidden="true" />
          <div className="wrap">
            <div className="section-head">
              <SectionHead index="01" title="How it works" meta={`${String(demo.length).padStart(2, "0")} screens`} />
              <h2 id="how-title" className="display" data-enter><Words>From the plan to the last set.</Words></h2>
              <p className="body-2">Three screens from the current Android build. Tap through the flow.</p>
            </div>
            <div className="demo-ui" data-demo>
              <div className="demo-tabs" role="tablist" aria-label="App screens">
                {demo.map((d, i) => (
                  <button key={d.id} type="button" role="tab" id={`tab-${d.id}`} aria-controls={`panel-${d.id}`}
                    aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} data-demo-tab={d.id}>
                    <Signal />0{i + 1} {d.tab}
                  </button>
                ))}
              </div>
              {demo.map((d, i) => (
                <div key={d.id} className="demo-panel" role="tabpanel" id={`panel-${d.id}`} aria-labelledby={`tab-${d.id}`}
                  data-demo-panel={d.id} data-inactive={i !== 0 ? "" : undefined}>
                  <Pane src={d.src} alt={d.alt} className="demo-pane" />
                  <div className="demo-copy">
                    <h3 className="title">{d.title}</h3>
                    <p>{d.text}</p>
                    <ul className="ticks">{d.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
            <p className="footnote">Real screens recorded on an Android phone. Programme and food figures are examples.</p>
          </div>
        </section>

        <section className="section why paper" id="method" aria-labelledby="why-title" data-sec data-enter>
          <div className="wrap why-grid">
            <div className="section-head">
              <SectionHead index="02" title="Why it helps" meta={`${String(benefits.length).padStart(2, "0")} principles`} />
              <h2 id="why-title" className="display" data-enter><Words>Less guessing. More training.</Words></h2>
            </div>
            <Pane src="/assets/program.webp" alt="The Train screen: this week’s plan, five exercises a day" sizes="(min-width: 900px) 300px, 70vw" />
            <ol className="cards">
              {benefits.map((b, i) => (
                <SpecCard key={b.title} as="li" index={`0${i + 1}`} kicker={b.key} title={b.title} specs={b.specs}><p>{b.text}</p></SpecCard>
              ))}
            </ol>
          </div>
        </section>

        <section className="section begin" aria-labelledby="begin-title" data-sec>
          <div className="wrap">
            <div className="section-head">
              <SectionHead index="03" title="How to start" meta="03 steps" />
              <h2 id="begin-title" className="display" data-enter><Words>Three steps in.</Words></h2>
            </div>
            <ol className="steps">
              {steps.map(([t, x], i) => <SpecCard key={t} as="li" index={`0${i + 1}`} title={t}><p>{x}</p></SpecCard>)}
            </ol>
            <div className="actions"><Button href="/get" track="cta_get_steps">{hasDownload ? "Get Blackglass" : "Join the preview list"}</Button></div>
          </div>
        </section>

        {coaching.available && (
          <section className="section coach-band paper" id="coaching" aria-labelledby="coach-title" data-sec data-enter>
            <div className="wrap coach-grid" id="apply">
              <div>
                <SectionHead index="04" title="Coaching" meta={`${coaching.weeks} weeks`} />
                <h2 id="coach-title" className="display" data-enter><Words>Want someone in your corner?</Words></h2>
              </div>
              <div className="coach-copy">
                <p>Work directly with {site.founder} for {coaching.weeks} weeks: a plan built around your week, a check-in every week, and adjustments as you progress.</p>
                <div className="price">
                  <p className="monument" data-enter data-count={coaching.weekly}>{coaching.weekly}</p>
                  <p className="price-labels label"><span>{coaching.currency} a week</span><span>{coaching.weeks} weeks · {coaching.currency}{coaching.total} total</span><span>Founding price</span></p>
                </div>
                <Button href="/coaching" track="cta_coaching_home">Explore coaching</Button>
              </div>
            </div>
          </section>
        )}

        <section className="section questions" id="questions" aria-labelledby="faq-title" data-sec>
          <div className="wrap faq-grid">
            <div className="section-head">
              <SectionHead index={coaching.available ? "05" : "04"} title="Questions" meta={`${String(homeFaq.length).padStart(2, "0")} answers`} />
              <h2 id="faq-title" className="display" data-enter><Words>Straight answers.</Words></h2>
            </div>
            <Faqs items={homeFaq} />
          </div>
        </section>

        <section className="section closer" aria-labelledby="closer-title" data-sec>
          <div className="wrap closer-inner">
            <svg className="closer-mark" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
              <path fill="var(--c-pane)" d={paths.pane} /><path fill="var(--c-facet)" d={paths.facet} />
              <path fill="var(--c-volt)" d={paths.glint} /><path fill="var(--c-bone)" fillRule="evenodd" d={paths.rim} />
            </svg>
            <h2 id="closer-title" className="display" data-enter><Words>{site.tagline}</Words></h2>
            <p className="body-2">{hasDownload ? "Get Blackglass for Android and open today's session." : "Join the preview list and be among the first to try Blackglass for Android."}</p>
            <Button href="/get" track="cta_get_closer">Get Blackglass</Button>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={jsonLd} />
    </>
  );
}
