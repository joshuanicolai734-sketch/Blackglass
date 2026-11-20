import type { Metadata } from "next";
import { Header, Footer, appCta, hasDownload } from "@/components/site/chrome";
import { coaching } from "@/content/site";
import { Button, SectionHead } from "@/components/site/ui";
import { TrainingExperience } from "@/components/site/training-experience";
import "./experience.css";

export const metadata: Metadata = {
  title: "Try the training flow",
  description: "Explore a working Blackglass browser demo: choose a movement, log example sets, use the rest timer and pick up where you left off.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <Header />
    <main id="main" className="experience-page">
      <section className="xp-hero wrap" aria-labelledby="experience-title">
        <SectionHead index="01" title="The training flow" meta="Interactive browser demo" />
        <div className="xp-intro"><h1 id="experience-title">The next rep.<br /><span>Nothing in the way.</span></h1><p>See the movement. Log a set. Take a breath.<br />Try the rhythm of Blackglass, right here.</p></div>
        <p className="xp-disclosure">An interactive concept using example numbers and authored movement artwork. Separate from the Android app{hasDownload ? "." : ", which is in development."}</p>
      </section>
      <section className="wrap xp-workspace" aria-label="Try a sample training session">
        <TrainingExperience appCta={appCta} />
      </section>
      <section className="wrap xp-next" aria-labelledby="xp-next-title">
        <div><p className="label">A clearer system for the work</p><h2 id="xp-next-title">Make room for consistency.</h2><p>{hasDownload ? "Get Blackglass for Android. The download page has the current build and install steps." : "The Android preview list is free. Hear when there is a build you can try."}</p></div>
        <div className="actions"><Button href="/get">{appCta}</Button>{coaching.available && <Button href="/coaching" variant="ghost">Explore coaching</Button>}</div>
      </section>
    </main>
    <Footer />
  </>;
}
