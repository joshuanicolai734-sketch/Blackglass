// Checks for the own-account hosting code: clip byte ranges (lib/byte-range.ts) and Cloudflare Access tokens
// (lib/access-jwt.ts). Run: node --experimental-strip-types scripts/check-hosting.mjs
import assert from "node:assert/strict";
import { rangeResponse } from "../lib/byte-range.ts";
import { accessKeys, importAccessKeys, tokenKid, verifyAccessJwt } from "../lib/access-jwt.ts";

let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log(`ok  ${name}`);
}

// --- Byte ranges ---
const body = new Uint8Array(1000).map((_, i) => i % 251).buffer;
const clip = { body, type: "video/mp4", etag: '"v1"', lastModified: "Wed, 01 Oct 2026 00:00:00 GMT", cacheControl: null };
const ask = (headers = {}, method = "GET") => rangeResponse(clip, { method, headers: new Headers(headers) });
const bytes = async (r) => new Uint8Array(await r.arrayBuffer());

await check("bytes=0-99 → 206, 100 bytes, Content-Range", async () => {
  const r = ask({ Range: "bytes=0-99" });
  assert.equal(r.status, 206);
  assert.equal(r.headers.get("Content-Range"), "bytes 0-99/1000");
  assert.deepEqual(await bytes(r), new Uint8Array(body.slice(0, 100)));
});
await check("open-ended and suffix ranges", async () => {
  assert.equal(ask({ Range: "bytes=990-" }).headers.get("Content-Range"), "bytes 990-999/1000");
  assert.equal(ask({ Range: "bytes=-10" }).headers.get("Content-Range"), "bytes 990-999/1000");
});
await check("overlong end is clamped; start past the end is 416", async () => {
  assert.equal(ask({ Range: "bytes=0-5000" }).headers.get("Content-Range"), "bytes 0-999/1000");
  const r = ask({ Range: "bytes=1000-" });
  assert.equal(r.status, 416);
  assert.equal(r.headers.get("Content-Range"), "bytes */1000");
  assert.equal(ask({ Range: "bytes=-0" }).status, 416);
});
await check("no, malformed or invalid Range → 200 whole file with Accept-Ranges", async () => {
  for (const h of [{}, { Range: "bytes=abc" }, { Range: "items=0-1" }, { Range: "bytes=0-1,5-6" }, { Range: "bytes=5-2" }, { Range: "bytes=1500-1200" }]) {
    const r = ask(h);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("Accept-Ranges"), "bytes");
    assert.equal((await bytes(r)).length, 1000);
  }
});
await check("If-Range: strong match → 206; stale, weak or other date → 200", async () => {
  assert.equal(ask({ Range: "bytes=0-1", "If-Range": '"v1"' }).status, 206);
  assert.equal(ask({ Range: "bytes=0-1", "If-Range": "Wed, 01 Oct 2026 00:00:00 GMT" }).status, 206);
  assert.equal(ask({ Range: "bytes=0-1", "If-Range": '"v0"' }).status, 200);
  assert.equal(ask({ Range: "bytes=0-1", "If-Range": 'W/"v1"' }).status, 200);
  assert.equal(ask({ Range: "bytes=0-1", "If-Range": "Thu, 02 Oct 2026 00:00:00 GMT" }).status, 200);
});
await check("If-None-Match → 304; HEAD has headers and no body", async () => {
  assert.equal(ask({ "If-None-Match": '"v1"' }).status, 304);
  assert.equal(ask({ "If-None-Match": 'W/"v1", "x"' }).status, 304);
  const h = ask({ Range: "bytes=0-99" }, "HEAD");
  assert.equal(h.status, 206);
  assert.equal(h.headers.get("Content-Length"), "100");
  assert.equal((await bytes(h)).length, 0);
});

// --- Cloudflare Access tokens ---
const team = "blackglass.cloudflareaccess.com";
const aud = "app-aud-tag";
const alg = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
const gen = () => crypto.subtle.generateKey({ ...alg, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, true, ["sign", "verify"]);
const real = await gen();
const other = await gen();
const jwk = { ...(await crypto.subtle.exportKey("jwk", real.publicKey)), kid: "k1" };
const keys = await importAccessKeys({ keys: [jwk] });
const b64u = (buf) => Buffer.from(buf).toString("base64url");
const now = Math.floor(Date.now() / 1000);
async function token(claims, { key = real.privateKey, kid = "k1", algName = "RS256" } = {}) {
  const h = b64u(JSON.stringify({ alg: algName, kid, typ: "JWT" }));
  const p = b64u(JSON.stringify(claims));
  const sig = await crypto.subtle.sign(alg, key, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(sig)}`;
}
const good = { aud: [aud], iss: `https://${team}`, exp: now + 600, nbf: now - 5, email: "owner@example.com" };
const verify = (t) => verifyAccessJwt(t, { team, aud, keys });

await check("a valid Access token gives its email", async () => {
  assert.equal(await verify(await token(good)), "owner@example.com");
  assert.equal(await verify(await token({ ...good, aud })), "owner@example.com"); // aud as a string
});
await check("wrong audience, issuer or expiry → null", async () => {
  assert.equal(await verify(await token({ ...good, aud: ["other-app"] })), null);
  assert.equal(await verify(await token({ ...good, iss: "https://evil.cloudflareaccess.com" })), null);
  assert.equal(await verify(await token({ ...good, exp: now - 1 })), null);
  assert.equal(await verify(await token({ ...good, nbf: now + 3600 })), null);
  assert.equal(await verify(await token({ ...good, email: undefined })), null);
});
await check("wrong key, unknown kid, unsigned or garbage → null", async () => {
  assert.equal(await verify(await token(good, { key: other.privateKey })), null);
  assert.equal(await verify(await token(good, { kid: "k2" })), null);
  const [h, p] = (await token(good)).split(".");
  assert.equal(await verify(`${b64u(JSON.stringify({ alg: "none", kid: "k1" }))}.${p}.`), null);
  assert.equal(await verify(`${h}.${p}.`), null);
  assert.equal(await verify("not-a-token"), null);
  assert.equal(await verify("a.b.c"), null);
});
await check("an unknown key id refetches Access keys, at most once per 30 s", async () => {
  let fetches = 0;
  const fakeFetch = async () => { fetches++; return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 }); };
  const t0 = 1_000_000_000_000;
  const t = "refetch-check.cloudflareaccess.com";
  await accessKeys(t, fakeFetch, { now: t0 });
  await accessKeys(t, fakeFetch, { kid: "k1", now: t0 + 1_000 }); // known key: cached
  await accessKeys(t, fakeFetch, { kid: "k9", now: t0 + 10_000 }); // unknown, but fetched under 30 s ago: cached
  assert.equal(fetches, 1);
  await accessKeys(t, fakeFetch, { kid: "k9", now: t0 + 31_000 }); // unknown after 30 s: fetched again
  assert.equal(fetches, 2);
  await accessKeys(t, fakeFetch, { kid: "k1", now: t0 + 31_000 + 9 * 60_000 }); // known, within 10 min: cached
  assert.equal(fetches, 2);
  await accessKeys(t, fakeFetch, { now: t0 + 31_000 + 11 * 60_000 }); // 10 min old: fetched again
  assert.equal(fetches, 3);
  assert.equal(tokenKid(await token(good)), "k1");
  assert.equal(tokenKid("not-a-token"), null);
});

console.log(`\n${passed} checks passed.`);
