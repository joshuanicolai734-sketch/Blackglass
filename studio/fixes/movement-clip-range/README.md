# Movement Studio: make clips seekable without host Range support

- Status: **proposed fix for the live v33 Site source, not applied anywhere.** This folder is a handoff for Gamma; this repository's runtime is unchanged.
- Author: Claude (independent critic), 6 October 2026
- Severity of the bug it fixes: BLOCKER for animation review on the live site (first reported on issue #7, 3 October)

## The bug (verified 6 October 2026)

- **The host:** blackglass.co.nz answers byte-range requests for every Movement Studio clip with `200` and the full file, with no `Accept-Ranges` header. Checked on all six `/movements/*.mp4` clips with `Range: bytes=0-99`.
- **The browser:** as a result, Chromium reports `video.seekable` as `[0, 0]`.
- **The player:** the live Movement Studio (bundle marker `data-media-recovery="seekable-range-v7"`) only seeks to a position inside `video.seekable`. So every scrub or phase jump stays at 0 s, and after 8 s shows "That position couldn't load. Try Reset, or open the clip directly below."

**A/B on the live player code:** the same `/movements` page and JS bundles were served locally, with only the server's Range behaviour changed. The clips were transcoded to VP9 because the test browser can't decode H.264.

| Server | `seekable` | Scrub 60 / 25 / 90 % → `currentTime` | Message |
| --- | --- | --- | --- |
| Ignores Range (like live) | `[0, 0]` | 0.00 / 0.00 / 0.00 s | "That position couldn't load…" |
| Supports Range | `[0, 4]` | 2.40 / 1.00 / 3.60 s | none |

The result is the same at 1280 px and on Pixel 7 emulation. Range support is the only variable.

## The fix

The fix is two small changes in the v33 source. **Neither touches the React player.**

1. **Add `movement-clips-sw.js`** to the Site's public root, so it is served at `/movement-clips-sw.js` as `text/javascript`.
   - It is a service worker, scoped to `/movements` only.
   - When the browser asks for a byte range of `/movements/<clip>.mp4`, it fetches the whole clip once and answers with a correct `206 Partial Content`. The clips are 98–168 KB, and the host already sends the whole file anyway.
   - It handles open-ended, suffix and out-of-range (`416`) requests.
   - It stores nothing in Cache Storage. Freshness stays with normal HTTP caching (ETag revalidation).
   - If the fetch fails, it falls back to the network unchanged.
2. **Append `site-js-append.js` to `public/site.js`.** It registers the worker on `/movements` pages only. A clip that finished loading before the worker took control (first visit) is reloaded once, only while paused.

**Why a worker and not the obvious client fix:** serving clips from `blob:` URLs makes them seekable too, and the first test seeked correctly. But the player checks `video.currentSrc` against the clip path and React owns the `src` prop. Swapping `src` outside React makes the next render reset it. That reloads the video and silently aborts **Play**: in testing, the Play button stopped working. Doing it properly means rewriting the player's source tracking and handling a race if Play is pressed before the blob arrives. The worker keeps every URL identical, so the player's own logic is untouched.

## Evidence

All runs used headless Chromium with every `/api/` request intercepted (0 reached any server) and `sendBeacon` stubbed.

- **Unmodified live player plus the worker**, served by a host that ignores Range:
  - Pixel 7 emulation and 1280 px, first visit and repeat visit, three runs each: 12 of 12 passed.
  - In every run: `seekable [0, 4]`, scrubs land at 2.40 / 1.00 / 3.60 s, the Play button plays, and no error message appears.
- **All three movements** (back squat, deadlift, push-up) and both camera views: scrubbing to 75 % lands at 3.00 s.
- **Range edge cases through the worker** (85,011-byte clip):

  | Request | Response |
  | --- | --- |
  | `bytes=0-` | 206, whole clip |
  | `bytes=100-199` | 206, 100 bytes |
  | `bytes=-500` | 206, last 500 bytes |
  | Overlong end | clamped |
  | `bytes=85011-` | 416 |
  | Malformed | 200, whole clip |

- **Scope:** the home page is not controlled by the worker. The direct clip link (`/movements/push-up-front.mp4`) still opens with `200 video/mp4`.
- **On the real live origin**, with the worker injected by test-browser routing and nothing deployed: it registers and controls `/movements`. For the live 146,583-byte clip it returns `206` for `0-99`, `1000-` and `-200`, while the direct network answer is still `200`. The live page has no Content-Security-Policy header and no Trusted Types policy, so registration isn't blocked.

## Not verified

- **iPhone Safari:** not tested; the test environment has no WebKit. Safari is known to need `206` responses for MP4. Serving them from a service worker is the usual workaround, but confirm on an iPhone.
- **Real H.264 decoding** of the original clips during seeking: the test browser can't decode H.264, so the A/B used VP9 copies of the same clips (same 4 s, 24 fps, single keyframe).
- **Firefox:** not tested.
- **The production deploy itself:** whether the Sites host serves the new file at the root with a JavaScript MIME type. Check it after deploying with `curl -I https://blackglass.co.nz/movement-clips-sw.js`.

## How to check after deploying (2 minutes, on a phone)

1. **Server side:** run `curl -sI https://blackglass.co.nz/movement-clips-sw.js`. Expect `200` and `content-type: text/javascript` (or `application/javascript`).
2. **Android Chrome:** open `/movements` and drag the Rep position slider. The clip should follow without "That position couldn't load". Reload, and it should still work.
3. **iPhone Safari:** repeat step 2. If clips don't play at all there today, check that too: it would mean the missing Range support was also blocking Safari playback.

## Rollback

Replace `/movement-clips-sw.js` with `rollback-sw.js`, which unregisters itself, and remove the snippet from `site.js`.

## Better long-term fix (rejected for now)

The best fix is Range support on the host for `/movements/*.mp4`: answer `206` with `Accept-Ranges: bytes`. Cloudflare's static asset serving normally does this. Its absence suggests the Sites/Vinext layer serves these files through code that drops the `Range` header. That's out of reach from this repository and couldn't be tested here. If Gamma can fix it in the host route, the worker becomes harmless but unnecessary and can be rolled back as above.
