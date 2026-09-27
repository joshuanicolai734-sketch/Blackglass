// Shared building blocks for the Blackglass social kit and OG images. Every asset is plain HTML/CSS built
// from the real lockup geometry (content/brand.ts), the site fonts (public/fonts) and real app screens
// (public/assets), so the campaign and the website share one design system.
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = (p) => pathToFileURL(resolve(ROOT, p)).href;

const brandSrc = readFileSync(resolve(ROOT, "content/brand.ts"), "utf8");
const path = (name) => brandSrc.match(new RegExp(`${name}: "([^"]+)"`))[1];
export const P = { pane: path("pane"), facet: path("facet"), glint: path("glint"), rim: path("rim"), wordmark: path("wordmark") };
export const C = { ink: "#101113", pane: "#18191C", facet: "#2B2D32", bone: "#F4F5EF", volt: "#D5FF3F", grey: "#8E949B", line: "#2A2C30", text2: "#C3C6C0", text3: "#A4A9AE" };
export const screens = { today: url("public/assets/dashboard.webp"), plan: url("public/assets/program.webp"), move: url("public/assets/movement.webp") };

export const mark = (size, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 88 88" ${extra}><path fill="${C.pane}" d="${P.pane}"/><path fill="${C.facet}" d="${P.facet}"/><path fill="${C.volt}" d="${P.glint}"/><path fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/></svg>`;
export const lockup = (height, extra = "") =>
  `<svg height="${height}" width="${(height * 530.087) / 88}" viewBox="0 0 530.087 88" ${extra}><path fill="${C.pane}" d="${P.pane}"/><path fill="${C.facet}" d="${P.facet}"/><path fill="${C.volt}" d="${P.glint}"/><path fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/><path fill="${C.bone}" d="${P.wordmark}"/></svg>`;
export const octOutline = (size, stroke = "rgba(244,245,239,.14)", w = 1, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 88 88" ${extra} style="overflow:visible"><path d="M.5 18.2 18.2.5h51.6l17.7 17.7v51.6L69.8 87.5H18.2L.5 69.8Z" fill="none" stroke="${stroke}" stroke-width="${w}" vector-effect="non-scaling-stroke"/><path d="M73.45 14.55 14.55 73.45" stroke="rgba(244,245,239,.07)" stroke-width="${w}" vector-effect="non-scaling-stroke"/></svg>`;

/** A real app screen in the chamfered facet pane. `crop` = visible screen height in px (top-anchored unless `pos`). */
export const pane = ({ src, width, crop, pos = "top", cut = 26, cls = "", style = "" }) => {
  const h = crop ?? Math.round((width - 18) * (1560 / 720)) + 18;
  return `<div class="pane ${cls}" style="--cut:${cut}px;width:${width}px;height:${h}px;${style}">
    <div class="pane-in"><img src="${src}" style="object-position:${pos}"/></div></div>`;
};

export const label = (text, color = C.text3) => `<p class="label" style="color:${color}"><svg viewBox="0 0 88 88" width="18" height="18"><path d="M3 19 19 3h50l16 16v50L69 85H19L3 69Z" fill="none" stroke="${C.volt}" stroke-width="9"/></svg><span>${text}</span></p>`;

export const base = ({ w, h, body, css = "", bg = "light" }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Inter Tight";src:url(${url("public/fonts/inter-tight-latin-wght.woff2")}) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(${url("public/fonts/geist-mono-latin-500.woff2")}) format("woff2");font-weight:500}
@font-face{font-family:"Geist Mono";src:url(${url("public/fonts/geist-mono-latin-700.woff2")}) format("woff2");font-weight:700}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;background:${C.ink};color:${C.bone};font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;${bg === "light" ? `background:radial-gradient(60% 45% at 76% 30%,rgba(196,204,208,.12),transparent 70%),linear-gradient(135deg,transparent 44%,rgba(244,245,239,.04) 50%,transparent 56%),${C.ink}` : C.ink}}
.display{font-weight:800;letter-spacing:-.045em;line-height:.92}
.mono{font-family:"Geist Mono",monospace;font-weight:500;letter-spacing:.14em;text-transform:uppercase}
.label{display:flex;align-items:center;gap:14px;font:500 22px/1 "Geist Mono",monospace;letter-spacing:.14em;text-transform:uppercase}
.pane{position:relative;clip-path:polygon(var(--cut) 0,100% 0,100% calc(100% - var(--cut)),calc(100% - var(--cut)) 100%,0 100%,0 var(--cut));background:linear-gradient(135deg,#34373d 0 50%,#1d1e22 50%);padding:9px;filter:drop-shadow(0 50px 70px rgba(0,0,0,.55))}
.pane-in{position:relative;width:100%;height:100%;overflow:hidden;clip-path:polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px)}
.pane-in img{width:100%;height:100%;object-fit:cover;display:block}
.pane-in::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(244,245,239,.07) 0 50%,transparent 50%)}
.btn{display:inline-flex;align-items:center;gap:22px;padding:0 34px;height:84px;background:${C.volt};color:${C.ink};font-weight:650;font-size:32px;letter-spacing:-.01em;clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)}
.btn svg{width:26px;height:26px}
.foot{position:absolute;left:72px;right:72px;bottom:64px;display:flex;justify-content:space-between;align-items:center}
.foot .mono{font-size:20px;color:${C.text3}}
.tick{display:flex;gap:18px;align-items:flex-start}.tick::before{content:"";flex:none;width:16px;height:16px;margin-top:14px;background:linear-gradient(135deg,${C.volt} 0 50%,transparent 50%)}
${css}
</style></head><body><div class="bg"></div>${body}</body></html>`;

export const arrow = `<svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="square"/></svg>`;

/** Standard post footer: lockup left, page count or address right. */
export const foot = (right = "blackglass.co.nz") => `<div class="foot">${lockup(34)}<span class="mono">${right}</span></div>`;

/** CSS cubic-bezier as a JS function, for deterministic video frames. */
export const bezierSrc = `function bz(x1,y1,x2,y2){return function(x){if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx;const f=((ax*t+bx)*t+cx)*t-x,d=(3*ax*t+2*bx)*t+cx;if(Math.abs(d)<1e-6)break;t-=f/d;t=Math.min(1,Math.max(0,t));}const cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;return((ay*t+by)*t+cy)*t;};}
const eOut=bz(.16,1,.3,1),eIO=bz(.76,0,.24,1),eIn=bz(.7,0,.84,0);
const k=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a)));`;
