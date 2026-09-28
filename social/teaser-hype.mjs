// Blackglass hype teaser: 21.6 s at 150 BPM, cut to the beat. Vertical (1080×1920) and landscape (1920×1080), 60 fps.
// The page is built here; the motion is teaser-hype.client.js, where seek(t) is a pure function of time, so renders
// are exact and repeatable. The soundtrack is teaser-hype-sound.py and shares the timeline in HYPE.
//
//   0.0  boot: HUD, perspective grid, the octagon draws on 8th notes      3.2  drop: the mark slams, tunnel opens
//   4.0  "Know what today asks of you." one word per beat                 6.4  Plan / Train / Learn / Fuel, a bar each
//  12.8  strobe montage on 8th notes                                     14.4  build, sync, blackout at 15.8
//  16.0  final drop: the lockup and "Train with intent."                 19.2  last hit, end card, fade out
import { readFileSync } from "node:fs";
import { C, P, base, bezierSrc, screens } from "./lib.mjs";

export const HYPE = { duration: 21.6, bpm: 150, fps: 60 };
const client = readFileSync(new URL("./teaser-hype.client.js", import.meta.url), "utf8");

// Background: an octagonal tunnel in the mark's own proportions, a perspective grid for the boot, speed streaks.
const shader = `precision highp float;
uniform vec2 r;uniform float t,z,gz,grid,tun,pulse,flash,streak,glow,inv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1)),f.x),f.y);}
float oct(vec2 p){p=abs(p);return max(max(p.x,p.y),(p.x+p.y)/1.586);}
void main(){
  float px=2./min(r.x,r.y);
  vec2 p=(gl_FragCoord.xy-.5*r)*px;
  vec3 bone=vec3(.957,.961,.937),volt=mix(vec3(.835,1.,.247),vec3(.165,0.,.753),inv);
  vec3 c=vec3(.0627,.0667,.0745);
  float d=length(p);
  if(tun>0.){
    float m=max(oct(p),.002);
    float depth=.42/m,u=depth*4.+z*4.;
    float du=.42*4./(m*m)*px;
    float fr=fract(u),id=floor(u);
    float ring=1.-smoothstep(0.,max(du*1.3,.02),min(fr,1.-fr));
    vec2 a=abs(p);
    float seam=1.-smoothstep(0.,px*1.6,abs(max(a.x,a.y)-(a.x+a.y)/1.586));
    float fog=smoothstep(.03,.75,m);
    float lit=.55+.45*dot(normalize(p+1e-5),vec2(-.7071,.7071));
    float vr=step(mod(id,6.),.5);
    float wall=(.035+.02*mod(id,2.))*lit;
    c+=tun*fog*(wall*bone+ring*(1.-vr)*(.2+.45*pulse)*lit*bone+ring*vr*(.55+.6*pulse)*volt+seam*.16*bone);
    c+=tun*glow*exp(-m*m*22.)*vec3(.85,.9,.8)*.45;
  }
  if(grid>0.&&p.y<-.015){
    float zz=.55/(-p.y),fx=fract(p.x*zz*1.5),fz=fract((zz+gz)*1.2);
    float wx=px*zz*1.5*1.3,wz=px*zz*zz/.55*1.2*1.3;
    float l=max(1.-smoothstep(0.,wx,min(fx,1.-fx)),1.-smoothstep(0.,wz,min(fz,1.-fz)));
    float aa=1.-smoothstep(.12,.45,max(wx,wz));
    c+=grid*exp(-zz*.25)*aa*l*bone*.34;
  }
  c+=grid*exp(-abs(p.y+.015)*26.)*bone*.10;
  float an=atan(p.y,p.x);
  float st=pow(n(vec2(an*42.,d*2.2-t*16.)),8.)*smoothstep(.12,1.1,d)*streak;
  c+=st*bone*.9;
  c+=flash*exp(-d*d*1.6)*vec3(.55,.58,.5);
  c+=(h(gl_FragCoord.xy*.731+fract(t*7.13)*91.)-.5)*.04;
  c*=1.-.4*smoothstep(.9,2.2,d);
  gl_FragColor=vec4(c,1.);
}`;

