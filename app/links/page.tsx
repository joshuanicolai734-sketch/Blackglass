/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { Arrow } from "@/components/site/ui";
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
      <div className="ambient" data-ambient aria-hidden="true" />
      <div className="links-inner">
        <svg className="links-mark" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
          <path fill="#18191C" d="M7 22.101 22.101 7h43.798L81 22.101v43.798L65.899 81H22.101L7 65.899Z" />
          <path fill="#2B2D32" d="M73.45 14.55 65.899 7H22.101L7 22.101v43.798l7.55 7.551Z" />
          <path fill="#D5FF3F" d="M22.101 7H41L7 41V22.101Z" />
          <path fill="#F4F5EF" fillRule="evenodd" d="M0 18 18 0h52l18 18v52L70 88H18L0 70ZM7 22.101 22.101 7h43.798L81 22.101v43.798L65.899 81H22.101L7 65.899Z" />
        </svg>
        <h1>{site.name}</h1>
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
        <p className="links-foot">
          <a href={`mailto:${contact.email}`}>{contact.email}</a><br />
          <a href="/">blackglass.co.nz</a> · <a href="/privacy">Privacy</a>
        </p>
      </div>
    </main>
  );
}
