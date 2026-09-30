import type { Metadata } from "next";
import { appCta, Footer, hasDownload, Header } from "@/components/site/chrome";
import { MovementStudio } from "@/components/site/movement-studio";
import { Button, SectionHead, TextLink } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Movement Studio",
  description: `Explore Blackglass’s new back squat, deadlift and push-up movement artwork. Two views, slow playback and phase controls. ${hasDownload ? "Available for Android." : "Android app in development."}`,
  alternates: { canonical: "/movements" },
  openGraph: { title: "Blackglass — Movement Studio", description: "Three movement studies. Two views. Your pace.", url: "/movements", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass — Train with intent" }] },
};

export default function Movements() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" data-page="movements">
        <section className="page-hero movement-hero" aria-labelledby="movement-title" data-sec>
          <div className="wrap">
            <SectionHead index="01" title="Movement Studio" meta="03 movements / 02 views" />
            <h1 id="movement-title">See the whole movement.</h1>
            <p className="body-2">Choose a movement. Slow it down. Look from another angle.</p>
            <p className="label">New 3D artwork / {hasDownload ? "Available for Android" : "Android app in development"}</p>
          </div>
        </section>
        <section className="section movement-section" aria-label="Interactive movement previews" data-sec>
          <div className="wrap">
            <MovementStudio />
            <p className="footnote">Authored movement previews from the new Blackglass artwork, not Android screen recordings. They illustrate movement patterns; they do not assess your form. Playback starts when you choose Play.</p>
          </div>
        </section>
        <section className="section movement-next paper" aria-labelledby="movement-next-title" data-sec>
          <div className="wrap">
            <SectionHead index="02" title="Your next step" meta={hasDownload ? "Android app" : "Android preview"} />
            <h2 id="movement-next-title" className="display">Bring the plan and the movement together.</h2>
            <p className="body-2">{hasDownload ? "Get Blackglass on your Android phone. The download page has the current build and install steps." : "Blackglass is still in development. Join the free preview list to hear when there’s an Android build you can try."}</p>
            <div className="actions">
              <Button href="/get" track="cta_movement_preview">{appCta}</Button>
              <TextLink href="/#how-it-works">See the app screens</TextLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
