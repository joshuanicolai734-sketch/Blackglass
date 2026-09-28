/**
 * Blackglass site settings. Change app availability, links, prices, social accounts and campaign
 * destinations here; pages read from this file. See docs/MAINTAINING.md.
 */

export const site = {
  name: "Blackglass",
  url: "https://blackglass.co.nz",
  locale: "en-NZ",
  tagline: "Train with intent.",
  location: "Dunedin, New Zealand",
  founder: "Josh",
};

export const contact = {
  email: "Joshuanicolai@live.com",
  phone: "+64273279614",
  phoneDisplay: "027 327 9614",
};

export type PlatformStatus = "available" | "preview" | "unavailable";

/**
 * App availability. Only set a URL once it is live and checked.
 * - Android: set `playUrl` for a Play Store listing, or `apkUrl` (+ version, size, sha256) for a direct
 *   download. With neither set, /get offers the preview list instead of a download.
 */
export const app = {
  android: {
    status: "preview" as PlatformStatus,
    playUrl: null as string | null,
    apkUrl: null as string | null,
    apkVersion: null as string | null,
    apkSize: null as string | null,
    apkSha256: null as string | null,
    minAndroid: null as string | null,
  },
  ios: { status: "unavailable" as PlatformStatus },
  web: { status: "unavailable" as PlatformStatus },
};

export const androidDownload = app.android.playUrl ?? app.android.apkUrl;

/** Coaching is a real, paid service. Set `available: false` to hide coaching routes and CTAs. */
export const coaching = {
  available: true,
  offerName: "Founding coaching",
  weekly: 59,
  weeks: 12,
  currency: "NZ$",
  get total() { return this.weekly * this.weeks; },
};

/**
 * Social accounts. Add a full profile URL only after checking the account exists and is Blackglass's.
 * Empty accounts are never linked publicly.
 */
export const social: Record<"instagram" | "tiktok" | "youtube" | "facebook", string | null> = {
  instagram: null,
  tiktok: null,
  youtube: null,
  facebook: null,
};

export const socialLabels: Record<keyof typeof social, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
};

export const socialLinks = (Object.keys(social) as (keyof typeof social)[])
  .filter((k) => social[k])
  .map((k) => ({ key: k, label: socialLabels[k], href: social[k] as string }));

/** Primary navigation (kept short on purpose). */
export const nav = [
  { href: "/#how-it-works", label: "How it works" },
  ...(coaching.available ? [{ href: "/coaching", label: "Coaching" }] : []),
  { href: "/#questions", label: "Questions" },
];

/**
 * Campaign links. Scheme: utm_source = platform (instagram, tiktok, youtube, facebook, qr),
 * utm_medium = social | bio | qr, utm_campaign = launch_2026, utm_content = post id (e.g. p01_intro).
 */
export const campaign = "launch_2026";

export function utm(path: string, source: string, medium: string, content?: string) {
  const url = new URL(path, site.url);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

/** The QR code on /get opens this address on the visitor's phone. */
export const qrTarget = utm("/get", "qr", "qr", "desktop_handoff");
