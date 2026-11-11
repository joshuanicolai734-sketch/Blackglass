declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** Static assets (wrangler `assets.binding`). The Worker entry reads Movement Studio clips through it. */
    ASSETS?: Fetcher;
    /** Cloudflare Access team domain, e.g. "blackglass.cloudflareaccess.com". Empty: owner sign-in uses ChatGPT headers. */
    CF_ACCESS_TEAM_DOMAIN?: string;
    /** Application audience (AUD) tag of the Access application protecting /admin and /api/admin. */
    CF_ACCESS_AUD?: string;
    /** "chatgpt-sites" only where the ChatGPT Sites edge sets the sign-in headers. Anywhere else they could be forged. */
    OWNER_AUTH?: string;
  }
}

declare module "virtual:vinext-worker-entry" {
  const handler: ExportedHandler<Cloudflare.Env>;
  export default handler;
}
