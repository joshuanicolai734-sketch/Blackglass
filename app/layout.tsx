import type { Metadata, Viewport } from "next";
import "./tokens.css";
import "./site.css";
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

// Runs before first paint: marks that scripts run, so no-JS visitors get the complete static page. On a
// cross-document view transition it also names the arriving page's preview button "cta", so the tapped /get button
// morphs into it. Arriving from a /get button tap (a session flag set by site.js), a phone whose button would sit
// below the fold first brings the form into view, so the morph lands on screen instead of flying off it. The name is
// set through a constructed stylesheet, not an attribute, so React's hydration sees the markup it rendered.
const jsGate = `document.documentElement.classList.add('js');addEventListener('pagereveal',function(e){var f;try{f=sessionStorage.getItem('bg-cta');sessionStorage.removeItem('bg-cta')}catch(x){}if(!e.viewTransition)return;var b=document.querySelector('[data-vt-cta]');if(!b)return;var r=b.getBoundingClientRect();if(f&&r.bottom>innerHeight&&!location.hash){b.closest('form').scrollIntoView({block:'end'});r=b.getBoundingClientRect()}if(r.bottom>0&&r.top<innerHeight&&document.adoptedStyleSheets){var c=new CSSStyleSheet();c.replaceSync('[data-vt-cta]{view-transition-name:cta}');document.adoptedStyleSheets=document.adoptedStyleSheets.concat(c);e.viewTransition.finished.then(function(){document.adoptedStyleSheets=document.adoptedStyleSheets.filter(function(x){return x!==c})})}})`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsGate }} />
        <link rel="preload" href="/fonts/inter-tight-latin-wght.woff2" as="font" type="font/woff2" crossOrigin="" />
        {/* The enhancement layer: runs once per document at DOMContentLoaded, without waiting for hydration. */}
        <script src="/site.js" defer />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