const feats = [
  { w: "PLAN.", cap: "See the whole week", src: screens.plan, pos: "top", lbl: "PROGRAMME" },
  { w: "TRAIN.", cap: "Resume where you left off", src: screens.today, pos: "top", lbl: "TODAY" },
  { w: "LEARN.", cap: "Every lift, phase by phase", src: screens.move, pos: "center 45%", lbl: "MOVEMENT" },
  { w: "FUEL.", cap: "Calories and protein beside your training", src: screens.today, pos: "center 88%", lbl: "FUEL" },
];
const cuts = [
  { k: "pane", src: screens.plan, pos: "center 30%", w: "PLAN" },
  { k: "mark", inv: true },
  { k: "pane", src: screens.today, pos: "top", w: "TRAIN" },
  { k: "wire", inv: true },
  { k: "pane", src: screens.move, pos: "center 45%", w: "LEARN" },
  { k: "mark", inv: true },
  { k: "pane", src: screens.today, pos: "center 88%", w: "FUEL" },
  { k: "mark" },
];

const OCT = "M.5 18.2 18.2.5h51.6l17.7 17.7v51.6L69.8 87.5H18.2L.5 69.8Z";
const VTX = [[18.2, .5], [69.8, .5], [87.5, 18.2], [87.5, 69.8], [69.8, 87.5], [18.2, 87.5], [.5, 69.8], [.5, 18.2]];
// On inverted strobe cuts the glint is drawn in volt's complement, so it reads as volt once the frame is inverted.
const mark = (inv = false) => `<svg class="mk" viewBox="0 0 88 88"><path fill="${C.pane}" d="${P.pane}"/><path fill="${C.facet}" d="${P.facet}"/><path fill="${inv ? "#2A00C0" : C.volt}" d="${P.glint}"/><path fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/></svg>`;
const pane = (src, pos, w, h, cut = 26) => `<div class="pane" style="--cut:${cut}px;width:${w}px;height:${h}px"><div class="pane-in"><img src="${src}" style="object-position:${pos}"/></div></div>`;
const wire = (stroke, diag) => `<svg class="mk" viewBox="0 0 88 88"><path d="${OCT}" fill="none" stroke="${stroke}" stroke-width="12" vector-effect="non-scaling-stroke"/><path d="M73.45 14.55 14.55 73.45" stroke="${diag}" stroke-width="12" vector-effect="non-scaling-stroke"/></svg>`;

