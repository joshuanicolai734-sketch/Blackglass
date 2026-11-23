import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { SectionHead } from "@/components/site/ui";
import { TOOLS } from "@/components/tools/tool-page";
import { ogBase } from "@/content/site";

const description = "Free training tools from Blackglass: a plate calculator, one-rep max and RPE estimates, a warm-up builder, a rest timer and a weekly volume check.";

export const metadata: Metadata = {
  title: "Training tools",
  description,
  alternates: { canonical: "/tools" },
  openGraph: { ...ogBase, title: "Training tools | Blackglass", description, url: "/tools", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

export default function ToolsPage() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/tools" />
      <main id="main" data-page="tools">
        <section className="page-hero tool-hero" data-sec>
          <div className="wrap">
            <SectionHead title="Training tools" meta="Free" />
            <h1 className="display">The maths between sets.</h1>
            <p className="body-2">Small tools for the gym floor: load the bar, plan the next set, warm up, rest and check your week. They work on your phone, without an account.</p>
            <p className="tool-privacy">Nothing you enter is saved or shared</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: 48 }} data-sec>
          <div className="wrap">
            <div className="tool-cards">
              {TOOLS.map((t, i) => (
                <a key={t.href} className="tool-card" href={t.href}>
                  <p className="label">0{i + 1}</p>
                  <h2>{t.name}</h2>
                  <p>{t.line}</p>
                  <span className="link"><span>Open</span></span>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section className="section" data-sec>
          <div className="wrap tool-method">
            <SectionHead title="About these tools" />
            <div className="prose">
              <p>They do the arithmetic lifters do in their heads, with the working shown on each page. Estimates are estimates: use them as a starting point and adjust to how the bar moves.</p>
              <p>The Android app is in development. These tools are separate from it and don&rsquo;t need it. <a href="/get">Join the preview list</a> to hear when there&rsquo;s a build to try.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
