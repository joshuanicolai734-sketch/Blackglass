/* eslint-disable @next/next/no-html-link-for-pages -- Home requires a document load to initialize its static interactions. */
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Privacy | Blackglass", description: "How Blackglass handles coaching enquiries." };

export default function Privacy() {
  return <div className="privacy-page">
    <header className="simple-header"><a className="brand" href="/"><Image className="brand-lockup" src="/brand/blackglass-lockup.svg" alt="Blackglass" width={216} height={36} unoptimized /></a><a href="/">BACK TO SITE ↗</a></header>
    <main className="simple-content">
      <span className="simple-kicker">BLACKGLASS / PRIVACY</span>
      <h1>YOUR DETAILS.<br />YOUR CHOICE.</h1>
      <p>Blackglass is run by Josh in Dunedin, New Zealand. This notice covers the enquiry form on this website. For privacy questions or requests, email <a href="mailto:Joshuanicolai@live.com">Joshuanicolai@live.com</a>.</p>
      <h2>What you send</h2>
      <p>The form collects your name, email address, the service you are asking about, and the goal you write. You can also add a mobile number if you would like a text reply. Please avoid putting sensitive medical information in the free-text field. A successful submission is stored in the site’s enquiry database.</p>
      <h2>Why it is used</h2>
      <p>Josh uses the details to respond by email or text, discuss coaching or a programme, and track the status of that conversation. He will text you only if you provide a mobile number. Enquiries are visible only in an owner sign-in area. Blackglass does not sell your enquiry details or use them for a marketing mailing list.</p>
      <h2>Storage and your choices</h2>
      <p>The site uses its hosting provider to store enquiries. Details are kept while needed for the conversation and any resulting service or records, then removed when no longer needed. You can ask Josh for access, correction, or deletion at the email above. If the form does not work, you can email directly instead.</p>
      <h2>The app</h2>
      <p>The Android app preview on this website is informational. The app’s own data handling will need its own notice before a public release.</p>
      <p><a href="/">← Back to Blackglass</a></p>
    </main>
  </div>;
}
