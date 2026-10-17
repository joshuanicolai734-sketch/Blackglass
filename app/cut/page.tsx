/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { Button, JsonLd, SectionHead, SpecCard } from "@/components/site/ui";
import { cutFaq } from "@/content/faq";
import { coaching, cutPlan, site } from "@/content/site";
import { KCAL_FLOOR, KCAL_FLOOR_PER_KG, MIN_TARGET_BF, optimalRatePct, proteinPerKgFfm, SETS_PER_MUSCLE_MIN, WEEKS_BEFORE_BREAK } from "@/lib/cut/protocol";
import { CutCalculator } from "./calculator";

const price = `${cutPlan.currency}${cutPlan.price}`;
const pct = (n: number) => n.toFixed(2).replace(/0$/, "");

export const metadata: Metadata = {
  title: "Blackglass Cut: lose fat, keep the muscle",
  description: `An eight-week fat-loss plan you run yourself, from Blackglass in Dunedin: your calories and protein, training for 3 to 6 days a week, and a weekly check-in. Free calculator; the full plan is ${price}.`,
  alternates: { canonical: "/cut" },
  openGraph: { title: "Blackglass Cut", description: "Lose fat at the fastest rate that keeps your muscle. A free calculator and an eight-week plan you run yourself.", url: "/cut" },
};

