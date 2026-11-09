// Checks that this source still reproduces the public site as published at Sites v34, against the 7 Nov 2026
// snapshot in studio/reference/sites-v34-2026-11-07/, apart from the approved changes listed in CHANGES below.
// Read-only, and it never contacts the live site.
//
//   pnpm build && pnpm check:v34                      compiled CSS, static files, movement media, opening maths
//   pnpm check:v34 --pages http://127.0.0.1:8787      also every page a local build serves (run pnpm start first)
//
// The maths checks import the snapshot's own compiled force-model chunk, and the pure functions cut from its handoff
// chunk (no DOM, no network), and compare them with components/site/force-model.ts. Exit code 1 if anything differs.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { clamp, FORCE_PHASES, forceFrame, ForceTimeline, handoffFrame, measureHandoff, receiptAnchors } from "../components/site/force-model.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snap = path.join(root, "studio/reference/sites-v34-2026-11-07");
const args = process.argv.slice(2);
const base = args.includes("--pages") ? args[args.indexOf("--pages") + 1]?.replace(/\/$/, "") : null;
let passed = 0;
let failed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`ok    ${name}`);
  } catch (error) {
    failed++;
    console.log(`FAIL  ${name}\n      ${String(error.message).split("\n").slice(0, 8).join("\n      ")}`);
  }
}
const read = (file) => fs.readFileSync(file);
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

// ---- Approved changes from v34 ----
// The only ways this source differs from what v34 served. Each check below applies them to the snapshot first, so
// any other difference still fails, and each `from` must appear in the snapshot exactly once.
// 12 px text on the home page: BG-002 item 1, approved by Josh on 9 Nov 2026 (v34 used 9 to 11 px here).
// Link-preview titles that match the page titles on / and /links: approved by Josh on 9 Nov 2026.
// A "too many requests" message for HTTP 429 on the enquiry forms: PR #10's reviewed patch (pnpm check:enquiry).
const HOME_TITLE = "Blackglass — Training, technique and food in one app";
const UNSURE = "          : 'We couldn’t confirm whether this was received. Your answers are still here. You can try again, or send it by email instead.', false, a);";
const CHANGES = {
  "static/site.js": [
    [UNSURE, "          : status === 429\n            ? 'Too many requests right now. Your answers are still here. Please try again later, or send it by email instead.'\n  " + UNSURE],
  ],
  "css/page": [
    [".home-principles .home-principle-screen{text-transform:uppercase;margin-top:15px;font-size:.6875rem}", ".home-principles .home-principle-screen{text-transform:uppercase;margin-top:15px;font-size:.75rem}"],
    [".home-coach-copy .price-labels{gap:4px;font-size:.6875rem;line-height:1.5}", ".home-coach-copy .price-labels{gap:4px;font-size:.75rem;line-height:1.5}"],
    [".home-hero-bottomline{gap:10px;font-size:.625rem}", ".home-hero-bottomline{gap:10px;font-size:.75rem}"],
    [".home-hero-topline{gap:10px;padding-bottom:19px;font-size:.625rem}", ".home-hero-topline{gap:10px;padding-bottom:19px;font-size:.75rem}"],
    [".home-motion-chapter>summary>.label{flex-basis:100%;font-size:.625rem}", ".home-motion-chapter>summary>.label{flex-basis:100%;font-size:.75rem}"],
    [".home-v2 .home-demo .demo-tabs button{gap:5px;font-size:.6875rem}", ".home-v2 .home-demo .demo-tabs button{gap:5px;font-size:.75rem}"],
  ],
  "css/force-opening": [
    [".bg-force .no-js-note{font:500 11px/1.5 var(--mono)}", ".bg-force .no-js-note{font:500 12px/1.5 var(--mono)}"],
    [".bg-force .phase-controls button span{font:500 10px var(--mono);", ".bg-force .phase-controls button span{font:500 12px var(--mono);"],
    [".bg-force .time{white-space:nowrap;color:var(--dim);font:500 10px var(--mono);", ".bg-force .time{white-space:nowrap;color:var(--dim);font:500 12px var(--mono);"],
    [".bg-force .time{min-width:70px;font-size:9px}", ".bg-force .time{min-width:70px;font-size:12px}"],
  ],
  "page/home": [
    ['<meta property="og:title" content="Blackglass — One session. Then the next."/>', `<meta property="og:title" content="${HOME_TITLE}"/>`],
    ['<meta name="twitter:title" content="Blackglass — One session. Then the next."/>', `<meta name="twitter:title" content="${HOME_TITLE}"/>`],
  ],
  "page/links": [
    ['<meta property="og:title" content="Blackglass"/>', '<meta property="og:title" content="Links | Blackglass"/>'],
    ['<meta name="twitter:title" content="Blackglass"/>', '<meta name="twitter:title" content="Links | Blackglass"/>'],
  ],
};
function withChanges(key, text) {
  for (const [from, to] of CHANGES[key] ?? []) {
    assert.equal(text.split(from).length - 1, 1, `${key}: v34 should contain this exactly once: ${from}`);
    text = text.replace(from, () => to);
  }
  return text;
}
const changes = (key) => (CHANGES[key] ? ` with its ${CHANGES[key].length} approved change${CHANGES[key].length === 1 ? "" : "s"}` : "");

