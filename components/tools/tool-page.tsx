import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site/chrome";
import { SectionHead } from "@/components/site/ui";

/** The training tools, in the order the hub lists them. `page` names the visit count in db/events.ts. */
export const TOOLS = [
  { href: "/tools/plates", page: "tool_plates", name: "Plate calculator", line: "Which plates go on each side for any weight, with the nearest loads when it can’t be made exactly." },
  { href: "/tools/one-rep-max", page: "tool_1rm", name: "One-rep max and RPE", line: "Estimate your 1RM from any set, then the load for the reps and effort you’re planning next." },
  { href: "/tools/warm-up", page: "tool_warmup", name: "Warm-up builder", line: "A ramp from the empty bar to your working weight, with the plates for every set." },
  { href: "/tools/rest-timer", page: "tool_timer", name: "Rest timer", line: "A big, glanceable countdown that keeps time when your phone sleeps, with sound and vibration." },
  { href: "/tools/volume", page: "tool_volume", name: "Weekly volume", line: "Hard sets per muscle from a week of training, against the range the evidence supports." },
] as const;

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
      <main id="main" data-page={page}>
        <section className="page-hero tool-hero" data-sec>
          <div className="wrap">
            <SectionHead title={<a className="inline-link" href="/tools">Training tools</a>} meta={name} />
            <h1 className="display">{title}</h1>
            <p className="body-2">{intro}</p>
            <p className="tool-privacy">Free · Nothing you enter is saved or shared</p>
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