function hypeHtml(W, H) {
  const V = H > W;
  const MK = V ? 520 : 440; // boot and drop mark size
  // Feature layout: pane box and text column.
  const F = V
    ? { cx: W / 2, cy: 1000, pw: 520, ph: 900, word: { left: 0, right: 0, top: 150, align: "center", fit: W * .84 }, tag: [90, 1510], cap: [90, 1556, 900], bar: [90, 1650, 900], mq: 420 }
    : { cx: 1330, cy: H / 2, pw: 430, ph: 780, word: { left: 130, top: 300, align: "left", fit: 780 }, tag: [134, 256], cap: [134, 600, 760], bar: [134, 690, 760], mq: 560 };
  const M = V ? { pw: 640, ph: 1080, word: 300 } : { pw: 520, ph: 840, word: 400 };
  const T3 = V ? { pw: 300, ph: 560, gap: 330, cy: 900, sync: 1310, bar: 1400 } : { pw: 380, ph: 640, gap: 470, cy: 490, sync: 880, bar: 950 };
  // Lockup: mark box and wordmark box.
  const LK = V
    ? { mx: W / 2 - 150, my: 540, ms: 300, wx: W * .11, wy: 920, ww: W * .78, tag: 1090, url: 1270, av: 1350, fit: W * .86 }
    : { mx: W / 2 - 620, my: H / 2 - 290, ms: 240, wx: W / 2 - 330, wy: H / 2 - 230, ww: 950, tag: H / 2 + 10, url: H / 2 + 190, av: H / 2 + 256, fit: W * .7 };
  const lkC = [LK.mx + LK.ms / 2, LK.my + LK.ms / 2];
  const shocks = [
    { t: 3.2, x: W / 2, y: H / 2, s: MK / 88 }, { t: 3.4, x: W / 2, y: H / 2, s: MK / 88 },
    { t: 16.0, x: lkC[0], y: lkC[1], s: LK.ms / 88 }, { t: 16.2, x: lkC[0], y: lkC[1], s: LK.ms / 88 }, { t: 19.2, x: lkC[0], y: lkC[1], s: LK.ms / 88 },
  ];
  const inset = V ? 56 : 44;

  const css = `
  html,body{background:${C.ink}}
  #post{position:absolute;inset:0;overflow:hidden}
  #stage{position:absolute;inset:0;transform-origin:50% 50%}
  #gl{position:absolute;inset:0;width:${W}px;height:${H}px}
  .layer{position:absolute;inset:0;display:none}
  svg{overflow:visible}
  .mk{display:block;width:100%;height:100%}
  .mono{font-family:"Geist Mono",monospace;font-weight:500;letter-spacing:.16em;text-transform:uppercase}
  .disp{font-weight:800;letter-spacing:-.045em;line-height:.9;white-space:nowrap}
  .outline{color:transparent;-webkit-text-stroke:3px ${C.bone}}
  #oct,#markw{position:absolute;left:${W / 2 - MK / 2}px;top:${H / 2 - MK / 2}px;width:${MK}px;height:${MK}px}
  .seg{stroke:${C.bone};stroke-width:${(4 * 88 / MK).toFixed(2)};stroke-linecap:square;fill:none}
  #bdot{position:absolute;width:14px;height:14px;background:${C.volt};box-shadow:0 0 18px 4px rgba(213,255,63,.55)}
  #boottxt{position:absolute;left:0;right:0;top:${H / 2 + MK / 2 + 70}px;text-align:center;font-size:${V ? 28 : 24}px;color:${C.bone}}
  #shocks{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
  .shk{fill:none;stroke:${C.bone};stroke-width:3;vector-effect:non-scaling-stroke}
  .word{position:absolute;left:0;right:0;top:50%;text-align:center}
  #wcount{position:absolute;left:0;right:0;text-align:center;font-size:${V ? 26 : 22}px;color:${C.volt}}
  .ft-mq{position:absolute;left:0;top:50%;font-size:${F.mq}px;color:transparent;-webkit-text-stroke:2px rgba(244,245,239,.08);white-space:nowrap;font-weight:800;letter-spacing:-.04em;line-height:1}
  .ft-word{position:absolute;${F.word.align === "center" ? "left:0;right:0;text-align:center" : `left:${F.word.left}px`};top:${F.word.top}px}
  .lw{display:inline-block;clip-path:inset(-4% -30% -4% -30%)}
  .l{display:inline-block}
  .ft-persp,.mc-persp,#tri-p{position:absolute;inset:0;perspective:1700px}
  .ft-pw{position:absolute;left:${F.cx - F.pw / 2}px;top:${F.cy - F.ph / 2}px;width:${F.pw}px;height:${F.ph}px}
  .ft-scan{position:absolute;left:9px;right:9px;height:3px;background:${C.bone};box-shadow:0 0 30px 8px rgba(244,245,239,.3)}
  .cr{position:absolute;left:0;top:0;width:46px;height:46px;border:0 solid ${C.volt}}
  .c0{border-top-width:4px;border-left-width:4px}.c1{border-top-width:4px;border-right-width:4px}.c2{border-bottom-width:4px;border-right-width:4px}.c3{border-bottom-width:4px;border-left-width:4px}
  .ft-tag{position:absolute;left:${F.tag[0]}px;top:${F.tag[1]}px;font-size:${V ? 24 : 21}px;color:${C.volt}}
  .ft-cap{position:absolute;left:${F.cap[0]}px;top:${F.cap[1]}px;width:${F.cap[2]}px;font-size:${V ? 38 : 32}px;letter-spacing:.08em;color:${C.bone};line-height:1.3}
  .ft-bar,#syncbar{position:absolute;height:3px;background:${C.line}}
  .ft-bar{left:${F.bar[0]}px;top:${F.bar[1]}px;width:${F.bar[2]}px}
  .ft-bar i,#syncbar i{position:absolute;left:0;top:0;bottom:0;background:${C.volt}}
  .mc-pw{position:absolute;left:${W / 2 - M.pw / 2}px;top:${H / 2 - M.ph / 2}px;width:${M.pw}px;height:${M.ph}px}
  .mc-mk{position:absolute;left:${W / 2 - MK * .6}px;top:${H / 2 - MK * .6}px;width:${MK * 1.2}px;height:${MK * 1.2}px}
  .mc-word{position:absolute;left:0;right:0;top:50%;text-align:center;font-size:${M.word}px;color:${C.bone};mix-blend-mode:difference}
  #tri-g{position:absolute;left:${W / 2}px;top:${T3.cy}px;transform-style:preserve-3d}
  .tp{position:absolute;left:${-T3.pw / 2}px;top:${-T3.ph / 2}px;width:${T3.pw}px;height:${T3.ph}px}
  #sync{position:absolute;left:0;right:0;top:${T3.sync}px;text-align:center;font-family:"Geist Mono",monospace;font-weight:700;letter-spacing:.14em;font-size:${V ? 58 : 52}px;color:${C.bone}}
  #syncbar{left:${W / 2 - (V ? 380 : 420)}px;width:${V ? 760 : 840}px;top:${T3.bar}px}
  #syncn{position:absolute;left:0;right:0;top:${T3.bar + 22}px;text-align:center;font-size:${V ? 22 : 20}px;color:${C.text3}}
  #lk-mark{position:absolute;left:${LK.mx}px;top:${LK.my}px;width:${LK.ms}px;height:${LK.ms}px}
  #lk-wm{position:absolute;left:${LK.wx}px;top:${LK.wy}px;width:${LK.ww}px}
  #lk-tag{position:absolute;left:0;right:0;top:${LK.tag}px;text-align:center}
  #lk-tag span{display:inline-block;margin:0 .12em}
  #lk-url{position:absolute;left:0;right:0;top:${LK.url}px;text-align:center;font-size:${V ? 44 : 38}px;color:${C.bone}}
  #lk-av{position:absolute;left:0;right:0;top:${LK.av}px;text-align:center;font-size:${V ? 24 : 21}px;color:${C.text3}}
  .cur{display:inline-block;width:.6em;height:1em;margin-left:.2em;vertical-align:-.12em;background:${C.volt}}
  #hud{position:absolute;inset:0;pointer-events:none}
  .hc{position:absolute;width:40px;height:40px;border:0 solid rgba(244,245,239,.55)}
  .hc.c0{left:${inset}px;top:${inset}px}.hc.c1{right:${inset}px;top:${inset}px}.hc.c2{right:${inset}px;bottom:${inset}px}.hc.c3{left:${inset}px;bottom:${inset}px}
  .hc.c0,.hc.c1,.hc.c2,.hc.c3{border-width:0}
  .hc.c0{border-top-width:2px;border-left-width:2px}.hc.c1{border-top-width:2px;border-right-width:2px}.hc.c2{border-bottom-width:2px;border-right-width:2px}.hc.c3{border-bottom-width:2px;border-left-width:2px}
  .hr{position:absolute;font-size:${V ? 20 : 18}px;color:${C.text3};display:flex;gap:14px;align-items:center}
  .hr b{font-weight:500;color:${C.bone}}
  .sq{width:12px;height:12px;background:linear-gradient(135deg,${C.volt} 0 50%,transparent 50%)}
  #h-tl{left:${inset + 58}px;top:${inset + 8}px}#h-tr{right:${inset + 58}px;top:${inset + 8}px}
  #h-bl{left:${inset + 58}px;bottom:${inset + 8}px}#h-br{right:${inset + 58}px;bottom:${inset + 8}px}
  #scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,transparent 2px 5px);opacity:0}
  #inv{position:absolute;inset:0;background:#fff;mix-blend-mode:difference;display:none}
  #flash{position:absolute;inset:0;background:${C.bone};opacity:0}
  #gapdot{position:absolute;left:${W / 2 - 7}px;top:${H / 2 - 7}px;width:14px;height:14px;background:${C.volt};display:none}
  #meas{position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap}`;

  const segs = VTX.map((a, i) => { const b = VTX[(i + 1) % 8]; return `<line class="seg" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`; }).join("");
  const letters = (w) => [...w].map((ch) => `<span class="lw"><span class="l">${ch}</span></span>`).join("");

  const body = `
  <div id="post"><div id="stage">
    <canvas id="gl" width="${W}" height="${H}"></canvas>
    <div class="layer" id="boot">
      <svg id="oct" viewBox="0 0 88 88">
        <g id="xh" stroke="rgba(244,245,239,.22)" stroke-width="1.5" vector-effect="non-scaling-stroke"><line x1="-60" y1="44" x2="148" y2="44" vector-effect="non-scaling-stroke"/><line x1="44" y1="-60" x2="44" y2="148" vector-effect="non-scaling-stroke"/></g>
        <path id="ring2" d="${OCT}" fill="none" stroke="rgba(244,245,239,.35)" stroke-width="2" stroke-dasharray="1.2 3.4" vector-effect="non-scaling-stroke" transform="translate(44 44) scale(1.32) translate(-44 -44)"/>
        <g id="segs">${segs}</g>
        <path id="ofill" d="${P.pane}" fill="${C.pane}" opacity="0"/>
      </svg>
      <div id="bdot"></div>
      <div id="boottxt" class="mono"></div>
    </div>
    <div class="layer" id="markl"><div id="markw">${mark()}</div></div>
    <div class="layer" id="words">
      <div class="word disp outline" id="we2"></div><div class="word disp outline" id="we1"></div><div class="word disp" id="wd"></div>
      <div id="wcount" class="mono"></div>
    </div>
    ${feats.map((f, i) => `<div class="layer ft" id="ft${i}">
      <div class="ft-mq">${Array(6).fill(f.w.replace(".", "")).join(" — ")}</div>
      <div class="ft-persp"><div class="ft-pw">${pane(f.src, f.pos, F.pw, F.ph)}<div class="ft-scan"></div></div></div>
      <div class="ft-word disp">${letters(f.w)}</div>
      ${[0, 1, 2, 3].map((c) => `<div class="cr c${c}"></div>`).join("")}
      <div class="ft-tag mono">0${i + 1} / 04 · ${f.lbl}</div>
      <div class="ft-cap mono" data-cap="${f.cap.toUpperCase()}"></div>
      <div class="ft-bar"><i></i></div></div>`).join("")}
    ${cuts.map((c, i) => `<div class="layer mc" id="mc${i}">${c.k === "pane"
      ? `<div class="mc-persp"><div class="mc-pw">${pane(c.src, c.pos, M.pw, M.ph, 34)}</div></div><div class="mc-word disp">${c.w}</div>`
      : c.k === "wire" ? `<div class="mc-mk">${wire(c.inv ? C.bone : C.ink, c.inv ? "#2A00C0" : C.volt)}</div>` : `<div class="mc-mk">${mark(c.inv)}</div>`}</div>`).join("")}
    <div class="layer" id="tri">
      <div id="tri-p"><div id="tri-g">${[[screens.plan, "top"], [screens.today, "top"], [screens.move, "center 45%"]].map(([s, p], j) => `<div class="tp" id="tp${j}">${pane(s, p, T3.pw, T3.ph, 22)}</div>`).join("")}</div></div>
      <div id="sync"></div><div id="syncbar"><i></i></div><div id="syncn" class="mono"></div>
    </div>
    <div class="layer" id="lock">
      <div id="lk-mark">${mark()}</div>
      <div id="lk-wm"><svg viewBox="118 24 409.593 40" style="width:100%;display:block"><path fill="${C.bone}" d="${P.wordmark}"/></svg></div>
      <div id="lk-tag" class="disp"><span>Train</span><span>with</span><span style="color:${C.volt}">intent.</span></div>
      <div id="lk-url" class="mono"><span></span><i class="cur"></i></div>
      <div id="lk-av" class="mono" data-t="Android app in development · Join the preview list"></div>
    </div>
    <svg id="shocks" viewBox="0 0 ${W} ${H}">${shocks.map(() => `<path class="shk" d="${OCT}" opacity="0"/>`).join("")}</svg>
  </div>
  <div id="hud">${[0, 1, 2, 3].map((c) => `<div class="hc c${c}"></div>`).join("")}
    <div class="hr mono" id="h-tl"><span class="sq"></span><b>Blackglass</b><span>/ Teaser</span></div>
    <div class="hr mono" id="h-tr"><b id="h-sec"></b></div>
    <div class="hr mono" id="h-bl"><span>45.8788° S · 170.5028° E</span></div>
    <div class="hr mono" id="h-br"><span>TC</span><b id="h-tc"></b></div>
  </div>
  <div id="scan"></div><div id="inv"></div><div id="flash"></div>
  </div>
  <div id="gapdot"></div>
  <span id="meas" class="disp">Aa<span class="mono">Aa</span></span>
  <svg width="0" height="0" style="position:absolute"><filter id="gf" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
    <feTurbulence id="gt" type="fractalNoise" baseFrequency="0 0.012" numOctaves="1" seed="1" result="n"/>
    <feComponentTransfer in="n" result="q"><feFuncR type="discrete" tableValues="0.5 0.5 0.5 0.5 0.15 0.5 0.9 0.5 0.3 0.5 0.5 0.5"/><feFuncG type="discrete" tableValues="0.5"/></feComponentTransfer>
    <feDisplacementMap id="gd" in="SourceGraphic" in2="q" scale="0" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset id="gr" in="r" dx="0" result="ro"/>
    <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
    <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset id="gb" in="b" dx="0" result="bo"/>
    <feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen"/></filter></svg>`;

  const cfg = { W, H, V, MK, F, LK, shocks, VTX, cuts: cuts.map((c) => ({ k: c.k, inv: !!c.inv })), shader };
  return base({ w: W, h: H, bg: "flat", css, body })
    .replace("</body>", () => `<script>${bezierSrc}\nconst CFG=${JSON.stringify(cfg)};\n${client}</script></body>`);
}

export const hype = [
  { id: "teaser-vertical", out: "social/exports/video/blackglass-teaser-1080x1920.mp4", w: 1080, h: 1920, duration: HYPE.duration, fps: HYPE.fps, audio: "social/.build/teaser-hype-sound.wav", html: hypeHtml(1080, 1920) },
  { id: "teaser-landscape", out: "social/exports/video/blackglass-teaser-1920x1080.mp4", w: 1920, h: 1080, duration: HYPE.duration, fps: HYPE.fps, audio: "social/.build/teaser-hype-sound.wav", html: hypeHtml(1920, 1080) },
];
