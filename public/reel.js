/* Blackglass showreel. 24 s seamless loop, no audio. Loaded by site.js after the page has loaded, never with
   reduced motion. seek(t) sets every layer from t alone (no randomness), so any frame renders the same way
   in any order, and window.blackglassReel.seek(t) can drive a frame capture to MP4.
   Only transform and opacity are animated. Beat sheet and rules: design/DESIGN_LANGUAGE.md.

    0.0  Axis      a hairline draws, a tick scale counts the octagon's 8 sides, a bracket locks at centre
    3.0  Pane      the outline draws, a 45° wipe fills it with black glass, one specular sweep, volt on a vertex
    7.0  Specimen  contour athlete, Brace → Reach on the phase scale, volt traces the core, two callouts
   12.0  Modules   Today · Train · Learn · Fuel as spec cards; a monumental index rolls 01 → 04
   16.0  Scale     one monumental 45°: the facet angle and Dunedin's latitude
   19.0  Lockup    the reel's only ember, the mark, the wordmark, the tagline; hairlines retract to nothing */
(() => {
  const host = document.querySelector('[data-reel]');
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = host.querySelector('.reel-stage');
  const G = JSON.parse(host.dataset.geometry);
  const DUR = 24;
  const NS = 'http://www.w3.org/2000/svg';
  const C = { glass: '#101113', pane: '#18191C', facet: '#2B2D32', bone: '#F4F5EF', volt: '#D5FF3F', ember: '#DE7F4E', rule: 'rgba(244,245,239,.22)', ruleStrong: 'rgba(244,245,239,.5)', ring0: '#636464', ring: '#353637' };

  /* ---- Time helpers ---- */
  const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const k = (t, a, b) => clamp((t - a) / (b - a));
  const expo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const quart = (x) => 1 - Math.pow(1 - x, 4);
  const win = (t, a, b) => t >= a && t < b;

  /* ---- The athlete: capsules on a skeleton, [x1, y1, x2, y2, radius], in figure units (floor at y 476). ---- */
  const POSES = {
    brace: { bones: [[136, 455, 176, 452, 13], [176, 452, 292, 454, 22], [292, 450, 322, 350, 36], [330, 336, 330, 336, 42], [342, 330, 440, 320, 34], [440, 320, 530, 332, 44],
      [542, 338, 542, 338, 30], [548, 346, 552, 392, 20], [552, 392, 556, 430, 16], [548, 350, 578, 364, 13], [584, 372, 584, 372, 24]], wheel: [556, 446], spec: 'M290 250L560 250L560 316L290 326Z' },
    reach: { bones: [[136, 455, 176, 452, 13], [176, 452, 292, 454, 22], [292, 450, 360, 336, 36], [372, 322, 372, 322, 42], [384, 318, 500, 312, 34], [500, 312, 600, 322, 44],
      [612, 326, 612, 326, 30], [618, 330, 670, 382, 20], [670, 382, 712, 430, 16], [626, 338, 664, 356, 13], [684, 366, 684, 366, 25]], wheel: [722, 446], spec: 'M330 240L640 240L640 316L330 330Z' },
  };
  const LEVELS = 7, STEP = 9;
  const MODULES = [
    ['01', 'Today', 'Pick up where you left off.', 'Shows', 'Session in progress'],
    ['02', 'Train', 'See the whole week.', 'Programme', '6 days per week'],
    ['03', 'Learn', 'Know how the lift should look.', 'Phases', 'Brace · Reach · Return'],
    ['04', 'Fuel', 'Keep food in the picture.', 'Targets', 'kcal · protein'],
  ];
  const BEATS = [[0, '01', 'Axis'], [3, '02', 'Pane'], [7, '03', 'Specimen'], [12, '04', 'Modules'], [16, '05', 'Scale'], [19, '06', 'Lockup']];

  let L = null, R = null, W = 0, H = 0;

  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const div = (cls, html, parent) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; parent.appendChild(e); return e; };
  const tf = (e, v) => { e.setAttribute('transform', v); };
  const op = (e, v) => { e.style.opacity = v; };
  const css = (e, v) => { e.style.transform = v; };
  // A hairline that draws from (x, y) at an angle; p is how much of it is drawn.
  const hair = (parent, x, y, len, deg = 0, stroke = C.rule) => { const g = el('g', {}, parent); const l = el('line', { x1: 0, y1: 0, x2: len, y2: 0, stroke, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }, g); return { g, l, x, y, deg }; };
  const drawHair = (h, p) => { tf(h.g, `translate(${h.x} ${h.y}) rotate(${h.deg})`); tf(h.l, `scale(${Math.max(p, 0.0001)} 1)`); h.g.style.opacity = p > 0 ? 1 : 0; };

  /* ---- Layout: every position derives from the stage size, for 9:16 through 16:9. ---- */
  function layout(w, h) {
    const tall = h > w, m = Math.min(w, h), pad = Math.max(20, m * 0.055);
    const S = tall ? 0.64 * w : 0.52 * h;                       // octagon (beats 1-2)
    const fs = tall ? (0.9 * w) / 760 : (0.58 * w) / 760;        // figure scale
    const floorY = tall ? 0.5 * h : 0.64 * h;
    const fig = { fs, ox: (tall ? 0.05 * w : 0.08 * w) - 100 * fs, oy: floorY - 476 * fs, floorY };
    const E = tall ? 0.86 * w : 0.62 * h;                       // ember field (beat 6), mirrored by the poster CSS
    const fcy = 0.4 * h;
    const wordW = tall ? 0.72 * w : 0.34 * w;
    const wordY = fcy + E / 2 + 0.05 * h;
    return { tall, m, pad, cx: w / 2, cy: h / 2, S, fig, E, fcy, wordW, wordY, tagY: wordY + wordW * (40 / 409.593) + 0.035 * h,
      axisA: tall ? 0.34 * h : 0.4 * h, mon: tall ? 0.52 * w : 0.46 * h, deg: tall ? 0.46 * w : 0.6 * h };
  }

  function build() {
    const rect = stage.getBoundingClientRect();
    W = Math.round(rect.width); H = Math.round(rect.height);
    L = layout(W, H);
    stage.querySelector('.reel-live')?.remove();
    const live = document.createElement('div');
    live.className = 'reel-live';
    live.setAttribute('aria-hidden', 'true');
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
    live.appendChild(svg);
    const dom = div('reel-dom', '', live);
    const r = {};
    const pt = (x, y) => [L.fig.ox + x * L.fig.fs, L.fig.oy + y * L.fig.fs];

    // Beat 6 ember field sits at the back.
    r.ember = el('g', {}, svg);
    el('path', { d: G.outline, fill: C.ember, transform: `translate(${L.cx - L.E / 2} ${L.fcy - L.E / 2}) scale(${L.E / 88})` }, r.ember);

    // Beat 1: axis, tick scale, centre bracket.
    r.axis = el('g', {}, svg);
    el('line', { x1: L.cx, y1: L.cy - L.axisA, x2: L.cx, y2: L.cy + L.axisA, stroke: C.rule, 'stroke-width': 1 }, r.axis);
    r.ticks = [...Array(9)].map((_, i) => el('line', { x1: L.cx + 8, x2: L.cx + 8 + (i % 8 === 0 ? 18 : 10), y1: L.cy - L.S / 2 + (i * L.S) / 8, y2: L.cy - L.S / 2 + (i * L.S) / 8, stroke: C.ruleStrong, 'stroke-width': 1 }, svg));
    r.count = div('rl-label', '', dom);
    r.brk = el('g', {}, svg);
    const b = 26, a = 10;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => el('path', { d: `M${sx * b} ${sy * (b - a)}V${sy * b}H${sx * (b - a)}`, fill: 'none', stroke: C.bone, 'stroke-width': 1 }, r.brk));

    // Beat 2: the octagon draws as 8 hairlines, fills with black glass along the 45° seam, one sweep, volt on a vertex.
    const o = { x: L.cx - L.S / 2, y: L.cy - L.S / 2, s: L.S / 88 };
    const V = [[0, 18], [18, 0], [70, 0], [88, 18], [88, 70], [70, 88], [18, 88], [0, 70]];
    r.oct = V.map(([x, y], i) => { const [x2, y2] = V[(i + 1) % 8]; return hair(svg, o.x + x * o.s, o.y + y * o.s, Math.hypot(x2 - x, y2 - y) * o.s, (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI, C.ruleStrong); });
    const defs = el('defs', {}, svg);
    const wipe = el('clipPath', { id: 'rl-wipe' }, defs);
    r.wipe = el('path', { d: 'M-400 400 400-400H-400Z' }, wipe);
    const paneClip = el('clipPath', { id: 'rl-pc' }, defs);
    el('path', { d: G.pane }, paneClip);
    r.glass = el('g', { transform: `translate(${o.x} ${o.y}) scale(${o.s})` }, svg);
    const fill = el('g', { 'clip-path': 'url(#rl-wipe)' }, r.glass);
    el('path', { d: G.pane, fill: C.pane }, fill);
    el('path', { d: G.facet, fill: C.facet }, fill);
    el('line', { x1: 7, y1: 22.101, x2: 22.101, y2: 7, stroke: C.bone, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }, fill);
    const sweep = el('g', { 'clip-path': 'url(#rl-pc)' }, r.glass);
    r.sweep = el('line', { x1: -100, y1: 100, x2: 100, y2: -100, stroke: C.bone, 'stroke-width': 1.5, 'stroke-opacity': 0.55, 'vector-effect': 'non-scaling-stroke' }, sweep);
    r.sq = el('rect', { width: 6, height: 6, fill: C.volt }, svg);
    r.sqAt = [o.x + 22.101 * o.s - 3, o.y + 7 * o.s - 3];
    r.paneLabel = div('rl-label rl-c', 'Glass Pane · 8 sides · 45° facet', dom);
    r.paneLabel.style.top = `${L.cy + L.S / 2 + 28}px`;

    // Beat 3: the specimen.
    r.floor = hair(svg, L.fig.ox + 100 * L.fig.fs, L.fig.floorY, 760 * L.fig.fs, 0, C.rule);
    r.poses = {};
    for (const [name, pose] of Object.entries(POSES)) {
      const g = el('g', { transform: `translate(${L.fig.ox} ${L.fig.oy}) scale(${L.fig.fs})` }, svg);
      const clip = el('clipPath', { id: `rl-spec-${name}` }, defs);
      el('path', { d: pose.spec }, clip);
      const ring = 1.2 / L.fig.fs;
      const lines = (dr, col, inner) => pose.bones.map(([x1, y1, x2, y2, rad]) => rad - dr > 0 ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${2 * (rad - dr) - (inner ? 2 * ring : 0)}" stroke-linecap="round"/>` : '').join('');
      const levels = [];
      for (let lv = 0; lv < LEVELS; lv++) {
        const lg = el('g', {}, g);
        lg.innerHTML = `<g>${lines(lv * STEP, lv ? C.ring : C.ring0)}</g>${lv === 0 ? `<g clip-path="url(#rl-spec-${name})">${lines(0, C.bone)}</g>` : ''}<g>${lines(lv * STEP, C.pane, true)}</g>`;
        levels.push(lg);
      }
      el('circle', { cx: pose.wheel[0], cy: pose.wheel[1], r: 29, fill: 'none', stroke: C.ruleStrong, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }, g);
      el('circle', { cx: pose.wheel[0], cy: pose.wheel[1], r: 3, fill: C.bone }, g);
      r.poses[name] = { g, levels };
    }
    const c0 = pt(410, 350), c1 = pt(580, 362);
    r.core = hair(svg, c0[0], c0[1], Math.hypot(c1[0] - c0[0], c1[1] - c0[1]), (Math.atan2(c1[1] - c0[1], c1[0] - c0[0]) * 180) / Math.PI, C.volt);
    r.core.l.setAttribute('stroke-width', 2.2);
    // Phase scale under the floor: Brace, Reach, Return.
    const s0 = pt(560, 476), s1 = pt(860, 476);
    r.scale = el('g', {}, svg);
    for (let i = 0; i <= 20; i++) { const x = s0[0] + ((s1[0] - s0[0]) * i) / 20; el('line', { x1: x, x2: x, y1: s0[1] + 10, y2: s0[1] + (i % 10 === 0 ? 24 : 16), stroke: i % 10 === 0 ? C.bone : C.ruleStrong, 'stroke-width': 1 }, r.scale); }
    r.scaleLab = div('rl-label rl-phases', '<span>Brace</span><span>Reach</span><span>Return</span>', dom);
    Object.assign(r.scaleLab.style, { left: `${s0[0]}px`, top: `${s0[1] + 30}px`, width: `${s1[0] - s0[0]}px` });
    r.marker = el('rect', { x: -3, y: s0[1] + 4, width: 6, height: 6, fill: C.bone }, svg);
    r.markerX = [s0[0], (s0[0] + s1[0]) / 2];
    // Callouts: leaders run through empty space only.
    const core = pt(495, 356), wheel = pt(722, 446);
    const lab1 = L.tall ? [core[0] - 8, L.fig.floorY + 96] : [core[0] - 8, L.fig.floorY + 70];
    const lab2 = L.tall ? [wheel[0] + 14, L.fig.oy + 220 * L.fig.fs - 70] : [W * 0.74, wheel[1] - 130];
    const leader = (from, to) => hair(svg, from[0], from[1], Math.hypot(to[0] - from[0], to[1] - from[1]), (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI, C.ruleStrong);
    r.lead1 = leader(core, [lab1[0], lab1[1] - 6]);
    r.lead2 = leader(wheel, [lab2[0], lab2[1] + (L.tall ? 44 : -6)]);
    r.call1 = div('rl-label rl-call', '<b>Phase 02 / 03 — Reach</b><br>Working area — core', dom);
    Object.assign(r.call1.style, { left: `${lab1[0]}px`, top: `${lab1[1]}px` });
    r.call2 = div('rl-label rl-call', '<b>Kneeling wheel rollout</b><br>Core / Bodyweight', dom);
    if (L.tall) Object.assign(r.call2.style, { right: `${L.pad}px`, top: `${lab2[1]}px`, textAlign: 'right' });
    else Object.assign(r.call2.style, { left: `${lab2[0]}px`, top: `${lab2[1]}px` });

    // Beat 4: monumental index and one spec card per second.
    r.mon = div('rl-mon', `<div class="rl-strip">${MODULES.map((m) => `<span>${m[0]}</span>`).join('')}</div>`, dom);
    const monH = L.mon * 0.84;
    Object.assign(r.mon.style, { fontSize: `${L.mon}px`, height: `${monH}px`, left: `${L.tall ? L.pad : W * 0.08}px`, top: `${L.tall ? H * 0.12 : H * 0.5 - monH / 2}px` });
    r.strip = r.mon.firstChild;
    [...r.strip.children].forEach((s) => { s.style.height = `${monH}px`; });
    r.monH = monH;
    r.cards = MODULES.map(([n, key, title, k1, v1]) => {
      const c = div('rl-card', `<i class="rl-hair"></i><div class="rl-clip"><div class="rl-in"><p class="rl-label"><span class="sq"></span><b>${n}</b> ${key}</p><p class="rl-title">${title}</p><dl class="rl-label"><dt>${k1}</dt><dd>${v1}</dd></dl></div></div>`, dom);
      Object.assign(c.style, L.tall ? { left: `${L.pad}px`, right: `${L.pad}px`, top: `${H * 0.12 + monH + H * 0.06}px` } : { left: `${W * 0.54}px`, width: `${W * 0.36}px`, top: `${H * 0.5 - 70}px` });
      return { c, hairEl: c.querySelector('.rl-hair'), inEl: c.querySelector('.rl-in') };
    });

    // Beat 5: 45°.
    r.deg = div('rl-deg', '<div class="rl-clip"><span class="rl-degn">45°</span></div>', dom);
    Object.assign(r.deg.style, { fontSize: `${L.deg}px`, left: '0', right: '0', top: `${L.cy - L.deg * 0.62}px` });
    r.degIn = r.deg.querySelector('.rl-degn');
    r.degLine = hair(svg, L.pad, L.cy + L.deg * 0.28, W - 2 * L.pad, 0, C.ruleStrong);
    r.degScale = el('g', {}, svg);
    const gx0 = L.cx - Math.min(W * 0.36, 360), gx1 = L.cx + Math.min(W * 0.36, 360), gy = L.cy + L.deg * 0.28 + 34;
    for (let i = 0; i <= 18; i++) { const x = gx0 + ((gx1 - gx0) * i) / 18; el('line', { x1: x, x2: x, y1: gy, y2: gy + (i % 9 === 0 ? 14 : 7), stroke: i % 9 === 0 ? C.bone : C.ruleStrong, 'stroke-width': 1 }, r.degScale); }
    r.degSq = el('rect', { x: L.cx - 3, y: gy - 12, width: 6, height: 6, fill: C.volt }, svg);
    r.degLabs = div('rl-label rl-deglabs', `<span>0°</span><span><b>Facet angle 45°</b><br>The Octagon · 45°52′S 170°30′E</span><span>90°</span>`, dom);
    Object.assign(r.degLabs.style, { left: `${gx0}px`, width: `${gx1 - gx0}px`, top: `${gy + 24}px` });

    // Beat 6: the mark, the wordmark, the tagline, over the ember field.
    const ms = L.E * 0.46;
    r.mark = el('g', {}, svg);
    const mk = el('g', { transform: `translate(${L.cx - ms / 2} ${L.fcy - ms / 2}) scale(${ms / 88})` }, r.mark);
    el('path', { d: G.pane, fill: C.pane }, mk); el('path', { d: G.facet, fill: C.facet }, mk); el('path', { d: G.glint, fill: C.volt }, mk); el('path', { d: G.rim, fill: C.bone, 'fill-rule': 'evenodd' }, mk);
    const wclip = el('clipPath', { id: 'rl-wc' }, defs);
    r.wclip = el('rect', { x: 118, y: 0, width: 420, height: 88 }, wclip);
    r.word = el('g', { transform: `translate(${L.cx - L.wordW / 2} ${L.wordY}) scale(${L.wordW / 409.593}) translate(-118 -24)` }, svg);
    el('path', { d: G.wordmark, fill: C.bone, 'clip-path': 'url(#rl-wc)' }, r.word);
    r.tag = div('rl-display rl-c', G.tagline, dom);
    r.tag.style.top = `${L.tagY}px`;

    // HUD: the beat index, top left.
    r.hud = div('rl-label rl-hud', '', dom);
    Object.assign(r.hud.style, { left: `${L.pad}px`, top: `${L.pad}px` });

    stage.insertBefore(live, stage.querySelector('.reel-toggle'));
    R = r;
  }

  function seek(t) {
    t = ((t % DUR) + DUR) % DUR;
    const r = R;
    // HUD
    const beat = BEATS.filter((x) => t >= x[0]).pop();
    r.hud.innerHTML = `<b>${beat[1]}</b> — ${beat[2]}`;
    op(r.hud, t < 0.3 || t > 23.4 ? 0 : 1);

    // Axis: draws 0–0.6, holds through the pane, retracts 6.5–7.0; returns 22.6–23.0 and closes by 24.0.
    let ax = 0;
    if (t < 7) ax = expo(k(t, 0, 0.6)) * (1 - quart(k(t, 6.5, 7.0)));
    else if (t >= 22.6) ax = expo(k(t, 22.6, 23.0)) * (1 - quart(k(t, 23.2, 24.0)));
    tf(r.axis, `translate(${L.cx} ${L.cy}) scale(1 ${Math.max(ax, 0.0001)}) translate(${-L.cx} ${-L.cy})`);
    op(r.axis, ax > 0.001 ? 1 : 0);

    // Tick scale counts the sides, 1.0–2.5; the bracket locks at 2.5; both clear at 3.0.
    const b1 = t < 3.0;
    let n = -1;
    r.ticks.forEach((e, i) => { const a = 1.0 + (i * 1.5) / 8; const on = b1 && t >= a; if (on) n = i; op(e, on ? 1 : 0); });
    op(r.count, b1 && n >= 0 ? 1 : 0);
    if (n >= 0) { r.count.innerHTML = `<b>0${n}</b> / 08 sides`; css(r.count, `translate(${L.cx + 36}px, ${L.cy - L.S / 2 + (n * L.S) / 8 - 8}px)`); }
    const lock = quart(k(t, 2.5, 2.75));
    tf(r.brk, `translate(${L.cx} ${L.cy}) scale(${2 - lock})`);
    op(r.brk, b1 ? lock : 0);

    // Pane: 3.0–7.0.
    const b2 = win(t, 3.0, 7.0);
    r.oct.forEach((h, i) => drawHair(h, b2 ? expo(k(t, 3.0 + i * 0.1875, 3.0 + (i + 1) * 0.1875 + 0.1)) : 0));
    op(r.glass, b2 && t >= 4.5 ? 1 : 0);
    const wc = 176 * expo(k(t, 4.5, 5.5));
    tf(r.wipe, `translate(${wc / 2} ${wc / 2})`);
    const sw = -10 + 186 * quart(k(t, 5.5, 6.5));
    tf(r.sweep, `translate(${sw / 2} ${sw / 2})`);
    op(r.sweep, win(t, 5.5, 6.5) ? 1 : 0);
    const land = quart(k(t, 6.5, 6.75));
    r.sq.setAttribute('x', r.sqAt[0]); r.sq.setAttribute('y', r.sqAt[1]);
    tf(r.sq, `translate(0 ${-18 * (1 - land)})`);
    op(r.sq, b2 && t >= 6.5 ? land : 0);
    op(r.paneLabel, b2 ? quart(k(t, 5.5, 5.85)) : 0);

    // Specimen: 7.0–12.0.
    const b3 = win(t, 7.0, 12.0);
    const reach = t >= 9.0;
    for (const [name, pz] of Object.entries(r.poses)) {
      const show = b3 && (name === 'reach' ? reach : !reach);
      op(pz.g, show ? (name === 'reach' ? quart(k(t, 9.0, 9.15)) : 1) : 0);
      pz.levels.forEach((lg, lv) => op(lg, name === 'brace' ? quart(k(t, 7.0 + lv * 0.12, 7.2 + lv * 0.12)) : 1));
    }
    drawHair(r.floor, b3 ? expo(k(t, 8.0, 8.5)) : 0);
    op(r.scale, b3 ? quart(k(t, 8.0, 8.5)) : 0);
    op(r.scaleLab, b3 ? quart(k(t, 8.2, 8.5)) : 0);
    r.scaleLab.dataset.phase = reach ? '1' : '0';
    const mx = r.markerX[0] + (r.markerX[1] - r.markerX[0]) * quart(k(t, 9.0, 9.25));
    tf(r.marker, `translate(${mx} 0)`);
    op(r.marker, b3 && t >= 8.5 ? 1 : 0);
    drawHair(r.lead1, b3 ? expo(k(t, 9.0, 9.35)) : 0);
    op(r.call1, b3 ? quart(k(t, 9.2, 9.45)) : 0);
    drawHair(r.core, b3 ? expo(k(t, 9.5, 10.1)) : 0);
    drawHair(r.lead2, b3 ? expo(k(t, 10.5, 10.85)) : 0);
    op(r.call2, b3 ? quart(k(t, 10.7, 10.95)) : 0);

    // Modules: 12.0–16.0, a card a second; the index rolls with it.
    const b4 = win(t, 12.0, 16.0);
    const ci = b4 ? Math.min(3, Math.floor(t - 12)) : -1;
    op(r.mon, b4 ? 1 : 0);
    const roll = ci < 0 ? 0 : ci - 1 + quart(k(t, 12 + ci, 12 + ci + 0.3));
    css(r.strip, `translateY(${-Math.max(0, roll) * r.monH}px)`);
    r.cards.forEach((c, i) => {
      const on = i === ci;
      op(c.c, on ? 1 : 0);
      if (!on) return;
      const a = 12 + i;
      css(c.hairEl, `scaleX(${expo(k(t, a, a + 0.25))})`);
      css(c.inEl, `translateY(${-100 * (1 - expo(k(t, a + 0.1, a + 0.45)))}%)`);
    });

    // Scale: 16.0–19.0. The hairline draws, the numeral rises off it and counts to 45.
    const b5 = win(t, 16.0, 19.0);
    op(r.deg, b5 ? 1 : 0);
    drawHair(r.degLine, b5 ? expo(k(t, 16.0, 16.25)) : 0);
    const rise = expo(k(t, 16.1, 16.6));
    css(r.degIn, `translateY(${100 * (1 - rise)}%)`);
    r.degIn.textContent = `${String(Math.round(45 * quart(k(t, 16.1, 16.6)))).padStart(2, '0')}°`;
    const labs = b5 ? quart(k(t, 16.5, 16.8)) : 0;
    op(r.degScale, labs); op(r.degLabs, labs); op(r.degSq, labs);

    // Lockup: 19.0–24.0. Ember rises, the mark lands, wordmark and tagline follow; everything retracts by 24.0.
    const b6 = t >= 19.0;
    const out = quart(k(t, 22.5, 23.2));
    const rise6 = expo(k(t, 19.0, 19.6)), sink = quart(k(t, 22.75, 23.4));
    tf(r.ember, `translate(0 ${H * 0.62 * (1 - rise6) + H * 0.62 * sink})`);
    op(r.ember, b6 ? 1 - quart(k(t, 22.8, 23.35)) : 0);
    const mland = expo(k(t, 19.5, 19.85));
    tf(r.mark, `translate(${L.cx} ${L.fcy}) scale(${1.08 - 0.08 * mland}) translate(${-L.cx} ${-L.fcy})`);
    op(r.mark, b6 ? mland * (1 - quart(k(t, 22.75, 23.1))) : 0);
    tf(r.wclip, `translate(${-420 * (1 - expo(k(t, 20.0, 20.5)))} 0)`);
    op(r.word, b6 ? 1 - out : 0);
    const tg = quart(k(t, 20.5, 20.85));
    op(r.tag, b6 ? tg * (1 - out) : 0);
    css(r.tag, `translateY(${10 * (1 - tg)}px)`);
  }

  /* ---- Playback: autoplay, pause offscreen, when the tab is hidden, or on request. Starts on the resting lockup. ---- */
  const toggle = stage.querySelector('[data-reel-toggle]');
  const toggleText = toggle.querySelector('[data-reel-toggle-text]');
  let base = 21.0, t0 = 0, userPaused = false, inView = false, running = false, raf = 0, current = base;
  const now = () => (running ? (base + (performance.now() - t0) / 1000) % DUR : current);
  const frame = () => { current = now(); seek(current); raf = requestAnimationFrame(frame); };
  const sync = () => {
    const should = !userPaused && inView && !document.hidden;
    if (should === running) return;
    if (should) { base = current; t0 = performance.now(); running = true; raf = requestAnimationFrame(frame); }
    else { current = now(); running = false; cancelAnimationFrame(raf); }
  };
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    toggleText.textContent = userPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', userPaused ? 'Play the showreel' : 'Pause the showreel');
    toggle.classList.toggle('is-paused', userPaused);
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver((e) => { inView = e[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(stage);
  let size = '';
  new ResizeObserver(() => {
    const rect = stage.getBoundingClientRect(), s = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
    if (s === size || !rect.width) return;
    size = s; build(); seek(current);
  }).observe(stage);

  document.fonts.ready.then(() => {
    build(); seek(current);
    host.classList.add('is-live');
    toggle.hidden = false;
    // Frame capture: blackglassReel.seek(t) renders any moment and stops playback.
    window.blackglassReel = { duration: DUR, seek: (t) => { userPaused = true; sync(); current = t; seek(t); } };
  });
})();
