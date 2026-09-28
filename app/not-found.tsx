import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Button, SectionHead, TextLink, Words } from "@/components/site/ui";
import { coaching } from "@/content/site";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="nf">
        <div className="wrap">
          <SectionHead index="404" title="Not found" />
          <h1 className="display"><Words>Nothing here.</Words></h1>
          <p className="body-2">That page doesn&rsquo;t exist or has moved. These will get you back on track.</p>
          <div className="actions">
            <Button href="/get">Get Blackglass</Button>
            <Button href="/" variant="ghost">Home</Button>
            {coaching.available && <TextLink href="/coaching">Coaching</TextLink>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