// ---- Compiled stylesheets: byte-identical to v34, approved changes applied ----
for (const name of ["index", "page", "force-opening"]) {
  await check(`stylesheet ${name}.*.css is byte-identical to v34${changes(`css/${name}`)}`, () => {
    const dir = path.join(root, "dist/client/_next/static/css");
    if (!fs.existsSync(dir)) throw new Error("no build output: run pnpm build first");
    const built = fs.readdirSync(dir).filter((f) => f.startsWith(`${name}.`) && f.endsWith(".css"));
    const live = fs.readdirSync(path.join(snap, "files/_next/static/css")).find((f) => f.startsWith(`${name}.`));
    assert.equal(built.length, 1, `expected one ${name}.*.css in the build, found ${built.length}`);
    const expected = withChanges(`css/${name}`, fs.readFileSync(path.join(snap, "files/_next/static/css", live), "utf8"));
    const actual = fs.readFileSync(path.join(dir, built[0]), "utf8");
    let at = 0;
    while (at < expected.length && expected[at] === actual[at]) at++;
    assert.ok(actual === expected, `${built[0]} differs from v34's ${live} at character ${at}:\n v34:  ${expected.slice(Math.max(0, at - 60), at + 60)}\n ours: ${actual.slice(Math.max(0, at - 60), at + 60)}`);
  });
}

// ---- Static files: identical to what v34 served ----
await check(`site.js, intro.js, brand SVGs, share image and curl poster are identical to v34 (site.js${changes("static/site.js")})`, () => {
  for (const file of ["site.js", "intro.js", "brand/blackglass-lockup.svg", "brand/blackglass-mark.svg", "og/home.png", "movements/curl-study/three-quarter-setup.png"]) {
    const saved = read(path.join(snap, "files", file));
    const expected = CHANGES[`static/${file}`] ? Buffer.from(withChanges(`static/${file}`, saved.toString("utf8"))) : saved;
    assert.ok(read(path.join(root, "public", file)).equals(expected), `public/${file} differs from the snapshot`);
  }
});

// ---- Movement media: v34's manifest (exported from Android 91.0-industrial) ----
await check("movement clips and posters match public/movements/manifest.json and the snapshot", () => {
  const manifest = JSON.parse(read(path.join(root, "public/movements/manifest.json")));
  assert.equal(manifest.source_version, "91.0-industrial");
  assert.equal(manifest.output.length, 12);
  for (const entry of manifest.output) {
    const buffer = read(path.join(root, "public/movements", entry.file));
    assert.equal(buffer.length, entry.bytes, `${entry.file}: size`);
    assert.equal(sha256(buffer), entry.sha256, `${entry.file}: SHA-256`);
    const saved = path.join(snap, "files/movements", entry.file);
    if (fs.existsSync(saved)) assert.ok(buffer.equals(read(saved)), `${entry.file} differs from the snapshot`);
  }
});

// ---- The force opening's maths: equal to v34's compiled chunk ----
const chunks = path.join(snap, "files/_next/static/chunks");
const modelChunk = pathToFileURL(path.join(chunks, fs.readdirSync(chunks).find((f) => f.startsWith("force-model-")))).href;
const v34 = await import(modelChunk);
await check("forceFrame equals v34 for both layouts at 1,045 progress values each", () => {
  for (const layout of ["desktop", "mobile"]) {
    for (let i = -20; i <= 1020; i++) assert.deepEqual(forceFrame(i / 1000, layout), v34.a(i / 1000, layout), `${layout} at ${i / 1000}`);
    for (const odd of [NaN, Infinity, -Infinity, undefined]) assert.deepEqual(forceFrame(odd, layout), v34.a(odd, layout));
  }
  assert.deepEqual(forceFrame(0.5), v34.a(0.5));
});
await check("receipt anchors, chapters and clamp equal v34", () => {
  for (const layout of ["desktop", "mobile", undefined]) assert.deepEqual(receiptAnchors(layout), v34.i(layout));
  assert.deepEqual(JSON.parse(JSON.stringify(FORCE_PHASES)), v34.t);
  for (const value of [-1, 0, 0.5, 1, 2, NaN]) assert.equal(clamp(value), v34.r(value));
  assert.equal(clamp(5, 2, 4), v34.r(5, 2, 4));
});
await check("ForceTimeline equals v34 over 10,000 random operations", () => {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const layout of ["desktop", "mobile"]) {
    const ours = new ForceTimeline({ layout });
    const theirs = new v34.n({ layout });
    for (let step = 0; step < 5000; step++) {
      const r = random();
      const op = r < 0.1 ? ["play"] : r < 0.15 ? ["pause"] : r < 0.2 ? ["seek", random() * 1.2 - 0.1] : r < 0.22 ? ["finish"]
        : r < 0.32 ? ["block", ["hidden", "offscreen", "intro"][Math.floor(random() * 3)], random() < 0.5] : ["advance", random() < 0.02 ? -5 : random() * 120];
      ours[op[0]](...op.slice(1));
      theirs[op[0]](...op.slice(1));
      assert.deepEqual([ours.progress, ours.intent, ours.running, ours.duration, [...ours.blockers].sort()],
        [theirs.progress, theirs.intent, theirs.running, theirs.duration, [...theirs.blockers].sort()], `${layout}, step ${step}: ${op.join(" ")}`);
    }
  }
});

