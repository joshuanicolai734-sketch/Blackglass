/* Blackglass hype teaser, runtime. Injected by teaser-hype.mjs after bezierSrc (bz, eOut, eIO, eIn, k) and CFG.
   window.seek(t) sets every layer from t alone, so any frame can be rendered in any order. 150 BPM: a beat is 0.4 s. */
const { W, H, V, MK, F, LK, shocks, VTX, cuts } = CFG;
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const hit = (t, a, d) => (t < a ? 0 : Math.exp(-(t - a) * d));
const hits = (t, list) => list.reduce((s, [a, amp, d]) => s + amp * hit(t, a, d), 0);
const bell = (t, a, b) => Math.sin(Math.PI * k(t, a, b));
const GLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>*+=%";
const scramble = (txt, p, t, seed = 0) => {
  const n = txt.length, fr = Math.floor(t * 30), done = Math.floor(p * n + 1e-6);
  let o = "";
  for (let i = 0; i < n; i++) o += txt[i] === " " || i < done ? txt[i] : GLY[Math.floor(hash(i * 13.7 + fr * 1.31 + seed) * GLY.length)];
  return o;
};
const show = (el, on) => { el.style.display = on ? "block" : "none"; };

// Timeline (seconds). Shared with teaser-hype-sound.py.
const WORDS = ["KNOW", "WHAT", "TODAY", "ASKS", "OF", "YOU."];
const kicks = [];
for (let x = 3.2; x < 14.39; x += .4) kicks.push(+x.toFixed(2));
for (let x = 16.0; x < 19.21; x += .4) kicks.push(+x.toFixed(2));
const featStarts = [6.4, 8.0, 9.6, 11.2];
const SECTIONS = [[0, "Boot"], [3.2, "00 · Signal"], [4.0, "00 · Brief"], [6.4, "01 · Plan"], [8.0, "02 · Train"], [9.6, "03 · Learn"], [11.2, "04 · Fuel"], [12.8, "05 · Sequence"], [14.4, "06 · Sync"], [16.0, "07 · Lock"]];

const CA = [[3.2, 16, 6], ...WORDS.map((_, i) => [4.0 + i * .4, 9, 14]), ...featStarts.map((a) => [a, 12, 9]), ...featStarts.map((a) => [a + .8, 6, 12]),
  ...Array.from({ length: 8 }, (_, c) => [12.8 + c * .2, 7, 16]), [16.0, 28, 4], [16.4, 7, 14], [16.8, 7, 14], [17.2, 9, 14], [19.2, 14, 6]];
const GLITCH = [[3.2, 70, 14], ...featStarts.map((a) => [a, 50, 18]), ...Array.from({ length: 8 }, (_, c) => [12.8 + c * .2, 36, 30]), [16.0, 90, 8], [19.2, 50, 10]];
const SHAKE = [[3.2, 26, 7], ...WORDS.map((_, i) => [4.0 + i * .4, 9, 12]), ...featStarts.map((a) => [a + .8, 6, 12]), ...Array.from({ length: 8 }, (_, c) => [12.8 + c * .2, 6, 18]),
  [16.0, 36, 5], [16.4, 8, 12], [16.8, 8, 12], [17.2, 10, 12], [19.2, 18, 6]];

// Tunnel speed (units per second), integrated to a travel distance so ramps stay smooth.
const speed = (t) => {
  if (t < 3.2) return 0;
  if (t < 4.0) return 2.2 + 2.4 * hit(t, 3.2, 4);
  if (t < 6.4) return 2.2;
  if (t < 12.8) return 1.0;
  if (t < 14.4) return 2.0;
  if (t < 15.8) return 2 + 7 * eIn(k(t, 14.4, 15.8));
  if (t < 16.0) return 0;
  if (t < 19.2) return 2.8 + 3 * hit(t, 16.0, 1.5);
  return .15 + 2.65 * (1 - eOut(k(t, 19.2, 21.2)));
};
const travel = (t, f) => { let z = 0; for (let x = 0; x < t; x += 1 / 240) z += f(x) / 240; return z; };
const gridSpeed = (t) => .3 + 2.2 * eIn(k(t, .3, 3.2));

