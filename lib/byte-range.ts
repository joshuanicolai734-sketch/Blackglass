/**
 * Byte ranges for the Movement Studio clips (RFC 9110 §14).
 *
 * Cloudflare's static asset server answers `Range: bytes=…` with the whole file (200), and the Movement Studio player
 * only seeks inside `video.seekable`, so scrubbing fails unless clips come back as 206 Partial Content. The Worker entry
 * (worker/index.ts) reads the clip from the asset binding and answers ranges here. That covers every browser, including
 * the in-app browsers that never run the clip service worker.
 *
 * Supported: one range per request (media stacks never ask for more), open-ended and suffix forms, 416 when the range
 * can't be satisfied (it starts past the end, or asks for the last 0 bytes), If-Range (a strong ETag must match exactly,
 * or a date must equal Last-Modified; otherwise the whole file is sent), If-None-Match (304), and HEAD. A malformed or
 * invalid range (such as bytes=5-2, whose end is before its start) is ignored and the whole file sent, as RFC 9110 §14.2
 * allows.
 */

export type Clip = {
  body: ArrayBuffer;
  type: string;
  etag: string | null;
  lastModified: string | null;
  cacheControl: string | null;
};

export function ifRangeHolds(value: string | null, clip: Clip): boolean {
  if (!value) return true;
  const v = value.trim();
  if (v.startsWith('"')) return !!clip.etag && !clip.etag.startsWith("W/") && v === clip.etag;
  if (v.startsWith("W/")) return false;
  return !!clip.lastModified && v === clip.lastModified;
}

function etagMatches(header: string | null, etag: string | null): boolean {
  if (!header || !etag) return false;
  const bare = (t: string) => t.trim().replace(/^W\//, "");
  return header.trim() === "*" || header.split(",").some((t) => bare(t) === bare(etag));
}

export function rangeResponse(clip: Clip, request: { method: string; headers: Headers }): Response {
  const size = clip.body.byteLength;
  const base: Record<string, string> = {
    "Content-Type": clip.type,
    "Accept-Ranges": "bytes",
    "Cache-Control": clip.cacheControl || "public, max-age=0, must-revalidate",
  };
  if (clip.etag) base.ETag = clip.etag;
  if (clip.lastModified) base["Last-Modified"] = clip.lastModified;
  const head = request.method === "HEAD";

  if (etagMatches(request.headers.get("If-None-Match"), clip.etag)) return new Response(null, { status: 304, headers: base });

  const range = ifRangeHolds(request.headers.get("If-Range"), clip) ? request.headers.get("Range") : null;
  const m = range ? /^bytes=(\d*)-(\d*)$/.exec(range.trim()) : null;
  if (!m || (m[1] === "" && m[2] === "")) {
    return new Response(head ? null : clip.body, { status: 200, headers: { ...base, "Content-Length": String(size) } });
  }
  if (m[1] !== "" && m[2] !== "" && Number(m[2]) < Number(m[1])) {
    return new Response(head ? null : clip.body, { status: 200, headers: { ...base, "Content-Length": String(size) } });
  }
  let start: number;
  let end: number;
  if (m[1] === "") {
    start = Math.max(0, size - Number(m[2])); // suffix range: the last N bytes
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${size}` } });
  }
  return new Response(head ? null : clip.body.slice(start, end + 1), {
    status: 206,
    headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
  });
}
