// Phase 0 style frames (throwaway). Builds src/*.html from the real mark geometry, repo fonts and app screens,
// then screenshots each at 390 and 1440 wide into design/frames/*.png.
//   node design/frames/build.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { P } from "../../social/lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const f = (p) => pathToFileURL(resolve(ROOT, p)).href;
const { chromium } = await import(pathToFileURL(resolve(ROOT, "social/node_modules/playwright/index.mjs")).href);

// Candidate tokens (see design/DESIGN_LANGUAGE.md). Existing values unless flagged NEW.
const T = {
  glass: "#101113", pane: "#18191C", facet: "#2B2D32", bone: "#F4F5EF", volt: "#D5FF3F", grey: "#8E949B",
  text2: "#C3C6C0", text3: "#A4A9AE", ink2: "#45484D",
  paper: "#ECEAE3", // NEW: warm counter-surface
};
const OUTER = "M0 18 18 0h52l18 18v52L70 88H18L0 70Z"; // outer contour of the rim (content/brand.ts)
const SEAM = [[73.45, 14.55], [14.55, 73.45]];         // the facet's 45° seam

const css = (paper = false) => `
@font-face{font-family:"Inter Tight";src:url(${f("public/fonts/inter-tight-latin-wght.woff2")}) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(${f("public/fonts/geist-mono-latin-500.woff2")}) format("woff2");font-weight:500}
:root{--ground:${paper ? T.paper : T.glass};--fg:${paper ? T.glass : T.bone};--fg2:${paper ? T.ink2 : T.text2};--fg3:${paper ? T.ink2 : T.text3};
  --rule:${paper ? "rgba(16,17,19,.18)" : "rgba(244,245,239,.14)"};--grid:${paper ? "rgba(16,17,19,.045)" : "rgba(244,245,239,.04)"};
  --volt:${T.volt};--g:clamp(20px,5vw,72px)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--ground);color:var(--fg);font:400 17px/1.6 "Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
body{position:relative;min-height:100vh;overflow:hidden}
${paper ? `body::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.03;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}` : ""}
.grid{position:absolute;inset:0 var(--g);display:none;grid-template-columns:repeat(12,1fr);pointer-events:none}
.grid i{border-left:1px solid var(--grid)}.grid i:last-child{border-right:1px solid var(--grid)}
@media(min-width:900px){.grid{display:grid}}
/* Type: five sizes. */
.label{font:500 11px/1.4 "Geist Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--fg3)}
@media(min-width:900px){.label{font-size:12px}}
.display{font-weight:300;text-transform:uppercase;letter-spacing:.3em;line-height:1.25;font-size:clamp(24px,3.1vw,44px)}
.title{font-weight:500;font-size:20px;line-height:1.3;letter-spacing:-.01em}
.body{font-size:17px;color:var(--fg2);max-width:34em}
.monument{font-weight:800;letter-spacing:-.05em;line-height:.8}
/* Section header: 01 — TITLE ———— meta */
.sh{display:flex;align-items:center;gap:14px}.sh .rule{flex:1;height:1px;background:var(--rule)}
.sq{display:inline-block;width:6px;height:6px;background:var(--volt)}
${paper ? ".sq{outline:1px solid var(--fg)}" : ""}
.btn{display:inline-flex;align-items:center;gap:14px;height:48px;padding:0 22px;font:500 12px/1 "Geist Mono",monospace;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;
  background:${paper ? T.glass : T.volt};color:${paper ? T.bone : T.glass};clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}
.link{font:500 12px/1 "Geist Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--fg);text-decoration:none;padding-bottom:6px;background:linear-gradient(var(--fg),var(--fg)) 0 100%/100% 1px no-repeat}
.hdr{position:relative;display:flex;align-items:center;justify-content:space-between;height:72px;padding:0 var(--g);border-bottom:1px solid var(--rule)}
.hdr nav{display:none;gap:36px}@media(min-width:900px){.hdr nav{display:flex}}
.lk-mark{display:none}@media(max-width:419px){.lk-full{display:none}.lk-mark{display:block}.hdr .btn{padding:0 16px}}
.btn{white-space:nowrap}
.hdr .menu{display:inline}@media(min-width:900px){.hdr .menu{display:none}}
.brk{position:absolute;width:16px;height:16px;border:0 solid var(--fg)}
.brk.a{border-top-width:1px;border-left-width:1px}.brk.b{border-top-width:1px;border-right-width:1px}.brk.c{border-bottom-width:1px;border-right-width:1px}.brk.d{border-bottom-width:1px;border-left-width:1px}
`;
const grid = `<div class="grid" aria-hidden="true">${"<i></i>".repeat(12)}</div>`;
const page = (title, body, paper = false) => `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css(paper)}</style></head><body>${grid}${body}</body></html>`;