// ---- The scroll handoff's maths: equal to the pure functions in v34's handoff chunk ----
await check("measureHandoff and handoffFrame equal v34 over 4,000 random layouts", async () => {
  const file = path.join(chunks, fs.readdirSync(chunks).find((f) => f.startsWith("force-product-handoff-")));
  const source = fs.readFileSync(file, "utf8");
  const from = source.indexOf("o=(e,t,n)=>e+(t-e)*n");
  const to = source.indexOf("function u(e){");
  assert.ok(from > 0 && to > from, "the handoff chunk no longer has the expected shape");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "check-v34-"));
  const extracted = path.join(tmp, "handoff.mjs");
  fs.writeFileSync(extracted, `import{a as r,r as i}from${JSON.stringify(modelChunk)};var ${source.slice(from, to)}export{c as measure,l as frame};`);
  const original = await import(pathToFileURL(extracted).href);
  fs.rmSync(tmp, { recursive: true, force: true });
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const box = () => ({ top: random() * 3000, left: random() * 400, width: 200 + random() * 1300, height: 100 + random() * 900 });
  for (let k = 0; k < 4000; k++) {
    const input = { art: box(), pane: box(), origin: box(), viewport: 500 + random() * 600, mobile: random() < 0.5 };
    const ours = measureHandoff(input);
    assert.deepEqual(ours, original.measure(input));
    for (let j = 0; j < 12; j++) {
      const p = random() * 1.4 - 0.2;
      assert.deepEqual(handoffFrame(p, ours), original.frame(p, ours));
    }
  }
});

// ---- Pages served by a local build: same text, classes, metadata and markup as v34 ----
const PAGES = {
  "/": "home", "/movements": "movements", "/coaching": "coaching", "/get": "get", "/links": "links", "/privacy": "privacy",
  "/get/joined": "get_joined", "/coaching/sent": "coaching_sent", "/this-page-does-not-exist": "this-page-does-not-exist",
};
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const body = (html) => html.split(/<body[^>]*>/)[1].replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
const text = (html) => decode(body(html).replace(/<[^>]+>/g, " ")).split(/\s+/).filter(Boolean).join(" ");
const classes = (html) => [...new Set([...body(html).matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean))].sort();
function meta(html) {
  const head = html.split("</head>")[0];
  const out = { title: decode(head.match(/<title>(.*?)<\/title>/)?.[1] ?? "") };
  for (const m of head.matchAll(/<meta ([^>]+)>/g)) {
    const key = m[1].match(/(?:name|property)="([^"]+)"/)?.[1];
    const value = m[1].match(/content="([^"]*)"/)?.[1];
    if (key && value !== undefined) out[key] = decode(value);
  }
  out.canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
  return out;
}
// Markup with build-specific parts removed: render-data scripts, chunk names and nonces; and from the snapshot, the
// challenge script Cloudflare injects into pages it serves (it is not part of the site).
function markup(html) {
  return html
    .replace(/<script>\(\(self\[Symbol[\s\S]*?<\/script>/g, "")
    .replace(/<script[^>]*>self\.__[\s\S]*?<\/script>/g, "")
    .replace(/<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument[\s\S]*?<\/script>/g, "")
    .replace(/<link rel="modulepreload"[^>]*>/g, "")
    .replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/\/_next\/static\/chunks\/[A-Za-z0-9._-]+/g, "/_next/static/chunks/X")
    .replace(/\/_next\/static\/css\/([a-z-]+)\.[A-Za-z0-9_-]+\.css/g, "/_next/static/css/$1.X.css") // contents checked above
    .replace(/ nonce="[^"]*"/g, "")
    .split(">");
}
if (base) {
  for (const [route, name] of Object.entries(PAGES)) {
    await check(`page ${route} matches v34${changes(`page/${name}`)} (text, classes, metadata, markup)`, async () => {
      const response = await fetch(base + route);
      const local = await response.text();
      const live = withChanges(`page/${name}`, fs.readFileSync(path.join(snap, "pages", `${name}.html`), "utf8"));
      assert.deepEqual(meta(local), meta(live), "metadata");
      assert.equal(text(local), text(live), "visible text");
      assert.deepEqual(classes(local), classes(live), "class names");
      const a = markup(live);
      const b = markup(local);
      const at = a.findIndex((line, i) => line !== b[i]);
      assert.ok(at === -1 && a.length === b.length, `markup differs at tag ${at}:\n v34:   ${a[at]?.slice(0, 160)}\n local: ${b[at]?.slice(0, 160)}`);
    });
  }
} else {
  console.log("skip  pages: pass --pages http://127.0.0.1:8787 with pnpm start running to compare them");
}

console.log(`\n${passed} checks passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
