/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Button, TextLink } from "@/components/site/ui";
import { coaching, site } from "@/content/site";

// Where a no-JavaScript preview-list sign-up lands once the server has saved it. It confirms a sign-up in general
// terms, so a shared or bookmarked link claims nothing about whoever opens it.
export const metadata: Metadata = { title: "Preview list sign-up received", robots: { index: false, follow: true } };

export default function Joined() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/get" />
      <main id="main">
        <section className="page-hero result" aria-labelledby="joined-title" data-sec>
          <div className="wrap">
            <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/get">Get Blackglass</a> / Sign-up received</nav>
            <h1 id="joined-title" className="display">Sign-up received.</h1>
            <div className="msg is-ok result-msg" role="status">
              <p>This page confirms a preview-list sign-up. {site.founder} will email the address that was given when there&rsquo;s an Android build you can try. No newsletter, and you can ask to be removed at any time.</p>
            </div>
            <p className="body-2 result-next"><strong>Next:</strong> there&rsquo;s nothing else to do. {coaching.available ? <>If you&rsquo;d rather not wait for the app, <a href="/coaching">coaching with {site.founder}</a> is available now, with any phone.</> : "Watch for the email."}</p>
            <div className="actions">
              <Button href="/#how-it-works" variant="ghost">See how the app works</Button>
              {coaching.available && <TextLink href="/coaching">{`Coaching with ${site.founder}`}</TextLink>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
