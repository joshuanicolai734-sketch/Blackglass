import type { MetadataRoute } from "next";
import { TOOLS } from "@/content/tools";
import { coaching, site } from "@/content/site";

// Indexable pages only. /links is noindex (it repeats the homepage's links) and /admin is private.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/get", "/movements", ...(coaching.available ? ["/coaching"] : []), "/tools", ...TOOLS.map((t) => t.href), "/privacy"];
  return pages.map((path) => ({ url: new URL(path, site.url).toString() }));
}
