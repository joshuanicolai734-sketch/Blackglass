/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import { coaching, contact, nav, site, socialLinks } from "@/content/site";
import { Arrow } from "./ui";

export function Header({ current }: { current?: string }) {
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
          <a key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}>{item.label}</a>
        ))}
      </nav>
      <a className="btn btn-primary btn-sm hdr-cta" href="/get" data-track="cta_get_header"
        aria-current={current === "/get" ? "page" : undefined}>
        <span>Get Blackglass</span><Arrow />
      </a>
      {/* A native disclosure, so the menu works before (and without) JavaScript. */}
      <details className="menu">
        <summary aria-label="Menu"><span className="menu-bars" aria-hidden="true" /></summary>
        <div className="menu-sheet">
          <nav aria-label="Mobile">
            <a href="/">Home</a>
            {nav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
            <a href="/get" data-track="cta_get_menu">Get Blackglass</a>
          </nav>
          <p className="menu-note">Built in {site.location.split(",")[0]}. <a href={`mailto:${contact.email}`}>Email Josh</a></p>
        </div>
      </details>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-grid">
        <div className="ftr-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- vector lockup */}
          <img src="/brand/blackglass-lockup.svg" alt="Blackglass" width="241" height="40" loading="lazy" />
          <p>{site.tagline} Training, technique and food in one place. Built in {site.location}.</p>
        </div>
        <nav className="ftr-col" aria-label="Product">
          <p className="ftr-head">Blackglass</p>
          <a href="/#how-it-works">How it works</a>
          <a href="/get">Get Blackglass</a>
          <a href="/#questions">Questions</a>
        </nav>
        {coaching.available && (
          <nav className="ftr-col" aria-label="Coaching">
            <p className="ftr-head">Coaching</p>
            <a href="/coaching">Coaching with {site.founder}</a>
            <a href="/coaching#enquire">Make an enquiry</a>
          </nav>
        )}
        <nav className="ftr-col" aria-label="Contact">
          <p className="ftr-head">Contact</p>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={`sms:${contact.phone}`}>Text {contact.phoneDisplay}</a>
          {socialLinks.map((s) => (
            <a key={s.key} href={s.href} rel="me noopener" target="_blank">{s.label}</a>
          ))}
        </nav>
      </div>
      <div className="wrap ftr-base">
        <span>© <span data-year>2026</span> Blackglass</span>
        <a href="/privacy">Privacy</a>
        <button type="button" className="motion-toggle" data-motion-toggle aria-pressed="false" hidden>Pause background motion</button>
      </div>
    </footer>
  );
}
