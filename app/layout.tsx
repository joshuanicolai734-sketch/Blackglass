import type { Metadata, Viewport } from "next";
import "./tokens.css";
import "./globals.css";
import "./site.css";
import SiteEffects from "./site-effects";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Blackglass — Train with intent", template: "%s | Blackglass" },
  description: "Blackglass keeps your programme, today's session, movement guides and food targets in one clear Android app, built in Dunedin, New Zealand.",
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "en_NZ", type: "website" },
  twitter: { card: "summary_large_image" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#101113", colorScheme: "dark" };

// Runs before first paint. The intro plays only on the homepage, at most once per tab session, and never
// for deep links, campaign links or reduced motion, so a visitor never sees the page and then an intro.
// `?intro=1` forces it; `?intro=0` skips it. html[data-intro] is the only state; CSS reads it.
const introGate = `(function(){var d=document.documentElement;d.classList.add('js');try{var l=location,q=l.search,f=/[?&]intro=1/.test(q);
if(l.pathname!=='/'||(!f&&(/[?&](intro=0|utm_[a-z]+=)/.test(q)||l.hash||sessionStorage.getItem('bg-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)))return;
sessionStorage.setItem('bg-intro','1');d.dataset.intro='play'}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
        <link rel="preload" href="/fonts/inter-tight-latin-wght.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        {children}
        <SiteEffects />
      </body>
    </html>
  );
}
