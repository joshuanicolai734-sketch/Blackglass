/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import { androidDownload, coaching, contact, nav, site, socialLinks } from "@/content/site";
import { Arrow, Button } from "./ui";

/** The app's primary call to action follows `content/site.ts → app`: a waitlist until there's a real download. */
export const hasDownload = Boolean(androidDownload);
export const appCta = hasDownload ? "Get Blackglass" : "Join the preview list";

export function Header({ current, result = false }: { current?: string; result?: boolean }) {
  const onGet = current === "/get";
  const onCoaching = current === "/coaching";
  const getTarget = !onGet ? "/get" : `${result ? "/get" : ""}#${hasDownload ? "android" : "preview"}`;
  return (
    <header className="hdr">
      <a className="hdr-brand" href="/" aria-label="Blackglass home">
        {/* eslint-disable-next-line @next/next/no-img-element -- vector lockup */}
        <img className="hdr-lockup" src="/brand/blackglass-lockup.svg" alt="" width="157" height="26" />
        {/* eslint-disable-next-line @next/next/no-img-element -- vector mark for narrow phones */}
        <img className="hdr-mark" src="/brand/blackglass-mark.svg" alt="" width="30" height="30" />
      </a>
      <nav className="hdr-nav" aria-label="Main">
        {nav.map((item) => (
          <a key={item.href} className="link" href={item.href} aria-current={current === item.href ? "page" : undefined}><span>{item.label}</span></a>
        ))}
      </nav>
      {/* On coaching pages the header's action leads to the enquiry form. */}
      {onCoaching ? (
        <a className="btn btn-ghost btn-sm hdr-cta" href={result ? "/coaching#enquire" : "#enquire"} data-track="cta_enquire_header">
          <span>Enquire</span><Arrow down={!result} />
        </a>
      ) : (
        // On /get it jumps to the form or install steps; on the result page it returns to /get first.
        // Phones show a short label whose visible words are always in the accessible name.
        <a className="btn btn-ghost btn-sm hdr-cta" href={getTarget}
          data-track={onGet && !hasDownload ? "cta_preview_header" : "cta_get_header"}>
          {hasDownload ? <span>{appCta}</span> : <span><span className="hdr-cta-long">Join the preview list</span><span className="hdr-cta-short">Preview list</span></span>}<Arrow down={onGet && !result} />
        </a>
      )}
      {/* A native disclosure, so the menu works before (and without) JavaScript. */}
      <details className="menu">
        <summary aria-label="Menu"><span className="menu-bars" aria-hidden="true" /></summary>
        <div className="menu-sheet">
          <nav aria-label="Mobile">
            <a href="/">Home</a>
            {nav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
            <a href="/get" data-track="cta_get_menu">{appCta}</a>
          </nav>
          <p className="menu-note label">Built in {site.location.split(",")[0]} · <a className="inline-link" href={`mailto:${contact.email}`}>Email {site.founder}</a></p>
        </div>
      </details>
    </header>
  );
}

/** The footer is a colophon: what, where and how to reach Josh, as label–value rows. */
export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-grid">
        <div className="ftr-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- vector lockup */}
          <img src="/brand/blackglass-lockup.svg" alt="Blackglass" width="241" height="40" loading="lazy" />
          <dl className="colophon label">
            <dt>Made in</dt><dd>{site.location}</dd>
            <dt>At</dt><dd>45°52′S 170°30′E</dd>
            <dt data-clock-row hidden>Local</dt><dd data-clock-row data-clock hidden />
            <dt>Line</dt><dd>{site.tagline}</dd>
          </dl>
        </div>
        <nav className="ftr-col" aria-label="Product">
          <p className="label">Blackglass</p>
          <a href="/#how-it-works">How it works</a>
          <a href="/get">{hasDownload ? "Get Blackglass" : "Preview list"}</a>
          <a href="/#questions">Questions</a>
        </nav>
        {coaching.available && (
          <nav className="ftr-col" aria-label="Coaching">
            <p className="label">Coaching</p>
            <a href="/coaching">Coaching with {site.founder}</a>
            <a href="/coaching#enquire">Make an enquiry</a>
          </nav>
        )}
        <nav className="ftr-col" aria-label="Contact">
          <p className="label">Contact</p>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={`sms:${contact.phone}`}>Text {contact.phoneDisplay}</a>
          {socialLinks.map((s) => (
            <a key={s.key} href={s.href} rel="me noopener" target="_blank">{s.label}</a>
          ))}
        </nav>
      </div>
      <div className="wrap ftr-base label">
        <span>© <span data-year>2026</span> Blackglass</span>
        <a href="/privacy">Privacy</a>
      </div>
    </footer>
  );
}

/**
 * Phone-only action bar. It drives in once the hero has left view and loads out while the fork, a form or the
 * footer is on screen (public/site.js). It ships `hidden`, so without JavaScript it simply isn't there.
 */
export function StickyCta({ enquire = false }: { enquire?: boolean }) {
  return (
    <aside className="sticky-cta" aria-label="Quick actions" data-sticky suppressHydrationWarning>
      {enquire ? (
        <Button href="#enquire" track="cta_enquire_sticky" down>Enquire about coaching</Button>
      ) : (
        <>
          <Button href="/get" track="cta_get_sticky">{appCta}</Button>
          {coaching.available && <Button href="/coaching" variant="ghost" track="cta_coaching_sticky">Coaching</Button>}
        </>
      )}
    </aside>
  );
}
