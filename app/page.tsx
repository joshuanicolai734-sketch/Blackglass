import type { Metadata } from "next";
import { appCta, Footer, hasDownload, Header, StickyCta } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { Reel } from "@/components/site/reel";
import { Button, JsonLd, Pane, SectionHead, Signal, SpecCard, TextLink } from "@/components/site/ui";
import { paths } from "@/content/brand";
import { homeFaq } from "@/content/faq";
import { coaching, contact, site, socialLinks } from "@/content/site";

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
    id: "plan", tab: "Train", src: "/assets/program.webp",
    alt: "Blackglass Train screen showing an active six-day programme, week 1 of 6, with Push, Pull and Legs days listed",
    title: "See the whole week.",
    text: "Your programme lays out every training day, so you know what each session asks of you before you get there.",
    points: ["A six-day split: Push, Pull and Legs, twice through", "Programmes run in blocks. This is week 1 of 6, a build phase", "The movement library sits one tab away"],
  },
  {
    id: "technique", tab: "Learn", src: "/assets/movement.webp",
    alt: "The top of a Blackglass exercise guide: Movement, Muscles and My record tabs, the exercise title, and an Add to my program button",
    title: "Learn each movement in phases.",
    text: "Each exercise guide plays the movement and breaks it into phases, so you can learn the pattern and control it.",
    points: ["Phases you can step through: brace, reach, return", "Tabs for the muscles worked and your own record", "Add an exercise to your programme from its guide"],
  },
];

