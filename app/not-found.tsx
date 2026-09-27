import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Button, Label } from "@/components/site/ui";
import { coaching } from "@/content/site";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="nf">
        <div className="wrap">
          <Label>404</Label>
          <h1 className="display">Nothing here.</h1>
          <p className="lede">That page doesn&rsquo;t exist or has moved. These will get you back on track.</p>
          <div className="actions">
            <Button href="/get">Get Blackglass</Button>
            <Button href="/" variant="ghost">Home</Button>
            {coaching.available && <Button href="/coaching" variant="quiet">Coaching</Button>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
