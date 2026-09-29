/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/site/chrome";
import { NextSteps } from "@/components/site/forms";
import { Button } from "@/components/site/ui";
import { coaching, site } from "@/content/site";

// Where a no-JavaScript coaching enquiry lands once the server has saved it. Worded as a confirmation page, so a
// shared link claims nothing about whoever opens it.
export const metadata: Metadata = { title: "Coaching enquiry received", robots: { index: false, follow: true } };

export default function Sent() {
  if (!coaching.available) notFound();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/coaching" />
      <main id="main">
        <section className="page-hero result" aria-labelledby="sent-title" data-sec>
          <div className="wrap">
            <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/coaching">Coaching</a> / Enquiry received</nav>
            <h1 id="sent-title" className="display">Enquiry received.</h1>
            <div className="msg is-ok result-msg" role="status">
              <p>This page confirms a coaching enquiry. Here&rsquo;s what happens next:</p>
            </div>
            <NextSteps />
            <div className="actions"><Button href="/coaching" variant="ghost">{`Back to coaching with ${site.founder}`}</Button></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
