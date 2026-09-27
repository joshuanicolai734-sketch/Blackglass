/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { Button, JsonLd, Label } from "@/components/site/ui";
import { coachingFaq } from "@/content/faq";
import { coaching, contact, site } from "@/content/site";

const price = `${coaching.currency}${coaching.weekly}`;

export const metadata: Metadata = {
  title: "Strength and physique coaching with Josh",
  description: `${coaching.weeks} weeks of strength and physique coaching with Josh, based in Dunedin: a plan built around your week, weekly check-ins and adjustments. Founding price ${price} a week.`,
  alternates: { canonical: "/coaching" },
  openGraph: { title: "Coaching with Josh | Blackglass", description: `A plan built around your week, a check-in every week, and adjustments as you progress. ${price} a week for ${coaching.weeks} weeks.`, url: "/coaching", images: [{ url: "/og/coaching.png", width: 1200, height: 630, alt: "Blackglass coaching with Josh" }] },
};

export default function Coaching() {
  if (!coaching.available) notFound();
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
    { "@type": "ListItem", position: 2, name: "Coaching", item: `${site.url}/coaching` },
  ] };
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/coaching" />
      <main id="main" data-page="coaching">
        <section className="page-hero" aria-labelledby="coach-title">
          <div className="ambient" data-ambient aria-hidden="true" />
          <div className="wrap split">
            <div>
              <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Coaching</nav>
              <Label>Coaching · Based in Dunedin</Label>
              <h1 id="coach-title" className="display">Coaching with {site.founder}.</h1>
              <p className="lede">{coaching.weeks} weeks of strength and physique coaching built around your actual week: a personal plan, a check-in every week, and adjustments as you progress.</p>
              <div className="actions"><Button href="#enquire" track="cta_enquire_hero" down>Enquire about coaching</Button></div>
            </div>
            <div className="offer" data-reveal>
              <Label>{coaching.offerName}</Label>
              <p className="price"><strong>{price}</strong><span>a week<br />{coaching.weeks} weeks · {coaching.currency}{coaching.total} total</span></p>
              <ul className="includes" style={{ borderColor: "rgba(16,17,19,.18)" }}>
                <li>A training plan built around your goal, available days and equipment</li>
                <li>One check-in with {site.founder} each week</li>
                <li>Adjustments as you progress, instead of starting over</li>
              </ul>
              <p style={{ marginTop: 24, fontSize: ".9375rem" }}>You&rsquo;ll see the written scope and payment terms before you commit. No payment is taken on this site.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="fit-title">
          <div className="wrap split">
            <div>
              <Label index="01">Who it&rsquo;s for</Label>
              <h2 id="fit-title" className="h2">Built for<br />real weeks.</h2>
            </div>
            <div>
              <p className="lede" style={{ maxWidth: "44ch" }}>For people who want to get stronger, build a physique they&rsquo;re proud of, and stop guessing what comes next, while fitting training around work and everything else.</p>
              <p style={{ color: "var(--text-2)", maxWidth: "52ch" }}>{site.founder} builds Blackglass around lifting, an interest in MMA, and the reality of training through a full work week. The idea is simple: the work you can repeat is the work that changes you.</p>
            </div>
          </div>
        </section>

        <section className="section begin" aria-labelledby="weeks-title">
          <div className="wrap">
            <div className="section-head"><Label index="02">How the {coaching.weeks} weeks run</Label><h2 id="weeks-title" className="h2">A clear start.<br />A reason to stay.</h2></div>
            <ol className="steps">
              <li data-reveal><span className="step-n">01</span><h3>Start where you are</h3><p>Tell {site.founder} your goal, schedule and training setup. Your plan starts from there.</p></li>
              <li data-reveal><span className="step-n">02</span><h3>Follow your plan</h3><p>Know what each session asks of you, and record the work.</p></li>
              <li data-reveal><span className="step-n">03</span><h3>Check in and adjust</h3><p>Weekly feedback keeps the training useful as you progress.</p></li>
            </ol>
          </div>
        </section>

        <section className="section" id="enquire" aria-labelledby="enq-title">
          <div className="wrap split">
            <div>
              <Label index="03">Enquire</Label>
              <h2 id="enq-title" className="h2">Tell {site.founder} what<br />you&rsquo;re working towards.</h2>
              <p className="section-intro">{site.founder} reads every enquiry and replies by email, or by text if you leave your number. Enquiring doesn&rsquo;t commit you to anything.</p>
              <div className="contact-direct">
                <a href={`sms:${contact.phone}`}>Text {contact.phoneDisplay}</a>
                <a href={`tel:${contact.phone}`}>Call {site.founder}</a>
                <a href={`mailto:${contact.email}?subject=${encodeURIComponent("Blackglass coaching")}`}>{contact.email}</a>
              </div>
            </div>
            <form className="form-card" data-form="enquiry" data-email={contact.email} data-founder={site.founder} noValidate>
              <h2>Coaching enquiry</h2>
              <div className="row2">
                <div className="field"><label htmlFor="e-name">Your name</label><input id="e-name" name="name" type="text" autoComplete="name" maxLength={80} required /></div>
                <div className="field"><label htmlFor="e-email">Email address</label><input id="e-email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} required /></div>
              </div>
              <div className="field"><label htmlFor="e-phone">Mobile for a text reply<span className="opt">OPTIONAL</span></label>
                <input id="e-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} /><span className="hint">Only used to reply to this enquiry.</span></div>
              <div className="field"><label htmlFor="e-route">What are you looking for?</label>
                <select id="e-route" name="route" defaultValue="coaching"><option value="coaching">{coaching.weeks}-week coaching ({price}/week)</option><option value="programme">A personal training programme</option></select></div>
              <div className="field"><label htmlFor="e-goal">What do you want to change?</label>
                <textarea id="e-goal" name="goal" rows={4} maxLength={600} required placeholder="Your goal, where you're at, and what has been getting in the way" /><span className="hint">Please don&rsquo;t include medical details. {site.founder} will ask what&rsquo;s relevant.</span></div>
              <div className="trap" aria-hidden="true"><label htmlFor="e-website">Leave blank</label><input id="e-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
              <button className="btn btn-primary" type="submit"><span>Send my enquiry</span>
                <svg className="arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" /></svg></button>
              <p className="form-note">No payment is taken here. {site.founder} uses these details only to reply. <a href="/privacy">Privacy</a></p>
              <div className="msg" data-form-msg role="status" aria-live="polite" hidden />
            </form>
          </div>
        </section>

        <section className="section" aria-labelledby="cq-title" style={{ paddingTop: 0 }}>
          <div className="wrap faq-grid">
            <div className="section-head"><Label>Questions</Label><h2 id="cq-title" className="h2">Good to<br />know.</h2></div>
            <Faqs items={coachingFaq} />
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={crumbs} />
    </>
  );
}
