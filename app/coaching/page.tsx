/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header, StickyCta } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { EnquiryForm, NextSteps } from "@/components/site/forms";
import { Button, JsonLd, SectionHead, SpecCard, TextLink } from "@/components/site/ui";
import { coachingFaq } from "@/content/faq";
import { coaching, contact, site } from "@/content/site";

const price = `${coaching.currency}${coaching.weekly}`;
const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const inWords = (n: number) => NUMBERS[n] ?? String(n);

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
      <StickyCta enquire />
      <main id="main" data-page="coaching">
        <section className="page-hero" aria-labelledby="coach-title" data-sec>
          <div className="wrap split">
            <div>
              <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / Coaching</nav>
              <h1 id="coach-title" className="display">{`Coaching with ${site.founder}.`}</h1>
              <p className="body-2">{coaching.weeks} weeks of strength and physique coaching built around your actual week: a personal plan, a check-in every week, and adjustments as you progress.</p>
              <div className="actions"><Button href="#enquire" track="cta_enquire_hero" down>Enquire about coaching</Button></div>
              <p className="label next-steps-label">What happens after you enquire</p>
              <NextSteps />
            </div>
            <div className="offer paper">
              <SectionHead title={coaching.offerName} meta="Dunedin" />
              <div className="price">
                <p className="monument">{coaching.weekly}</p>
                <p className="price-labels label"><span>{coaching.currency} a week</span><span>{coaching.weeks} weeks · {coaching.currency}{coaching.total} total</span></p>
              </div>
              <ul className="includes">
                <li>A training plan built around your goal, available days and equipment</li>
                <li>One check-in with {site.founder} each week</li>
                <li>Adjustments as you progress, instead of starting over</li>
              </ul>
              <p className="body-2" style={{ marginTop: 24 }}>You&rsquo;ll see the written scope and payment terms before you commit. No payment is taken on this site.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="fit-title" data-sec>
          <div className="wrap split">
            <div>
              <SectionHead index="01" title="Who it’s for" />
              <h2 id="fit-title" className="display">Built for real weeks.</h2>
            </div>
            <div>
              <p style={{ maxWidth: "36em" }}>For people who want to get stronger, build a physique they&rsquo;re proud of, and stop guessing what comes next, while fitting training around work and everything else.</p>
              <p className="body-2">{site.founder} lifts, has an interest in MMA, and trains around a full work week himself. Your plan is built the same way: around the days and time you actually have, because the work you can repeat is the work that changes you.</p>
            </div>
          </div>
        </section>

        <section className="section begin" aria-labelledby="weeks-title" data-sec>
          <div className="wrap">
            <div className="section-head"><SectionHead index="02" title={`How the ${coaching.weeks} weeks run`} meta="03 steps" /><h2 id="weeks-title" className="display">{`Week one to week ${inWords(coaching.weeks)}.`}</h2></div>
            <ol className="steps">
              <SpecCard as="li" index="01" title="Start where you are"><p>Tell {site.founder} your goal, schedule and training setup. Your plan starts from there.</p></SpecCard>
              <SpecCard as="li" index="02" title="Follow your plan"><p>Know what each session asks of you, and record the work.</p></SpecCard>
              <SpecCard as="li" index="03" title="Check in and adjust"><p>Weekly feedback keeps the training useful as you progress.</p></SpecCard>
            </ol>
          </div>
        </section>

        <section className="section enquire" aria-labelledby="enq-title" data-sec>
          <div className="wrap split">
            <div>
              <SectionHead index="03" title="Enquire" />
              <h2 id="enq-title" className="display">{`Tell ${site.founder} what you’re working towards.`}</h2>
              <p className="body-2" style={{ marginTop: 20 }}>{site.founder} reads every enquiry and replies by email, or by text if you leave your number. Enquiring doesn&rsquo;t commit you to anything.</p>
              <div className="contact-direct">
                <TextLink href={`sms:${contact.phone}`} arrow={false}>Text {contact.phoneDisplay}</TextLink>
                <TextLink href={`tel:${contact.phone}`} arrow={false}>Call {site.founder}</TextLink>
                <TextLink href={`mailto:${contact.email}?subject=${encodeURIComponent("Blackglass coaching")}`} arrow={false}>{contact.email}</TextLink>
              </div>
            </div>
<EnquiryForm />
          </div>
        </section>

        <section className="section" aria-labelledby="cq-title" data-sec>
          <div className="wrap faq-grid">
            <div className="section-head"><SectionHead title="Questions" meta={`${String(coachingFaq.length).padStart(2, "0")} answers`} /><h2 id="cq-title" className="display">Good to know.</h2></div>
            <Faqs items={coachingFaq} />
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={crumbs} />
    </>
  );
}
