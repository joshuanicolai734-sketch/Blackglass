/*
 * movement-clips-sw.js: makes Movement Studio clips seekable when the host
 * ignores HTTP Range requests (it answers 200 with the whole file).
 *
 * The browser's media stack asks for byte ranges; this worker fetches the
 * whole clip once (clips are ~100-170 KB; the host sends the whole file
 * anyway) and answers each range with a proper 206 Partial Content. Nothing
 * else on the site is intercepted, and nothing is stored in Cache Storage:
 * freshness stays with normal HTTP caching (ETag revalidation).
 */
const CLIP = /^\/movements\/[a-z0-9-]+\.mp4$/;
const memo = new Map(); // url -> Promise<{ buf, type }> for this worker's lifetime

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !CLIP.test(url.pathname)) return;
  event.respondWith(serve(event.request, url.pathname));
});

function whole(path) {
  if (!memo.has(path)) {
    memo.set(
      path,
      fetch(path, { credentials: 'same-origin' }).then(async (r) => {
        if (!r.ok) throw new Error(`clip ${r.status}`);
        return { buf: await r.arrayBuffer(), type: r.headers.get('Content-Type') || 'video/mp4' };
      }),
    );
    memo.get(path).catch(() => memo.delete(path));
  }
  return memo.get(path);
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
  const range = request.headers.get('Range');
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
