/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Footer, Header } from "@/components/site/chrome";
import { PreviewForm, retryFrom, typedFrom } from "@/components/site/forms";

// Where a no-JavaScript sign-up lands when the server couldn't save it. The URL carries the reason and the field at
// fault, never what was typed (that returns in a two-minute HttpOnly cookie, read here to pre-fill the form); the form is focused (the #preview fragment) and the field at fault takes focus.
export const metadata: Metadata = { title: "Join the preview list", robots: { index: false, follow: true } };

export default async function Retry({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const retry = retryFrom(await searchParams);
  const typed = typedFrom((await cookies()).get("bg-retry")?.value);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/get" />
      <main id="main">
        <section className="page-hero get-hero" aria-labelledby="retry-title" data-sec>
          <div className="wrap split">
            <div>
              <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/get">Get Blackglass</a></nav>
              <h1 id="retry-title" className="display">{retry.error === "duplicate" ? "Already received." : "One more try."}</h1>
              <p className="body-2">The preview list is free: one email when there&rsquo;s an Android build you can try.</p>
            </div>
            <div><PreviewForm retry={retry} typed={typed} /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
