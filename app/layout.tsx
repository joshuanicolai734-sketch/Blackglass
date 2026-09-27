import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blackglass — Train with intent",
  description: "12 weeks of strength and physique coaching with Josh in Dunedin, New Zealand. A personal training plan, weekly check-ins, and adjustments as you progress. Founding coaching NZ$59/week.",
  metadataBase: new URL("https://blackglass.co.nz"),
  alternates: { canonical: "https://blackglass.co.nz" },
  openGraph: {
    title: "Blackglass — Train with intent",
    description: "A personal training plan, weekly coaching, and purposeful progress. Founding coaching NZ$59/week for 12 weeks.",
    type: "website",
    images: [{ url: "/og-image-1200x630.png", width: 1200, height: 630, alt: "Blackglass" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image-1200x630.png"] },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#101113" };

// This runs before the body is painted, so an anchor or reduced-motion visit
// reaches the destination without a frame of the opening sequence.
const introGate = `(() => {
  try {
    if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.dataset.skipIntro = 'true';
    } else {
      window.__blackglassIntroStart = performance.now();
    }
  } catch (_) {
    window.__blackglassIntroStart = performance.now();
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: introGate }} /></head>
      <body>{children}</body>
    </html>
  );
}
