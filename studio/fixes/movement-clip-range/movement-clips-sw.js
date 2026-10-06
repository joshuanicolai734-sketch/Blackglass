/*
 * movement-clips-sw.js: makes Movement Studio clips seekable when the host
 * ignores HTTP Range requests (it answers 200 with the whole file).
 *
 * The browser's media stack asks for byte ranges; this worker fetches the
 * whole clip once (clips are ~100-170 KB; the host sends the whole file
 * anyway) and answers each range with a proper 206 Partial Content. Nothing
 * else on the site is intercepted, and nothing is stored in Cache Storage:
 * freshness stays with normal HTTP caching (ETag revalidation).
 *
 * Version identity: every answer carries the clip's ETag/Last-Modified, a
 * held copy is refetched (a cheap 304 revalidation) after FRESH_MS, and an
 * If-Range that no longer matches gets the whole new file (200), so the
 * media stack never splices bytes from two versions of a clip.
 */
const CLIP = /^\/movements\/[a-z0-9-]+\.mp4$/;
const FRESH_MS = 30000;
const memo = new Map(); // path -> { at, clip: Promise<{ buf, type, etag, modified }> }

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !CLIP.test(url.pathname)) return;
  event.respondWith(serve(event.request, url.pathname));
});

function whole(path) {
  const held = memo.get(path);
  if (held && Date.now() - held.at < FRESH_MS) return held.clip;
  const clip = fetch(path, { credentials: 'same-origin' }).then(async (r) => {
    if (!r.ok) throw new Error(`clip ${r.status}`);
    return {
      buf: await r.arrayBuffer(),
      type: r.headers.get('Content-Type') || 'video/mp4',
      etag: r.headers.get('ETag'),
      modified: r.headers.get('Last-Modified'),
    };
  });
  const entry = { at: Date.now(), clip };
  memo.set(path, entry);
  clip.catch(() => memo.get(path) === entry && memo.delete(path));
  return clip;
}

// RFC 9110 13.1.5: a strong ETag must match exactly (weak tags never do), or a
// date must equal Last-Modified. Otherwise the Range is ignored.
function ifRangeHolds(value, clip) {
  if (!value) return true;
  value = value.trim();
  if (value.startsWith('"')) return !!clip.etag && !clip.etag.startsWith('W/') && value === clip.etag;
  if (value.startsWith('W/')) return false;
  return !!clip.modified && value === clip.modified;
}

async function serve(request, path) {
  let clip;
  try {
    clip = await whole(path);
  } catch {
    return fetch(request); // fall back to the network unchanged
  }
  const size = clip.buf.byteLength;
  const base = { 'Content-Type': clip.type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
  if (clip.etag) base.ETag = clip.etag;
  if (clip.modified) base['Last-Modified'] = clip.modified;
  const range = ifRangeHolds(request.headers.get('If-Range'), clip) ? request.headers.get('Range') : null;
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === '' && m[2] === '')) {
    return new Response(clip.buf.slice(0), { status: 200, headers: { ...base, 'Content-Length': String(size) } });
  }
  let start;
  let end;
  if (m[1] === '') {
    start = Math.max(0, size - Number(m[2])); // suffix range: last N bytes
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { ...base, 'Content-Range': `bytes */${size}` } });
  }
  return new Response(clip.buf.slice(start, end + 1), {
    status: 206,
    headers: { ...base, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) },
  });
}
