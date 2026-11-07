// Worker entry for Blackglass's own Cloudflare account. Movement Studio clips are routed here first (wrangler
// `assets.run_worker_first` in vite.config.ts) so ranges come back as 206 (lib/byte-range.ts); every other request goes
// to vinext's handler unchanged.
import handler from "vinext/server/fetch-handler";
import { rangeResponse } from "../lib/byte-range";

const CLIP = /^\/movements\/[a-z0-9-]+\.mp4$/;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (env.ASSETS && CLIP.test(url.pathname) && (request.method === "GET" || request.method === "HEAD")) {
      const asset = await env.ASSETS.fetch(new Request(url.toString(), { method: "GET" }));
      if (!asset.ok) return asset;
      return rangeResponse({
        body: await asset.arrayBuffer(),
        type: asset.headers.get("Content-Type") || "video/mp4",
        etag: asset.headers.get("ETag"),
        lastModified: asset.headers.get("Last-Modified"),
        cacheControl: asset.headers.get("Cache-Control"),
      }, request);
    }
    return handler.fetch!(request, env, ctx);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
