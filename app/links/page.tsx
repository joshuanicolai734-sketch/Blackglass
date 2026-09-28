/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { Arrow } from "@/components/site/ui";
import { paths } from "@/content/brand";
import { app, coaching, contact, site, socialLinks } from "@/content/site";

const hasDownload = Boolean(app.android.playUrl || app.android.apkUrl);

export const metadata: Metadata = {
  title: "Links",
  description: "Get Blackglass, see how the app works, and coaching with Josh.",
  alternates: { canonical: "/links" },
  robots: { index: false, follow: true },
  openGraph: { title: "Blackglass", description: "Training, technique and food in one Android app. Built in Dunedin.", url: "/links", images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Blackglass" }] },
};

function Item({ href, title, note, primary, track }: { href: string; title: string; note: string; primary?: boolean; track: string }) {
  return (
    <a className={`btn ${primary ? "btn-primary" : "btn-ghost"}`} href={href} data-track={track}>
      <span>{title}<small>{note}</small></span><Arrow />
    </a>
  );
}

export default function Links() {
  return (
    <main className="links-page" data-page="links">
      <div className="links-inner">
        <svg className="links-mark" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
          <path fill="var(--c-pane)" d={paths.pane} /><path fill="var(--c-facet)" d={paths.facet} />
          <path fill="var(--c-volt)" d={paths.glint} /><path fill="var(--c-bone)" fillRule="evenodd" d={paths.rim} />
        </svg>
        <h1 className="display">{site.name}</h1>
        <p>Training, technique and food in one Android app. Built in Dunedin.</p>
        <div className="link-list">
          <Item primary href="/get" track="links_get" title="Get Blackglass"
            note={hasDownload ? "Android · download and install" : "Android · in development · preview list open"} />
          <Item href="/#how-it-works" track="links_how" title="See how the app works" note="Real screens from the Android build" />
          {coaching.available && <Item href="/coaching" track="links_coaching" title={`Coaching with ${site.founder}`}
            note={`${coaching.currency}${coaching.weekly} a week · ${coaching.weeks} weeks`} />}
          {socialLinks.map((s) => (
            <Item key={s.key} href={s.href} track={`links_${s.key}`} title={s.label} note="Follow Blackglass" />
          ))}
        </div>
        <p className="links-foot label">
          <a href={`mailto:${contact.email}`}>{contact.email}</a><br />
          <a href="/">blackglass.co.nz</a> · <a href="/privacy">Privacy</a>
        </p>
      </div>
    </main>
  );
}
