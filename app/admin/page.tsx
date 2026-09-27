/* eslint-disable @next/next/no-html-link-for-pages -- Home requires a document load to initialize its static interactions. */
import type { Metadata } from "next";
import Image from "next/image";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { enquiriesDb, isOwner, type Enquiry } from "../../db/enquiries";
import StatusControl from "./StatusControl";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Enquiries | Blackglass", robots: { index: false, follow: false } };

function Header() {
  return <header className="simple-header"><a className="brand" href="/"><Image className="brand-lockup" src="/brand/blackglass-lockup.svg" alt="Blackglass" width={216} height={36} unoptimized /></a><a href="/">BACK TO SITE ↗</a></header>;
}

export default async function Admin() {
  const user = await getChatGPTUser();
  if (!user) {
    return <div className="admin-page"><Header /><main className="simple-content admin-content"><span className="simple-kicker">OWNER / ENQUIRIES</span><h1>FOLLOW THE<br />CONVERSATION.</h1><p>Sign in to view coaching enquiries.</p><p><a href={chatGPTSignInPath("/admin")} target="_top">Sign in with ChatGPT ↗</a></p></main></div>;
  }
  if (!isOwner(user.email)) {
    return <div className="admin-page"><Header /><main className="simple-content admin-content"><span className="simple-kicker">OWNER / ENQUIRIES</span><h1>PRIVATE<br />AREA.</h1><p>This account cannot access the Blackglass enquiry inbox.</p></main></div>;
  }
  let leads: Enquiry[] = [];
  let error = false;
  try {
    const result = await enquiriesDb().prepare(
      "SELECT id, created_at, name, email, phone, route, goal, status FROM enquiries ORDER BY created_at DESC LIMIT 100"
    ).all<Enquiry>();
    leads = result.results || [];
  } catch {
    error = true;
  }
  const newCount = leads.filter((lead) => lead.status === "new").length;
  const clients = leads.filter((lead) => lead.status === "won").length;
  return (
    <div className="admin-page">
      <Header />
      <main className="simple-content admin-content">
        <span className="simple-kicker">BLACKGLASS / OWNER INBOX</span>
        <h1>TURN INTEREST<br />INTO ACTION.</h1>
        <p className="admin-intro">Reply to new enquiries, book a conversation, and update each status. This inbox shows the latest 100; it does not send email notifications.</p>
        <div className="admin-counts"><span>{leads.length} ENQUIRIES SHOWN</span><span>{newCount} NEW</span><span>{clients} CLIENTS</span></div>
        {error ? <p className="admin-empty" role="alert">The inbox is temporarily unavailable. Please try again later.</p> :
          leads.length === 0 ? <p className="admin-empty">No enquiries yet. Share the site and ask prospective clients to use the form.</p> :
          <div className="lead-grid">{leads.map((lead) => (
            <article className="lead-card" key={lead.id}>
              <div className="lead-top"><div><h2>{lead.name}</h2><span className="lead-meta">{lead.route.toUpperCase()} · {new Date(lead.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", dateStyle: "medium", timeStyle: "short" })} NZ</span></div><StatusControl id={lead.id} initialStatus={lead.status} /></div>
              <p>{lead.goal}</p>
              <a href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent("Re: Blackglass enquiry")}`}>Reply to {lead.email} ↗</a>
              {lead.phone && <div className="lead-phone"><a href={`sms:${lead.phone.replace(/[^0-9+]/g, "")}`}>Text {lead.phone} ↗</a><a href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}>Call ↗</a></div>}
            </article>
          ))}</div>}
      </main>
    </div>
  );
}
