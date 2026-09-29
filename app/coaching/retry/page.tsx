/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/site/chrome";
import { EnquiryForm, retryFrom } from "@/components/site/forms";
import { coaching, site } from "@/content/site";

// Where a no-JavaScript enquiry lands when the server couldn't save it. The URL carries the reason and the field at
// fault, never what was typed; the form is focused (the #enquire fragment) and the field at fault takes focus.
export const metadata: Metadata = { title: "Coaching enquiry", robots: { index: false, follow: true } };

export default async function Retry({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!coaching.available) notFound();
  const retry = retryFrom(await searchParams);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/coaching" />
      <main id="main">
        <section className="page-hero" aria-labelledby="retry-title" data-sec>
          <div className="wrap split">
            <div>
              <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/coaching">Coaching</a></nav>
              <h1 id="retry-title" className="display">One more try.</h1>
              <p className="body-2">{site.founder} reads every enquiry and replies by email, or by text if you leave your number. Enquiring doesn&rsquo;t commit you to anything.</p>
            </div>
            <EnquiryForm retry={retry} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