const lockup = (h, colour) => `<svg height="${h}" viewBox="0 0 530.087 88" aria-label="Blackglass" role="img"><path fill="${T.pane}" d="${P.pane}"/><path fill="${T.facet}" d="${P.facet}"/><path fill="${T.volt}" d="${P.glint}"/><path fill="${colour}" fill-rule="evenodd" d="${P.rim}"/><path fill="${colour}" d="${P.wordmark}"/></svg>`;
const markOnly = (colour) => `<svg height="26" viewBox="0 0 88 88" aria-label="Blackglass" role="img"><path fill="${T.pane}" d="${P.pane}"/><path fill="${T.facet}" d="${P.facet}"/><path fill="${T.volt}" d="${P.glint}"/><path fill="${colour}" fill-rule="evenodd" d="${P.rim}"/></svg>`;
const header = (paper) => `<header class="hdr"><span class="lk-full">${lockup(22, paper ? T.glass : T.bone)}</span><span class="lk-mark">${markOnly(paper ? T.glass : T.bone)}</span>
  <nav><a class="link" href="#">How it works</a><a class="link" href="#" style="background-size:0 1px">Coaching</a><a class="link" href="#" style="background-size:0 1px">Questions</a></nav>
  <div style="display:flex;gap:18px;align-items:center"><a class="btn" href="#">Get Blackglass <span aria-hidden="true">↗</span></a><span class="label menu" style="color:var(--fg)">Menu</span></div></header>`;

/* ---------- Frame 1: hero (Glass) ---------- */
// The object is the pane's exact geometry rendered as black glass: pane + lit facet, the rim's outer contour as a
// hairline, one specular edge on the upper-left chamfer, and a volt square on that vertex.
const glassPane = (size) => `<svg viewBox="-8 -8 104 104" width="${size}" height="${size}" style="overflow:visible;display:block" aria-hidden="true">
  <path d="${OUTER}" fill="none" stroke="rgba(244,245,239,.22)" stroke-width="1" vector-effect="non-scaling-stroke"/>
  <path fill="${T.pane}" d="${P.pane}"/><path fill="${T.facet}" d="${P.facet}"/>
  <path d="M7 22.101 22.101 7" stroke="${T.bone}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
  <rect x="${22.101 - 3 * 104 / size}" y="${7 - 3 * 104 / size}" width="${6 * 104 / size}" height="${6 * 104 / size}" fill="${T.volt}"/>
  <line x1="${SEAM[0][0]}" y1="${SEAM[0][1]}" x2="${SEAM[1][0]}" y2="${SEAM[1][1]}" stroke="rgba(244,245,239,.08)" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
const hero = page("Hero, Glass", `${header(false)}
<main style="position:relative;padding:0 var(--g)">
  <style>
    .hero{display:grid;gap:56px;padding:48px 0 64px}
    .hero-copy{display:grid;gap:28px;align-content:start}
    .obj{position:relative;justify-self:center;width:min(86vw,340px);aspect-ratio:1}
    .axis{position:absolute;left:50%;top:-24px;bottom:-24px;width:1px;background:var(--rule)}
    @media(min-width:900px){.hero{grid-template-columns:repeat(12,1fr);padding:96px 0;min-height:calc(100vh - 72px);align-items:center;gap:0}
      .hero-copy{grid-column:1/7;gap:32px}.obj{grid-column:8/13;width:min(40vw,520px)}}
  </style>
  <section class="hero" aria-labelledby="h1">
    <div class="hero-copy">
      <div class="sh"><span class="label" style="color:var(--fg)">00</span><span class="label">Training app</span><span class="rule"></span><span class="label">Built in Dunedin</span></div>
      <h1 id="h1" class="display">Know what today asks of you.</h1>
      <p class="body">Blackglass keeps your programme, today’s session, how each lift should look and what you’re eating in one clear place. Open it, see the work, get on with it.</p>
      <div style="display:flex;flex-wrap:wrap;gap:28px;align-items:center"><a class="btn" href="#">Get Blackglass <span aria-hidden="true">↗</span></a><a class="link" href="#">See how it works</a></div>
      <p class="label">Status — Android app in development · Preview list open</p>
    </div>
    <div class="obj" aria-hidden="true">
      <span class="axis"></span>
      <span class="brk a" style="left:-4%;top:-4%"></span><span class="brk b" style="right:-4%;top:-4%"></span><span class="brk c" style="right:-4%;bottom:-4%"></span><span class="brk d" style="left:-4%;bottom:-4%"></span>
      <div style="position:absolute;inset:0">${glassPane(520).replace('width="520" height="520"', 'width="100%" height="100%"')}</div>
      <p class="label" style="position:absolute;left:0;right:0;bottom:-56px;text-align:center">The Octagon · Dunedin · 45°52′S 170°30′E</p>
    </div>
  </section>
