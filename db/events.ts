/** Site action counts: daily totals per event and campaign source. See docs/MAINTAINING.md → Measurement. */

export const EVENTS = new Set([
  "home_view", "get_view", "coaching_view", "links_view",
  "cta_get_header", "cta_get_menu", "cta_get_hero", "cta_get_steps", "cta_get_closer",
  "cta_preview_anchor", "cta_coaching_home", "cta_enquire_hero",
  "cta_coaching_hero", "cta_offer_app", "cta_offer_coaching", "cta_fork_coaching", "cta_coaching_closer",
  "cta_get_sticky", "cta_preview_header", "cta_coaching_sticky", "cta_enquire_sticky", "cta_enquire_header",
  "links_get", "links_how", "links_coaching", "links_instagram", "links_tiktok", "links_youtube", "links_facebook",
  "outbound_play", "outbound_apk", "demo_engaged", "teaser_open",
  // Counted on the server when the database insert succeeds, never from the browser:
  "preview_signup", "enquiry_sent",
]);

export const BROWSER_EVENTS = new Set([...EVENTS].filter((e) => e !== "preview_signup" && e !== "enquiry_sent"));

export function cleanSource(value: unknown): string {
  const s = typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24) : "";
  return s || "none";
}

/** Today's date in New Zealand, e.g. 2026-10-02. */
export function nzDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(date);
}

export async function countEvent(db: D1Database, name: string, source: string): Promise<void> {
  if (!EVENTS.has(name)) return;
  await db.prepare("INSERT INTO events (day, name, source, count) VALUES (?, ?, ?, 1) ON CONFLICT(day, name, source) DO UPDATE SET count = count + 1")
    .bind(nzDay(), name, cleanSource(source)).run();
}
