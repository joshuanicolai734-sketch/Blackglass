import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site/chrome";
import { SectionHead } from "@/components/site/ui";
import { TOOLS } from "@/content/tools";

export function ToolPage({ page, name, title, intro, children, method }: {
  page: (typeof TOOLS)[number]["page"];
  name: string;
  title: ReactNode;
  intro: ReactNode;
  children: ReactNode;
  method: ReactNode;
}) {
  const others = TOOLS.filter((t) => t.page !== page);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/tools" />
      <main id="main" className="tool-page" data-page={page}>
        <section className="page-hero tool-hero" data-sec>
          <div className="wrap">
            <SectionHead title={<a className="inline-link" href="/tools">Training tools</a>} meta={name} />
            <h1 className="display">{title}</h1>
            <p className="body-2">{intro}</p>
            <p className="tool-privacy">Free · No account · Nothing you enter is kept by Blackglass</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: 48 }} data-sec>
          <div className="wrap">{children}</div>
        </section>
        <section className="section" data-sec>
          <div className="wrap tool-method">
            <SectionHead title="How it works" />
            {method}
          </div>
        </section>
        <section className="section tool-more" data-sec>
          <div className="wrap">
            <SectionHead title="More tools" meta={<a className="inline-link" href="/tools">All tools</a>} />
            <div className="tool-cards">
              {others.map((t) => (
                <a key={t.href} className="tool-card" href={t.href}>
                  <h2>{t.name}</h2>
                  <p>{t.line}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** Reads one query value as a string (the first, if repeated). */
export const qs = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