let G = null, sizes = null;
function init() {
  const c = $("#gl"), g = c.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
  const sh = (ty, src) => { const s = g.createShader(ty); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; };
  const pr = g.createProgram();
  g.attachShader(pr, sh(g.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
  g.attachShader(pr, sh(g.FRAGMENT_SHADER, CFG.shader));
  g.linkProgram(pr); g.useProgram(pr);
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const l = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(l); g.vertexAttribPointer(l, 2, g.FLOAT, false, 0, 0);
  const u = {}; ["r", "t", "z", "gz", "grid", "tun", "pulse", "flash", "streak", "glow", "inv"].forEach((n) => { u[n] = g.getUniformLocation(pr, n); });
  G = { g, u };
  // Fit the display words to the frame: measure each at 100px.
  const m = $("#meas");
  const fit = (txt, maxW, maxFs) => { m.textContent = txt; return Math.min(maxFs, (maxW / m.getBoundingClientRect().width) * 100); };
  m.style.fontSize = "100px";
  sizes = {
    words: WORDS.map((w) => fit(w, W * .88, V ? H * .36 : H * .62)),
    feat: ["PLAN.", "TRAIN.", "LEARN.", "FUEL."].map((w) => fit(w, F.word.fit, V ? 300 : 250)),
    tag: fit("Train with intent.", LK.fit, V ? 110 : 130),
  };
  $$(".ft-word").forEach((e, i) => { e.style.fontSize = sizes.feat[i] + "px"; });
  $("#lk-tag").style.fontSize = sizes.tag + "px";
}

window.seek = function (t) {
  if (!G) init();
  const g = G.g;
  const lastKick = kicks.filter((x) => x <= t + 1e-6).pop();
  const pulse = lastKick === undefined ? 0 : Math.exp(-(t - lastKick) * 10);
  const gap = t >= 15.8 && t < 16.0;

  /* ---- Background ---- */
  const grid = t < 3.2 ? eOut(k(t, .3, 1.2)) * (hash(Math.floor(t * 24)) > .15 || t > 1.2 ? 1 : .3) : 0;
  const tun = t < 3.2 || gap ? 0 : t < 6.4 ? 1 : t < 12.8 ? .5 : t < 16 ? .85 : 1 - .35 * k(t, 19.2, 21.2);
  const streak = 1.2 * hit(t, 3.2, 2.2) + eIn(k(t, 14.6, 15.8)) * (t < 15.8 ? 1 : 0) + 1.4 * hit(t, 16.0, 1.6) + .5 * hit(t, 19.2, 3);
  const flashGl = 1.2 * hit(t, 3.2, 5) + 1.4 * hit(t, 16.0, 3) + .6 * hit(t, 19.2, 4) + .25 * pulse * (t > 3.2 ? 1 : 0);
  const glow = .6 + .8 * pulse + (t > 14.4 && t < 15.8 ? 1.5 * k(t, 14.4, 15.8) : 0);
  g.uniform2f(G.u.r, W, H); g.uniform1f(G.u.t, t);
  g.uniform1f(G.u.z, travel(t, speed)); g.uniform1f(G.u.gz, travel(Math.min(t, 3.2), gridSpeed));
  g.uniform1f(G.u.grid, grid); g.uniform1f(G.u.tun, tun); g.uniform1f(G.u.pulse, pulse);
  g.uniform1f(G.u.flash, flashGl); g.uniform1f(G.u.streak, streak); g.uniform1f(G.u.glow, glow);
  const invCut = t >= 12.8 && t < 14.4 && cuts[Math.floor((t - 12.8) / .2)].inv;
  g.uniform1f(G.u.inv, invCut ? 1 : 0);
  g.drawArrays(g.TRIANGLES, 0, 3);

  /* ---- 0–3.2 Boot: the octagon draws itself on 8th notes, then spins up into the drop. ---- */
  const bootOn = t < 3.2;
  show($("#boot"), bootOn && t > .35);
  if (bootOn) {
    $("#xh").style.transform = `scale(${eOut(k(t, .4, .9))})`; $("#xh").style.transformOrigin = "44px 44px";
    $("#ring2").style.opacity = eOut(k(t, 1.0, 1.4)) * (hash(Math.floor(t * 30)) > .1 ? 1 : 0);
    $$(".seg").forEach((e, i) => { const a = .8 + i * .2; e.setAttribute("stroke-dashoffset", 1 - eOut(k(t, a, a + .14))); });
    $("#ofill").setAttribute("opacity", .9 * eIO(k(t, 2.4, 3.1)));
    const spin = eIn(k(t, 2.4, 3.2));
    $("#oct").style.transform = `rotate(${90 * spin + 4 * Math.sin(t * 3)}deg) scale(${1 - .18 * spin})`;
    $("#ring2").setAttribute("transform", `translate(44 44) rotate(${t * 20 + 180 * spin}) scale(${1.32 + .3 * spin}) translate(-44 -44)`);
    const si = Math.floor((t - .8) / .2), bd = $("#bdot");
    if (t >= .8 && t < 2.4) {
      const i = Math.min(7, si), a = .8 + i * .2, p = eOut(k(t, a, a + .14)), v0 = VTX[i], v1 = VTX[(i + 1) % 8];
      const x = v0[0] + (v1[0] - v0[0]) * p, y = v0[1] + (v1[1] - v0[1]) * p;
      bd.style.display = "block";
      bd.style.transform = `translate(${W / 2 - MK / 2 + x * MK / 88 - 7}px,${H / 2 - MK / 2 + y * MK / 88 - 7}px)`;
    } else bd.style.display = "none";
    const msgs = [[.4, "System check"], [1.2, "Loading programme"], [2.0, "Plan · Train · Learn · Fuel"], [2.8, "Ready"]];
    const cur = msgs.filter(([a]) => t >= a).pop();
    $("#boottxt").textContent = cur ? scramble(cur[1].toUpperCase(), k(t, cur[0], cur[0] + .3), t, cur[0]) : "";
    $("#boottxt").style.opacity = cur && cur[1] === "Ready" ? (Math.floor(t * 10) % 2 ? 1 : .35) : 1;
  }

  /* ---- 3.2–4.0 Drop: the mark slams in on a shockwave. ---- */
  show($("#markl"), t >= 3.2 && t < 4.0);
  if (t >= 3.2 && t < 4.0) $("#markw").style.transform = `scale(${1 + .55 * (1 - eOut(k(t, 3.2, 3.45))) + .05 * pulse}) rotate(${-8 * (1 - eOut(k(t, 3.2, 3.5)))}deg)`;
  $$(".shk").forEach((e, i) => {
    const s = shocks[i], p = k(t, s.t, s.t + .75);
    e.setAttribute("opacity", t >= s.t && p < 1 ? (1 - p) * .9 : 0);
    e.setAttribute("transform", `translate(${s.x} ${s.y}) scale(${s.s * (1 + 3.2 * eOut(p))}) translate(-44 -44)`);
  });

  /* ---- 4.0–6.4 "Know what today asks of you." One word per beat. ---- */
  const wOn = t >= 4.0 && t < 6.4;
  show($("#words"), wOn);
  if (wOn) {
    const i = Math.min(5, Math.floor((t - 4.0) / .4)), a = 4.0 + i * .4, lt = t - a, p = eOut(k(lt, 0, .14));
    const fs = sizes.words[i], wd = $("#wd");
    [wd, $("#we1"), $("#we2")].forEach((e) => { e.textContent = WORDS[i]; e.style.fontSize = fs + "px"; });
    wd.className = "word disp" + (i % 2 && i < 5 ? " outline" : "");
    wd.style.color = i === 5 ? "#D5FF3F" : "";
    wd.style.transform = `translateY(-50%) scale(${1.32 - .32 * p + .05 * (lt / .4)})`;
    $("#we1").style.transform = `translateY(-50%) scale(${1.1 + .5 * (lt / .4)})`; $("#we1").style.opacity = .35 * (1 - lt / .4);
    $("#we2").style.transform = `translateY(-50%) scale(${1.25 + .9 * (lt / .4)})`; $("#we2").style.opacity = .16 * (1 - lt / .4);
    const wc = $("#wcount");
    wc.textContent = `0${i + 1} / 06`; wc.style.top = `${H / 2 + fs * .46 + 30}px`;
  }

  /* ---- 6.4–12.8 Features: one bar each. Whip in, lock on, scan, punch, glitch out. ---- */
  featStarts.forEach((a, i) => {
    const el = $("#ft" + i), on = t >= a && t < a + 1.6;
    show(el, on);
    if (!on) return;
    const lt = t - a, dir = i % 2 ? -1 : 1;
    const pin = eOut(k(lt, 0, .32)), pout = eIn(k(lt, 1.38, 1.6));
    const x = dir * W * .75 * (1 - pin) - dir * W * .85 * pout;
    const ry = -62 * dir * (1 - pin) + dir * (-12 + 18 * k(lt, .3, 1.4)) + 55 * dir * pout;
    const blur = 18 * (1 - pin) ** 2 + 22 * pout;
    const sc = 1 + .05 * hit(lt, .8, 9);
    const pw = el.querySelector(".ft-pw");
    pw.style.transform = `translateX(${x}px) rotateY(${ry}deg) rotateX(${6 - 5 * k(lt, 0, 1.6)}deg) scale(${sc})`;
    pw.style.filter = blur > .3 ? `blur(${blur}px)` : "none";
    const scan = el.querySelector(".ft-scan");
    scan.style.top = `${F.ph * eIO(k(lt, .3, 1.15))}px`; scan.style.opacity = bell(lt, .3, 1.15);
    // Target brackets snap onto the pane.
    const e = 22 + 150 * (1 - eOut(k(lt, .2, .46))) + 60 * pout, bOn = lt > .2 && lt < 1.5 && (lt > .3 || hash(Math.floor(t * 60)) > .4);
    const x0 = F.cx - F.pw / 2 - e + x * .9, y0 = F.cy - F.ph / 2 - e, x1 = F.cx + F.pw / 2 + e - 46 + x * .9, y1 = F.cy + F.ph / 2 + e - 46;
    el.querySelectorAll(".cr").forEach((c, j) => {
      c.style.display = bOn ? "block" : "none";
      c.style.transform = `translate(${j === 0 || j === 3 ? x0 : x1}px,${j < 2 ? y0 : y1}px)`;
      c.style.borderColor = hit(lt, .8, 10) > .4 ? "#F4F5EF" : "#D5FF3F";
    });
    // The word: letters drop in on 32nds, outline until beat 3, then solid.
    el.querySelectorAll(".l").forEach((l, j) => {
      const pi = eOut(k(lt, j * .045, j * .045 + .16)), po = eIn(k(lt, 1.38 + j * .02, 1.52 + j * .02));
      l.style.transform = `translateY(${-105 * (1 - pi) + 105 * po}%)`;
      const solid = lt >= .8;
      l.style.color = solid ? (hit(lt, .8, 12) > .5 ? "#D5FF3F" : "#F4F5EF") : "transparent";
      l.style.webkitTextStroke = solid ? "0" : "3px #F4F5EF";
    });
    const mq = el.querySelector(".ft-mq");
    mq.style.transform = `translate(${-dir * (lt * 900) - (dir > 0 ? 200 : 1800)}px,-50%)`;
    const tag = el.querySelector(".ft-tag"); tag.style.opacity = lt > .1 && (lt > .25 || hash(Math.floor(t * 60) + 3) > .5) ? 1 - pout : 0;
    const cap = el.querySelector(".ft-cap"); cap.textContent = lt > .28 ? scramble(cap.dataset.cap, k(lt, .3, .95), t, i) : ""; cap.style.opacity = 1 - pout;
    el.querySelector(".ft-bar i").style.width = `${100 * k(lt, 0, 1.6)}%`;
    el.querySelector(".ft-bar").style.opacity = 1 - pout;
  });

  /* ---- 12.8–14.4 Strobe montage: a cut every 8th note, alternate cuts inverted. ---- */
  const mOn = t >= 12.8 && t < 14.4, ci = mOn ? Math.floor((t - 12.8) / .2) : -1;
  cuts.forEach((c, i) => {
    const el = $("#mc" + i); show(el, i === ci);
    if (i !== ci) return;
    const lt = t - (12.8 + i * .2), sgn = i % 4 < 2 ? 1 : -1;
    if (c.k === "pane") {
      el.querySelector(".mc-pw").style.transform = `rotateY(${18 * sgn}deg) rotateZ(${-5 * sgn}deg) scale(${1.12 - .1 * eOut(k(lt, 0, .2))})`;
      el.querySelector(".mc-word").style.transform = `translateY(-50%) scale(${1.2 - .2 * eOut(k(lt, 0, .12))})`;
    } else {
      el.querySelector(".mc-mk").style.transform = `rotate(${(c.k === "wire" ? 45 : 12) * sgn * (1 - eOut(k(lt, 0, .2)))}deg) scale(${1.25 - .25 * eOut(k(lt, 0, .15))})`;
    }
  });
  show($("#inv"), mOn && cuts[ci].inv);

  /* ---- 14.4–15.8 Build: three screens fly up from depth, everything syncs, then gets pulled into a point. ---- */
  const bOn = t >= 14.4 && t < 15.8;
  show($("#tri"), bOn);
  if (bOn) {
    const suck = eIn(k(t, 15.55, 15.8));
    $("#tri-g").style.transform = `rotateY(${22 - 44 * eIO(k(t, 14.4, 15.6))}deg) scale(${(1 + .25 * eIn(k(t, 14.4, 15.6))) * (1 - .92 * suck)}) rotateZ(${40 * suck}deg)`;
    $$(".tp").forEach((e, j) => {
      const a = 14.4 + j * .2, p = eOut(k(t, a, a + .35));
      e.style.transform = `translate3d(${(j - 1) * (V ? 330 : 470)}px,0,${-2200 * (1 - p)}px) rotateY(${(1 - j) * 14}deg)`;
      e.style.opacity = t >= a ? 1 : 0;
    });
    const sy = $("#sync"), sp = k(t, 14.8, 15.45);
    sy.textContent = t > 14.7 ? scramble("TRAIN WITH INTENT", sp, t, 7) : "";
    sy.style.transform = `scale(${1 - .92 * suck})`; sy.style.color = sp >= 1 ? "#D5FF3F" : "#F4F5EF";
    const pc = k(t, 14.4, 15.55);
    $("#syncbar i").style.width = `${100 * pc}%`;
    $("#syncn").textContent = `Sync ${String(Math.round(pc * 100)).padStart(3, "0")}%`;
    ["#syncbar", "#syncn"].forEach((s) => { $(s).style.opacity = 1 - suck; });
  }

  /* ---- 16.0 Final drop: the lockup, the line, the address. ---- */
  const lOn = t >= 16.0;
  show($("#lock"), lOn);
  if (lOn) {
    const p = eOut(k(t, 16.0, 16.32));
    $("#lk-mark").style.transform = `scale(${1.5 - .5 * p + .04 * pulse}) rotate(${-10 * (1 - p)}deg)`;
    $("#lk-wm").style.clipPath = `inset(0 ${100 - 100 * eOut(k(t, 16.05, 16.4))}% 0 0)`;
    $$("#lk-tag span").forEach((s, j) => {
      const a = 16.4 + j * .4, q = eOut(k(t, a, a + .13));
      s.style.opacity = t >= a ? 1 : 0; s.style.transform = `scale(${1.5 - .5 * q})`;
    });
    const url = "blackglass.co.nz", n = Math.floor(k(t, 17.6, 18.1) * url.length + 1e-6);
    $("#lk-url span").textContent = t >= 17.6 ? url.slice(0, n) : "";
    $("#lk-url .cur").style.opacity = t >= 17.6 && Math.floor(t * 3.75) % 2 === 0 ? 1 : 0;
    const av = $("#lk-av");
    av.textContent = t >= 18.2 ? scramble(av.dataset.t.toUpperCase(), k(t, 18.2, 18.8), t, 5) : "";
  }

  /* ---- HUD ---- */
  const hudOn = t > .15 && !gap;
  $("#hud").style.opacity = !hudOn ? 0 : t < .7 ? (hash(Math.floor(t * 30) + 11) > .45 ? 1 : .15) : 1;
  const sec = SECTIONS.filter(([a]) => t >= a).pop();
  $("#h-sec").textContent = scramble(sec[1].toUpperCase(), k(t, sec[0], sec[0] + .2), t, sec[0]);
  const fr = Math.floor(t * 60 + 1e-6);
  $("#h-tc").textContent = `00:${String(Math.floor(fr / 60)).padStart(2, "0")}:${String(fr % 60).padStart(2, "0")}`;

  /* ---- Camera and post: beat bump, shake, chromatic split, slice glitch, flash, blackout, fade. ---- */
  const sh = hits(t, SHAKE);
  const sx = (noise1(t * 43) - .5) * 2 * sh, sy = (noise1(t * 37 + 9) - .5) * 2 * sh, sr = (noise1(t * 29 + 3) - .5) * sh * .05;
  $("#stage").style.transform = `translate(${sx}px,${sy}px) rotate(${sr}deg) scale(${1 + .014 * pulse})`;
  const bootGlitch = [[.95, 1.03], [1.62, 1.68], [2.52, 2.58]].some(([a, b]) => t >= a && t < b) ? 26 : 0;
  const featOut = featStarts.reduce((s, a) => s + bell(t, a + 1.36, a + 1.62), 0);
  const ca = hits(t, CA) + 10 * eIn(k(t, 14.4, 15.8)) * (t < 15.8 ? 1 : 0) + 12 * featOut + (bootGlitch ? 5 : 0) + 6 * k(t, 2.8, 3.2) * (t < 3.2 ? 1 : 0);
  const gl = hits(t, GLITCH) + 70 * featOut + bootGlitch + 60 * eIn(k(t, 2.9, 3.2)) * (t < 3.2 ? 1 : 0) + 110 * eIn(k(t, 15.4, 15.8)) * (t < 15.8 ? 1 : 0) + 40 * bell(t, 20.85, 21.1);
  const post = $("#post");
  if (gl < .6 && ca < .4) post.style.filter = "none";
  else {
    $("#gd").setAttribute("scale", gl.toFixed(1));
    $("#gt").setAttribute("seed", String(Math.floor(t * 20)));
    $("#gt").setAttribute("baseFrequency", `0 ${(.006 + .03 * hash(Math.floor(t * 20) + .5)).toFixed(4)}`);
    $("#gr").setAttribute("dx", ca.toFixed(2)); $("#gb").setAttribute("dx", (-ca).toFixed(2));
    post.style.filter = "url(#gf)";
  }
  $("#scan").style.opacity = Math.min(.9, (t < 3.2 ? .5 : 0) + gl / 90);
  $("#flash").style.opacity = Math.min(1, hit(t, 3.2, 14) + hit(t, 16.0, 7) + .55 * hit(t, 19.2, 9) + .12 * hits(t, WORDS.map((_, i) => [4.0 + i * .4, 1, 20])));
  post.style.opacity = gap ? 0 : 1 - k(t, 21.0, 21.6);
  const gd = $("#gapdot"); gd.style.display = gap ? "block" : "none"; gd.style.opacity = Math.floor(t * 20) % 2 ? .3 : 1;
};