</main>`);

/* ---------- Frame 2: feature section, Glass and Paper ---------- */
const cards = [
  ["01", "Plan", "Walk in with a plan.", "No notes to scroll at the rack. The day’s exercises and sets are waiting when you open the app.", [["Screen", "Train › Plan"], ["Shows", "5 exercises a day"]]],
  ["02", "Today", "Lose less to interruptions.", "An unfinished session waits for you. Resume it where you stopped instead of starting again.", [["Screen", "Today"], ["Shows", "Session in progress"]]],
  ["03", "Learn", "Move with better control.", "Guides show each exercise in phases, so the next rep is more deliberate than the last.", [["Screen", "Exercise guide"], ["Phases", "Brace · Reach · Return"]]],
  ["04", "Fuel", "Keep food in the picture.", "Calorie and protein targets sit beside your training, not in a separate app.", [["Screen", "Today › Nutrition"], ["Targets", "kcal · protein"]]],
];
const feature = (paper) => page(`Feature, ${paper ? "Paper" : "Glass"}`, `${header(paper)}
<main style="position:relative;padding:0 var(--g)">
  <style>
    .feat{display:grid;gap:40px;padding:56px 0 72px}
    .cards{display:grid;border-top:1px solid var(--rule)}
    .card{position:relative;display:grid;gap:12px;padding:24px 0 28px;border-bottom:1px solid var(--rule)}
    .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;margin-top:6px}
    .kv dd{color:var(--fg)}
    .shot{position:relative;width:min(70vw,300px);justify-self:center;background:${paper ? T.glass : T.facet};padding:10px;clip-path:polygon(24px 0,100% 0,100% calc(100% - 24px),calc(100% - 24px) 100%,0 100%,0 24px)}
    .shot img{display:block;width:100%;height:420px;object-fit:cover;object-position:top;clip-path:polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)}
    .shot::after{content:"";position:absolute;left:10px;top:10px;width:30px;height:1.5px;background:${T.bone};transform-origin:0 0;transform:translate(0,16px) rotate(-45deg)}
    @media(min-width:900px){.feat{grid-template-columns:repeat(12,1fr);gap:0;row-gap:48px;padding:88px 0}
      .feat>.sh{grid-column:1/13}.feat>h2{grid-column:1/7}.cards{grid-column:1/8;grid-template-columns:1fr 1fr;border-top:0}
      .card{padding:26px 28px 30px 0;border-bottom:0;border-top:1px solid var(--rule)}.card:nth-child(odd){padding-right:40px}
      .shot{grid-column:9/13;grid-row:2/4;width:100%;align-self:start}.shot img{height:560px}}
  </style>
  <section class="feat" aria-labelledby="h2">
    <div class="sh"><span class="label" style="color:var(--fg)">02</span><span class="label">The method</span><span class="rule"></span><span class="label">04 principles</span></div>
    <h2 id="h2" class="display">Less guessing. More training.</h2>
    <figure class="shot"><img src="${f("public/assets/program.webp")}" alt="The Train screen: this week’s plan with five exercises a day"></figure>
    <div class="cards">${cards.map(([n, k, t, b, kv], i) => `<article class="card">
      ${i === 0 ? `<span class="brk a" style="left:-10px;top:-10px"></span><span class="brk b" style="right:6px;top:-10px"></span><span class="brk c" style="right:6px;bottom:0"></span><span class="brk d" style="left:-10px;bottom:0"></span>` : ""}
      <p class="label" style="display:flex;gap:10px;align-items:center">${i === 0 ? `<span class="sq" aria-hidden="true"></span>` : ""}<span style="color:var(--fg)">${n}</span><span>${k}</span></p>
      <h3 class="title">${t}</h3><p class="body" style="font-size:16px">${b}</p>
      <dl class="kv label">${kv.map(([a, v]) => `<dt>${a}</dt><dd>${v}</dd>`).join("")}</dl></article>`).join("")}</div>
  </section>