export default function Cut() {
  if (!cutPlan.available) notFound();
  const store = cutPlan.storeUrl;
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
    { "@type": "ListItem", position: 2, name: "Cut", item: `${site.url}/cut` },
  ] };
  const product = store ? {
    "@context": "https://schema.org", "@type": "Product", name: cutPlan.name,
    description: "An eight-week fat-loss plan you run yourself: calories, protein, training and a weekly check-in.",
    brand: { "@type": "Brand", name: site.name },
    offers: { "@type": "Offer", price: cutPlan.price, priceCurrency: "NZD", url: store, availability: "https://schema.org/InStock" },
  } : null;
  const rows = [10, 15, 20, 25, 30, 35];

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/cut" />
      <main id="main" data-page="cut">
        <section className="page-hero" aria-labelledby="cut-title" data-sec>
          <div className="wrap split">
            <div>
              <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / Cut</nav>
              <h1 id="cut-title" className="display">Cut. Keep the muscle.</h1>
              <p className="body-2">An eight-week fat-loss plan you run yourself: your calories and protein, training for 3 to 6 days a week, and a check-in every week that tells you when to change something, and when not to.</p>
              <div className="actions">
                {store && <Button href={store} track="cta_cut_hero">{`Get the plan · ${price}`}</Button>}
                <Button href="#calculator" variant={store ? "ghost" : "primary"} down>Free calculator</Button>
              </div>
            </div>
            <div className="offer paper">
              <SectionHead title={cutPlan.name} meta={`${cutPlan.weeks} weeks + 1`} />
              <div className="price">
                <p className="monument">{cutPlan.price}</p>
                <p className="price-labels label"><span>{cutPlan.currency} once</span><span>PDF · {cutPlan.pages} pages</span></p>
              </div>
              <ul className="includes">
                <li>Your calories, protein and weekly rate, worked out step by step</li>
                <li>Four training splits for 3 to 6 days a week, with a no-gym swap for every exercise</li>
                <li>A weekly check-in, with clear rules for when to change</li>
                <li>A maintenance week, an example day of eating, and logs</li>
              </ul>
              <p className="body-2" style={{ marginTop: 24 }}>{store ? `Sold and delivered by ${cutPlan.storeName ?? "an online store"}: the download arrives as soon as you pay.` : "Not on sale yet. The calculator is free to use now."}</p>
              {store && <div className="actions"><Button href={store} track="cta_cut_offer">Get the plan</Button></div>}
            </div>
          </div>
        </section>

        <section className="section" id="calculator" aria-labelledby="calc-title" data-sec>
          <div className="wrap">
            <div className="section-head">
              <SectionHead index="01" title="Free calculator" meta="Nothing is sent or saved" />
              <h2 id="calc-title" className="display">Your week-one numbers.</h2>
              <p className="body-2">Calories, protein and a nine-week projection, from the same protocol the plan uses. The plan adds the training and the weekly rules.</p>
            </div>
            <CutCalculator storeUrl={store} price={price} coachingHref={coaching.available ? "/coaching" : null} />
          </div>
        </section>

        <section className="section" aria-labelledby="method-title" data-sec>
          <div className="wrap">
            <div className="section-head"><SectionHead index="02" title="The method" meta="05 rules" /><h2 id="method-title" className="display">Lose fat. Keep the muscle.</h2></div>
            <ol className="steps cut-rules">
              <SpecCard as="li" index="01" title="0.5 to 1% a week"><p>Matched to your body fat, and slower as you lean out: lean people lose more muscle at the same deficit.</p></SpecCard>
              <SpecCard as="li" index="02" title="Protein for your muscle"><p>2.2 to 2.6 g per kg of lean mass a day, rising as you get leaner.</p></SpecCard>
              <SpecCard as="li" index="03" title="Train hard, keep the volume"><p>At least {SETS_PER_MUSCLE_MIN} hard sets per muscle a week. Holding your strength is the sign the muscle is staying.</p></SpecCard>
              <SpecCard as="li" index="04" title="A planned break"><p>A week at maintenance after every {WEEKS_BEFORE_BREAK} weeks of deficit.</p></SpecCard>
              <SpecCard as="li" index="05" title="A floor that wins"><p>Never below {KCAL_FLOOR.toLocaleString("en-NZ")} kcal a day or {KCAL_FLOOR_PER_KG} per kg of bodyweight, even when it makes you slower.</p></SpecCard>
            </ol>
            <div className="cut-ref">
              <table className="cut-table">
                <caption className="label">The protocol by body fat</caption>
                <thead><tr><th scope="col">Body fat</th><th scope="col">Rate, men</th><th scope="col">Rate, women</th><th scope="col">Protein, men</th><th scope="col">Protein, women</th></tr></thead>
                <tbody>{rows.map((bf) => (
                  <tr key={bf}><th scope="row">{bf}%</th><td>{pct(optimalRatePct(bf, "male"))}%/wk</td><td>{pct(optimalRatePct(bf, "female"))}%/wk</td><td>{proteinPerKgFfm(bf, "male").toFixed(1)} g/kg</td><td>{proteinPerKgFfm(bf, "female").toFixed(1)} g/kg</td></tr>
                ))}</tbody>
              </table>
              <p className="footnote">Rate as % of bodyweight a week; protein per kg of lean mass. Why not faster: in a study of elite athletes, losing 0.7% a week took off more fat (31% of fat mass against 21%) than losing 1.4% a week, and kept more muscle (Garthe et al., 2011).</p>
            </div>
          </div>
        </section>

        <section className="section paper" aria-labelledby="fit-title" data-sec>
          <div className="wrap split">
            <div>
              <SectionHead index="03" title="Before you start" />
              <h2 id="fit-title" className="display">Is it for you?</h2>
              <p className="body-2">For adults in reasonable health who want to lose fat and keep their muscle. Nobody watches your numbers week to week, so it&rsquo;s deliberately cautious, and it never aims below {MIN_TARGET_BF.male}% body fat for men or {MIN_TARGET_BF.female}% for women.</p>
            </div>
            <div>
              <p className="title">It isn&rsquo;t for you if</p>
              <ul className="includes">
                <li>you&rsquo;re under 18</li>
                <li>you&rsquo;re pregnant, trying to get pregnant, or breastfeeding</li>
                <li>you have, or have had, an eating disorder or a hard relationship with food</li>
                <li>you have diabetes, or heart, kidney or liver disease, or take medicine that affects appetite, blood sugar or blood pressure</li>
              </ul>
              <p className="body-2" style={{ marginTop: 24 }}>Talk to your GP instead. Need to talk? Free call or text 1737, any time. Eating disorder support: EDANZ, 0800 2 EDANZ (0800 233 269).</p>
            </div>
          </div>
        </section>

        <section className="section faq-end" aria-labelledby="cut-q-title" data-sec>
          <div className="wrap faq-grid">
            <div className="section-head"><SectionHead title="Questions" meta={`${String(cutFaq.length).padStart(2, "0")} answers`} /><h2 id="cut-q-title" className="display">Good to know.</h2></div>
            <Faqs items={cutFaq} />
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={crumbs} />
      {product && <JsonLd data={product} />}
    </>
  );
}