// Each card points at the real screen that backs it.
const benefits: { key: string; title: string; text: string; specs: [string, string][] }[] = [
  { key: "Train", title: "Walk in with a plan.", text: "No notes to scroll at the rack. The day's exercises and sets are waiting when you open the app.", specs: [["Screen", "Train › Plan"], ["Shows", "5 exercises a day"]] },
  { key: "Today", title: "Lose less to interruptions.", text: "An unfinished session waits for you. Resume it where you stopped instead of starting again.", specs: [["Screen", "Today"], ["Shows", "Session in progress"]] },
  { key: "Learn", title: "Move with better control.", text: "Guides show each exercise in phases, so the next rep is more deliberate than the last.", specs: [["Screen", "Exercise guide"], ["Phases", "Brace · Reach · Return"]] },
  { key: "Fuel", title: "Keep food in the picture.", text: "Calorie and protein targets sit beside your training, not in a separate app.", specs: [["Screen", "Today › Nutrition"], ["Targets", "kcal · protein"]] },
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
      <main id="main">
        <section className="hero" aria-labelledby="hero-title" data-sec>
          <div className="wrap hero-grid">
            {/* The section rule runs across both columns, tying the copy to the screen. */}
            <div className="hero-head"><SectionHead index="00" title="Strength training app" meta="Built in Dunedin" /></div>
            <div className="hero-copy">
              <h1 id="hero-title" className="display">Know what today asks of you.</h1>
              <p className="body-2">Blackglass keeps your programme, today&rsquo;s session, how each movement should look and what you&rsquo;re eating in one clear place. Open it, see the work, get on with it.</p>
              <div className="actions">
                <Button href="/get" track="cta_get_hero">{appCta}</Button>
                {coaching.available
                  ? <Button href="/coaching" variant="ghost" track="cta_coaching_hero">Coaching<span className="lbl-wide"> with {site.founder}</span> · {coaching.currency}{coaching.weekly}/wk<span className="lbl-narrow"> · {coaching.weeks} weeks</span></Button>
                  : <TextLink href="#how-it-works" down>See how it works</TextLink>}
              </div>
              {/* One clause per line, so no separator is ever left dangling. */}
              <p className="status label"><Signal /><span className="status-lines">
                <span>Status</span>
                {hasDownload ? <span>Available for Android</span> : <><span>Android app in development</span><span>Preview list open</span></>}
                {coaching.available && <span>Coaching available now</span>}
              </span></p>
            </div>
            {/* The hero's one dominant shape: the real Train screen (the demo below opens on Today, so no screen
                repeats). Desktop only; phones never fetch it, so the phone LCP stays the headline. */}
            <Pane src="/assets/program.webp" className="hero-pane crop-train" priority media="(min-width: 1100px)" sizes="440px"
              alt="Blackglass Train screen: an active six-day strength programme, week 1 of 6, with Push, Pull and Legs days listed" />
          </div>
        </section>

        <section className="section demo" id="how-it-works" aria-labelledby="how-title" data-sec>
          <span id="app" aria-hidden="true" />
          <div className="wrap">
            <div className="section-head">
              <SectionHead index="01" title="How it works" meta={`${String(demo.length).padStart(2, "0")} screens`} />
              <h2 id="how-title" className="display">From the plan to the last set.</h2>
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
                {/* One shared indicator: the hairline and the volt square drive to the chosen tab (public/site.js). */}
                <span className="demo-bar" aria-hidden="true" /><span className="demo-sq" aria-hidden="true" />
              </div>
              {demo.map((d, i) => (
                <div key={d.id} className="demo-panel" role="tabpanel" id={`panel-${d.id}`} aria-labelledby={`tab-${d.id}`}
                  data-demo-panel={d.id} data-inactive={i !== 0 ? "" : undefined} tabIndex={0}>
                  {/* No demo screen is fetched with the first paint: site.js warms them after load, or when the demo nears. */}
                  <Pane src={d.src} alt={d.alt} className={`demo-pane${d.id === "technique" ? " crop-learn" : d.id === "today" ? " crop-today" : d.id === "plan" ? " crop-plan" : ""}`} defer
                    sizes={d.id === "technique" ? "(min-width: 900px) 422px, min(100vw - 50px, 422px)" : undefined} />
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

        <Reel />

        <section className="section why paper" id="method" aria-labelledby="why-title" data-sec>
          <div className="wrap why-grid">
            <div className="section-head">
              <SectionHead index="02" title="Why it helps" meta={`${String(benefits.length).padStart(2, "0")} principles`} />
              <h2 id="why-title" className="display">Less guessing. More training.</h2>
            </div>
            <ol className="cards">
              {benefits.map((b, i) => (
                <SpecCard key={b.title} as="li" index={`0${i + 1}`} kicker={b.key} title={b.title} specs={b.specs}><p>{b.text}</p></SpecCard>
              ))}
            </ol>
          </div>
        </section>

        {/* The fork: the free app preview and paid coaching, side by side, once the product has been shown. */}
        <section className="section offers" id="start" aria-labelledby="start-title" data-sec>
          <div className="wrap">
            <div className="section-head">
              <SectionHead index="03" title="Get started" meta={coaching.available ? "02 options" : "01 option"} />
              <h2 id="start-title" className="display">Choose your start.</h2>
              {coaching.available && <p className="body-2 fork-line">Want a person, not an app? <a href="#coaching">Coaching with {site.founder}</a> is available now.</p>}
            </div>
            <div className={coaching.available ? "offer-grid" : "offer-grid single"}>
              <article className="offer-card offer-app" aria-labelledby="offer-app-title">
                <p className="spec-k label"><span className="i">01</span><span>The app</span></p>
                <h3 id="offer-app-title" className="title">Blackglass for Android</h3>
                <p className="body-2">{hasDownload ? "Your programme, today’s session, movement guides and food targets on your phone." : "In development and not yet publicly available. Join the free preview list and hear first when there’s a build you can try."}</p>
                <dl className="colophon label">
                  <dt>Status</dt><dd>{hasDownload ? "Available for Android" : "In development"}</dd>
                  {!hasDownload && <><dt>Cost</dt><dd>Free to join</dd></>}
                  <dt>Phones</dt><dd>Android · no iPhone app</dd>
                </dl>
                <ol className="install offer-steps">{steps.map(([t, x]) => <li key={t}><strong>{t}.</strong> {x}</li>)}</ol>
                <p className="offer-steps-short">{hasDownload ? "Open Get Blackglass on your Android phone and follow the install steps." : `Join the free list; ${site.founder} emails you when there’s a build.`}</p>
                <div className="actions"><Button href="/get" track="cta_offer_app">{appCta}</Button></div>
              </article>
              {coaching.available && (
                <article className="offer-card offer-coach paper" id="coaching" aria-labelledby="offer-coach-title">
                  <span id="apply" aria-hidden="true" />
                  <p className="spec-k label"><span className="i">02</span><span>Coaching with {site.founder}</span><span className="live-tag"><Signal />Available now</span></p>
                  <h3 id="offer-coach-title" className="title">Work directly with {site.founder}.</h3>
                  <p className="body-2">A plan built around your week, a check-in every week, and adjustments as you progress. Available now, with any phone.</p>
                  <div className="price">
                    <p className="monument">{coaching.weekly}</p>
                    <p className="price-labels label"><span>{coaching.currency} a week</span><span>{coaching.weeks} weeks · {coaching.currency}{coaching.total} total</span><span>{coaching.offerName}</span></p>
                  </div>
                  <ul className="includes">
                    <li>A training plan built around your goal, available days and equipment</li>
                    <li>One check-in with {site.founder} each week</li>
                    <li>Adjustments as you progress, instead of starting over</li>
                  </ul>
                  <p className="form-note">No payment is taken on this site. You&rsquo;ll see the written scope and payment terms before you commit.</p>
                  <div className="actions">
                    <Button href="/coaching#enquire" track="cta_offer_coaching">Enquire about coaching</Button>
                    <TextLink href="/coaching">How coaching works</TextLink>
                  </div>
                </article>
              )}
            </div>
          </div>
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

        <section className="section closer" aria-labelledby="closer-title" data-sec>
          <div className="wrap closer-inner">
            <svg className="closer-mark" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
              <path fill="var(--c-pane)" d={paths.pane} /><path fill="var(--c-facet)" d={paths.facet} />
              <path fill="var(--c-volt)" d={paths.glint} /><path fill="var(--c-bone)" fillRule="evenodd" d={paths.rim} />
            </svg>
            <h2 id="closer-title" className="display">One place for the plan, the lift and the food.</h2>
            <p className="body-2">{hasDownload ? "Get Blackglass for Android and open today’s session." : "Join the preview list to hear first when the Android build is ready."}</p>
            <div className="actions closer-actions">
              <Button href="/get" track="cta_get_closer">{appCta}</Button>
              {coaching.available && <Button href="/coaching" variant="ghost" track="cta_coaching_closer">{`Coaching with ${site.founder} · ${coaching.currency}${coaching.weekly}/wk`}</Button>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={jsonLd} />
    </>
  );
}