</main>`, paper);

/* ---------- Frame 3: reel beat 3, Specimen ---------- */
// Contour-line athlete in the Ab Wheel Rollout "Reach" phase (the app's own exercise guide). Each limb is a
// capsule on a skeleton; contour k is the union of every capsule shrunk by k·step, drawn as a hairline band
// with masks, so the lines nest like a topographic map. Material: black glass with one specular edge.
const bones = [ // [x1,y1,x2,y2,radius]
  [136, 455, 176, 452, 13], [176, 452, 292, 454, 22],               // foot, shin (kneeling)
  [292, 450, 360, 336, 36], [372, 322, 372, 322, 42],                // thigh, glute
  [384, 318, 500, 312, 34], [500, 312, 600, 322, 44],                // waist, ribcage
  [612, 326, 612, 326, 30],                                          // shoulder
  [618, 330, 670, 382, 20], [670, 382, 712, 430, 16],                // upper arm, forearm (straight to the wheel)
  [626, 338, 664, 356, 13], [684, 366, 684, 366, 25],                // neck, head (dropped between the arms)
];
const STEP = 9, LEVELS = 7;
const skel = (dr, colour) => bones.map(([a, b, c, d, r]) => r - dr > 0 ? `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${colour}" stroke-width="${2 * (r - dr)}" stroke-linecap="round"/>` : "").join("");
const figure = `<svg viewBox="100 220 760 280" style="width:100%;height:auto;display:block;overflow:visible" aria-hidden="true">
  <defs>${Array.from({ length: LEVELS }, (_, k) => `<mask id="m${k}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600"><g>${skel(k * STEP, "#fff")}</g><g>${skel(k * STEP + 1.1, "#000")}</g></mask>`).join("")}
    <mask id="sil" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600">${skel(0, "#fff")}</mask>
    <clipPath id="spec"><path d="M330 240 L640 240 L640 316 L330 330 Z"/></clipPath></defs>
  <line x1="100" y1="476" x2="860" y2="476" stroke="rgba(244,245,239,.14)" stroke-width="1"/>
  <rect width="1000" height="600" fill="${T.pane}" mask="url(#sil)"/>
  ${Array.from({ length: LEVELS }, (_, k) => `<rect width="1000" height="600" fill="${k === 0 ? "rgba(244,245,239,.34)" : "rgba(244,245,239,.13)"}" mask="url(#m${k})"/>`).join("")}
  <g clip-path="url(#spec)"><rect width="1000" height="600" fill="${T.bone}" mask="url(#m0)"/></g>
  <path d="M410 348 C455 346 520 348 580 360" fill="none" stroke="${T.volt}" stroke-width="2.2" stroke-linecap="square"/>
  <circle cx="722" cy="446" r="29" fill="none" stroke="rgba(244,245,239,.55)" stroke-width="1.2"/><circle cx="722" cy="446" r="3" fill="${T.bone}"/>
</svg>`;
const specimen = page("Reel beat 3, Specimen", `
<style>
  .reel{position:relative;width:100vw;height:100vh;overflow:hidden;background:${T.glass}}
  .fig{position:absolute;left:4%;right:4%;top:34%}
  .co{position:absolute;display:grid;gap:4px}
  .ld{position:absolute;height:1px;background:rgba(244,245,239,.5);transform-origin:0 0}
  .scale{position:absolute;display:flex;justify-content:space-between;align-items:flex-end}
  .scale i{display:block;width:1px;height:6px;background:rgba(244,245,239,.4)}.scale i.M{height:14px;background:${T.bone}}
  @media(min-aspect-ratio:1/1){.fig{left:6%;right:30%;top:22%}}
</style>
<div class="reel" aria-hidden="true">
  <div class="label" style="position:absolute;left:5%;top:5%;display:flex;gap:10px"><span style="color:var(--fg)">03</span><span>Specimen</span></div>
  <div class="label" style="position:absolute;right:5%;top:5%">Exercise guide</div>
  <div class="fig">${figure}</div>
  <div id="c1" class="co"><span class="label" style="color:var(--fg)">Phase 02 / 03 — Reach</span><span class="label">Working area — core</span></div>
  <div id="c2" class="co"><span class="label" style="color:var(--fg)">Kneeling wheel rollout</span><span class="label">Core / Bodyweight</span></div>
  <span id="l1" class="ld"></span><span id="l2" class="ld"></span>
  <div id="sc" class="scale"></div>
</div>
<script>
  // Place callouts and leaders against the drawn figure (throwaway layout code).
  const svg=document.querySelector('.fig svg'),box=svg.getBoundingClientRect(),vb=[100,220,760,280];
  const pt=(x,y)=>[box.left+(x-vb[0])/vb[2]*box.width,box.top+(y-vb[1])/vb[3]*box.height];
  const wide=innerWidth>innerHeight;
  const place=(id,lid,[ax,ay],[cx,cy])=>{const c=document.getElementById(id);c.style.left=cx+'px';c.style.top=cy+'px';
    const l=document.getElementById(lid),dx=cx-ax,dy=(cy+8)-ay;l.style.left=ax+'px';l.style.top=ay+'px';l.style.width=Math.hypot(dx,dy)+'px';l.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';};
  const m=pt(495,352),w=pt(722,446);
  // Leaders run through empty space only: the core callout drops under the arch, the wheel callout goes out front.
  const floor=pt(0,476)[1];
  if(wide){place('c1','l1',m,[m[0]-8,floor+64]);place('c2','l2',w,[innerWidth*.74,w[1]-120]);}
  else{place('c1','l1',m,[m[0]-8,floor+96]);
    const c=document.getElementById('c2');c.style.left='auto';c.style.right=(innerWidth*.05)+'px';c.style.top=(box.top-110)+'px';c.style.textAlign='right';
    const l=document.getElementById('l2'),e=[w[0]+14,box.top-70],dx=e[0]-w[0],dy=e[1]-w[1];
    l.style.left=w[0]+'px';l.style.top=w[1]+'px';l.style.width=Math.hypot(dx,dy)+'px';l.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';}
  // Phase scale under the floor: Brace, Reach, Return as major ticks, the current phase labelled.
  const sc=document.getElementById('sc'),a=pt(560,476),b=pt(860,476);
  sc.style.left=a[0]+'px';sc.style.width=(b[0]-a[0])+'px';sc.style.top=(a[1]+10)+'px';
  sc.innerHTML=Array.from({length:21},(_,i)=>'<i class="'+(i%10===0?'M':'')+'"></i>').join('');
  const lab=document.createElement('div');lab.className='label';lab.style.cssText='position:absolute;left:0;right:0;top:22px;display:flex;justify-content:space-between';
  lab.innerHTML='<span>Brace</span><span style="color:var(--fg)">Reach</span><span>Return</span>';sc.appendChild(lab);
</script>`);

const frames = [
  ["01-hero-glass", hero], ["02-feature-glass", feature(false)], ["02-feature-paper", feature(true)], ["03-reel-beat3-specimen", specimen],
];
mkdirSync(resolve(HERE, "src"), { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [id, html] of frames) {
  const file = resolve(HERE, "src", `${id}.html`);
  writeFileSync(file, html);
  const sizes = id.startsWith("03") ? [[390, 693], [1440, 810]] : [[390, 844], [1440, 900]];
  for (const [w, h] of sizes) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(pathToFileURL(file).href);
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))); });
    if (id.startsWith("03")) { await p.reload(); await p.evaluate(() => document.fonts.ready); }
    const out = resolve(HERE, `${id}-${w}.png`);
    mkdirSync(dirname(out), { recursive: true });
    await p.screenshot({ path: out });
    console.log("frame", `${id}-${w}.png`);
    await p.close();
  }
}
await browser.close();
