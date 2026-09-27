import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Label } from "@/components/site/ui";
import { contact, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Blackglass collects through this website, why, and how to ask for access or deletion.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="page-hero">
          <div className="wrap">
            <Label>Privacy</Label>
            <h1 className="display">Your details. Your choice.</h1>
            <p className="lede">{site.name} is run by {site.founder} in {site.location}. This notice covers this website: the coaching enquiry form, the Android preview list and the site&rsquo;s visit counts.</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: 64 }}>
          <div className="wrap prose">
            <h2>What you send</h2>
            <p><strong>Coaching enquiries</strong> collect your name, email address, what you&rsquo;re looking for and the goal you write. You can add a mobile number if you&rsquo;d like a text reply. Please don&rsquo;t include medical information.</p>
            <p><strong>The Android preview list</strong> collects your name and email address, and anything you choose to add about what you want from a training app.</p>
            <h2>Why it&rsquo;s used</h2>
            <p>{site.founder} uses these details to reply to you, to discuss coaching or a programme, and to email preview-list members when there&rsquo;s an Android build to try. You&rsquo;ll only be texted if you give a mobile number. Your details are never sold or used for a marketing mailing list.</p>
            <h2>Where it&rsquo;s kept</h2>
            <p>Submissions are stored in the website&rsquo;s database with its hosting provider and are visible only in an owner sign-in area. They&rsquo;re kept while needed for the conversation, the preview and any resulting service or records, then removed.</p>
            <h2>Visit counts</h2>
            <p>The site counts a few actions, such as visits to the Get Blackglass page, button taps and completed forms, as daily totals, along with the campaign a visit came from (for example &ldquo;instagram&rdquo;). It sets no cookies, and stores no IP address, device identifier or anything you type into a form.</p>
            <h2>Your choices</h2>
            <p>Ask {site.founder} for access to, correction of, or deletion of your details at <a href={`mailto:${contact.email}`}>{contact.email}</a>. You can also leave the preview list at any time by emailing the same address.</p>
            <h2>The app</h2>
            <p>The Android app is in development. Its own handling of your training and food data will be described in a separate notice before any public release.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
