/* eslint-disable @next/next/no-html-link-for-pages -- Home requires a document load to initialize its static interactions. */
import type { Metadata } from "next";
import Image from "next/image";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { enquiriesDb, isOwner, type Enquiry } from "../../db/enquiries";
import StatusControl from "./StatusControl";
import { nzDay } from "../../db/events";

const routeLabels: Record<string, string> = { coaching: "COACHING", programme: "PROGRAMME", app: "ANDROID PREVIEW LIST" };
const eventLabels: Record<string, string> = {
  home_view: "Homepage visits", get_view: "Get Blackglass visits", coaching_view: "Coaching page visits", links_view: "Link-in-bio visits",
  preview_signup: "Preview list sign-ups", enquiry_sent: "Coaching enquiries", demo_engaged: "Used the app demo", teaser_open: "Opened the teaser",
  outbound_play: "Play Store taps", outbound_apk: "APK download taps",
  movements_view: "Movement Studio visits", movement_engaged: "Used the Movement Studio",
};
// The two money paths: taps that head for coaching (revenue now) and for the app (the preview list).
const COACH_TAPS = ["cta_coaching_hero", "cta_offer_coaching", "cta_fork_coaching", "cta_coaching_closer", "cta_coaching_home", "cta_enquire_hero", "cta_enquire_header", "cta_coaching_sticky", "cta_enquire_sticky", "links_coaching"];
const APP_TAPS = ["cta_get_header", "cta_get_menu", "cta_get_hero", "cta_offer_app", "cta_get_closer", "cta_get_steps", "cta_preview_anchor", "cta_preview_header", "cta_get_sticky", "links_get", "cta_movement_preview"];
type Activity = { name: string; source: string; total: number };

/** Last 30 days of site action counts, or none if the events table isn't there yet. */
async function loadActivity(): Promise<Activity[]> {
  try {
    const since = nzDay(new Date(Date.now() - 29 * 86_400_000));
    return (await enquiriesDb().prepare("SELECT name, source, SUM(count) AS total FROM events WHERE day >= ? GROUP BY name, source ORDER BY total DESC").bind(since).all<Activity>()).results || [];
  } catch {
    return [];
  }
}

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
  const activity = await loadActivity();
  const totals = new Map<string, number>();
  activity.forEach((a) => totals.set(a.name, (totals.get(a.name) || 0) + a.total));
  const sum = (names: string[]) => names.reduce((n, k) => n + (totals.get(k) || 0), 0);
  const ctaTaps = [...totals].filter(([k]) => k.startsWith("cta_") || k.startsWith("links_")).reduce((s, [, v]) => s + v, 0);
  const sources = new Map<string, number>();
  activity.filter((a) => a.name.endsWith("_view")).forEach((a) => sources.set(a.source, (sources.get(a.source) || 0) + a.total));
  const newCount = leads.filter((lead) => lead.status === "new").length;
  const clients = leads.filter((lead) => lead.status === "won").length;
  return (
    <div className="admin-page">
      <Header />
      <main className="simple-content admin-content">
        <span className="simple-kicker">BLACKGLASS / OWNER INBOX</span>
        <h1>TURN INTEREST<br />INTO ACTION.</h1>
        <p className="admin-intro">Reply to new enquiries, book a conversation, and update each status. This inbox shows the latest 100; it does not send email notifications.</p>
        <p className="lead-meta">Private backup (all records, not just the latest 100): <a href="/api/admin/export?kind=enquiries">DOWNLOAD ENQUIRIES ↓</a> · <a href="/api/admin/export?kind=events">DOWNLOAD ACTIVITY ↓</a>. Keep these files private; enquiries contain personal contact details.</p>
        <section className="admin-activity" aria-label="Site activity">
          <h2>Last 30 days</h2>
          <p className="lead-meta">Daily counts from the website: no cookies and no personal data. A tap on a download button is not an install.</p>
          <div className="admin-counts">
            {Object.entries(eventLabels).filter(([k]) => totals.has(k)).map(([k, label]) => <span key={k}>{totals.get(k)} · {label.toUpperCase()}</span>)}
            <span>{ctaTaps} · BUTTON TAPS</span>
          </div>
          <p className="lead-meta">Funnel: {sum(COACH_TAPS)} taps towards coaching → {totals.get("enquiry_sent") || 0} enquiries · {sum(APP_TAPS)} taps towards the app → {totals.get("preview_signup") || 0} preview sign-ups.</p>
          {sources.size > 0 && <p className="lead-meta">Visits by campaign source: {[...sources].map(([s, n]) => `${s === "none" ? "direct/other" : s} ${n}`).join(" · ")}</p>}
        </section>
        <div className="admin-counts"><span>{leads.length} ENQUIRIES SHOWN</span><span>{newCount} NEW</span><span>{clients} CLIENTS</span></div>
        {error ? <p className="admin-empty" role="alert">The inbox is temporarily unavailable. Please try again later.</p> :
          leads.length === 0 ? <p className="admin-empty">No enquiries yet. Share the site and ask prospective clients to use the form.</p> :
          <div className="lead-grid">{leads.map((lead) => (
            <article className="lead-card" key={lead.id}>
              <div className="lead-top"><div><h2>{lead.name}</h2><span className="lead-meta">{routeLabels[lead.route] || lead.route.toUpperCase()} · {new Date(lead.created_at).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", dateStyle: "medium", timeStyle: "short" })} NZ</span></div><StatusControl id={lead.id} initialStatus={lead.status} /></div>
              {lead.goal && <p>{lead.goal}</p>}
              <a href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent("Re: Blackglass enquiry")}`}>Reply to {lead.email} ↗</a>
              {lead.phone && <div className="lead-phone"><a href={`sms:${lead.phone.replace(/[^0-9+]/g, "")}`}>Text {lead.phone} ↗</a><a href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}>Call ↗</a></div>}
            </article>
          ))}</div>}
      </main>
    </div>
  );
}
