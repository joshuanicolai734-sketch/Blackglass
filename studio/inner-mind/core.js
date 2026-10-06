/* Through Black Glass: shared runtime for the film and the figures.
   - Palette: read once from the CSS tokens in mind.css, so canvas and page share one source.
   - Surfaces: canvases sized to their CSS box at the device pixel ratio (capped at 2), redrawn on resize.
   - One shared animation frame for everything that moves; nothing runs while it is off screen.
   - Reduced motion: nothing starts on its own. Anything a visitor starts still answers them.
   - Drawing vocabulary from the Blackglass system: hairline, tick scale, registration bracket, 6px signal square,
     chamfer and the octagon. No glow, no gradients. */
(() => {
  'use strict';
  const BG = (window.BG = {});

  /* ---- Maths and easing: the same curves as the motion tokens ---- */
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const k = (t, a, b) => clamp((t - a) / (b - a));
  // --ease-expo: drive. Lands in a handful of frames and locks.
  const expo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  // --ease-load: a symmetric ease-in-out for anything leaving or travelling under control.
  const load = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const quart = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 4));
  // Drives in at a (over d), holds, loads out at b (over d2).
  const pulse = (t, a, b, d = 0.22, d2 = 0.35) => expo(k(t, a, a + d)) * (1 - load(k(t, b, b + d2)));
  BG.m = { clamp, lerp, k, expo, load, quart, pulse, TAU: Math.PI * 2 };

  /* Seeded random numbers (mulberry32), so every drawing is the same on every visit. */
  BG.rng = (seed) => {
    let a = seed >>> 0;
    const r = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.n = () => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
    return r;
  };

  /* ---- Reduced motion ---- */
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  BG.reduced = () => mq.matches;
  BG.onReduced = (fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));

  /* ---- Palette ---- */
  const css = getComputedStyle(document.documentElement);
  const tok = (n, f) => css.getPropertyValue(n).trim() || f;
  BG.P = {
    ground: tok('--c-glass', '#0b0d0e'), pane: tok('--c-pane', '#15191b'), facet: tok('--c-facet', '#2b3032'),
    fg: tok('--c-bone', '#f1eee6'), fg2: tok('--c-bone-2', '#c8c6c0'), fg3: tok('--c-bone-3', '#aaa9a4'),
    signal: tok('--c-volt', '#f43f46'), ember: tok('--c-ember', '#b72f36'),
  };
  BG.rgb = (h) => {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  /* ---- Fonts: canvases redraw once the brand faces arrive ---- */
  const fonts = document.fonts && document.fonts.load
    ? Promise.all(['500 12px "Geist Mono"', '700 12px "Geist Mono"', '600 24px "Inter Tight"', '800 24px "Inter Tight"'].map((f) => document.fonts.load(f))).catch(() => {})
    : Promise.resolve();
  BG.onFonts = (fn) => { fonts.then(fn); };

  /* ---- Surfaces ---- */
  BG.surface = (canvas, onResize) => {
    const ctx = canvas.getContext('2d');
    const s = { canvas, ctx, W: 0, H: 0, dpr: 1, redraw: null };
    s.fit = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h || (w === s.W && h === s.H && dpr === s.dpr)) return false;
      s.W = w; s.H = h; s.dpr = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (onResize) onResize(s);
      return true;
    };
    s.begin = () => {
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      ctx.clearRect(0, 0, s.W, s.H);
    };
    const refit = () => { if (s.fit() && s.redraw) s.redraw(); };
    if ('ResizeObserver' in window) new ResizeObserver(refit).observe(canvas);
    else addEventListener('resize', refit);
    s.fit();
    return s;
  };

  /* ---- One shared frame for everything that moves ---- */
  const live = new Set();
  let raf = 0, prev = 0;
  const frame = (now) => {
    raf = 0;
    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60;
    prev = now;
    live.forEach((f) => f(dt));
    if (live.size) raf = requestAnimationFrame(frame);
    else prev = 0;
  };
  BG.play = (f) => { live.add(f); if (!raf) { prev = 0; raf = requestAnimationFrame(frame); } };
  BG.pause = (f) => { live.delete(f); };

  /* Calls fn(true) while at least `ratio` of el is on screen, fn(false) otherwise. */
  BG.watch = (el, fn, ratio = 0.01) => {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver((es) => es.forEach((e) => fn(e.isIntersecting && e.intersectionRatio >= ratio)), { threshold: [0, ratio, 1] }).observe(el);
  };

  /* ---- Drawing vocabulary ---- */
  const hasLS = typeof CanvasRenderingContext2D !== 'undefined' && 'letterSpacing' in CanvasRenderingContext2D.prototype;
  const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  const SANS = '"Inter Tight", "Inter Tight Fallback", Arial, Helvetica, sans-serif';
  const d = (BG.d = {});
  d.mono = (size, w = 500) => `${w} ${size}px ${MONO}`;
  d.sans = (size, w = 600) => `${w} ${size}px ${SANS}`;
  d.track = (ctx, px) => { if (hasLS) ctx.letterSpacing = `${px.toFixed(2)}px`; };

  /* The label voice: Geist Mono, uppercase, tracked +0.1em. */
  d.label = (ctx, text, x, y, size, color, align = 'left', base = 'middle', weight = 500) => {
    ctx.font = d.mono(size, weight);
    d.track(ctx, size * 0.1);
    ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color;
    ctx.fillText(String(text).toUpperCase(), x, y);
    d.track(ctx, 0);
  };
  d.labelW = (ctx, text, size, weight = 500) => {
    ctx.font = d.mono(size, weight);
    d.track(ctx, size * 0.1);
    const w = ctx.measureText(String(text).toUpperCase()).width;
    d.track(ctx, 0);
    return w;
  };
  /* Mono text as written (tokens keep their case). */
  d.code = (ctx, text, x, y, size, color, align = 'left', base = 'middle') => {
    ctx.font = d.mono(size, 500);
    ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  d.codeW = (ctx, text, size) => { ctx.font = d.mono(size, 500); return ctx.measureText(text).width; };

  d.line = (ctx, x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  d.sq = (ctx, x, y, s, color) => { ctx.fillStyle = color; ctx.fillRect(x - s / 2, y - s / 2, s, s); };
  d.hollow = (ctx, x, y, s, color) => { ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x - s / 2 + 0.5, y - s / 2 + 0.5, s - 1, s - 1); };
  d.chamfer = (ctx, x, y, w, h, c) => {
    ctx.beginPath();
    ctx.moveTo(x + c, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - c);
    ctx.lineTo(x + w - c, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + c); ctx.closePath();
  };
  /* The brand octagon, flat-topped. Vertex i sits at angle π/8 + iπ/4. */
  d.octagon = (ctx, cx, cy, r) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
  };
  /* Registration brackets: four corners of length n around a box. */
  d.brackets = (ctx, x, y, w, h, n) => {
    ctx.beginPath();
    ctx.moveTo(x, y + n); ctx.lineTo(x, y); ctx.lineTo(x + n, y);
    ctx.moveTo(x + w - n, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + n);
    ctx.moveTo(x + w, y + h - n); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - n, y + h);
    ctx.moveTo(x + n, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - n);
    ctx.stroke();
  };
  d.head = (ctx, x, y, ang, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * Math.cos(ang - 0.42), y - s * Math.sin(ang - 0.42));
    ctx.lineTo(x, y);
    ctx.lineTo(x - s * Math.cos(ang + 0.42), y - s * Math.sin(ang + 0.42));
    ctx.stroke();
  };
  d.arrow = (ctx, x1, y1, x2, y2, s = 7) => { d.line(ctx, x1, y1, x2, y2); d.head(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), s); };
  /* A tick scale along a horizontal line: minor ticks every `step`, major ticks (labelled) at `majors`. */
  d.ticksH = (ctx, x0, x1, y, v0, v1, step, majors, size, color, fmt = (v) => v) => {
    const X = (v) => x0 + ((v - v0) / (v1 - v0)) * (x1 - x0);
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    d.line(ctx, x0, y, x1, y);
    for (let v = v0; v <= v1 + 1e-9; v += step) d.line(ctx, X(v), y, X(v), y + 4);
    majors.forEach((v) => { d.line(ctx, X(v), y, X(v), y + 8); d.label(ctx, fmt(v), X(v), y + 16, size, color, 'center'); });
    return X;
  };
  /* A chip: mono text in a black-glass box with a hairline frame. Returns its box. */
  d.chip = (ctx, text, x, y, size, o = {}) => {
    const upper = o.upper !== false;
    const w = (upper ? d.labelW(ctx, text, size) : d.codeW(ctx, text, size)) + size * 1.4;
    const h = size + 12;
    const left = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    const top = y - h / 2;
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    d.chamfer(ctx, left, top, w, h, 4);
    ctx.fillStyle = o.fill || BG.P.pane; ctx.fill();
    ctx.strokeStyle = o.frame || 'rgba(241,238,230,.38)'; ctx.lineWidth = 1; ctx.stroke();
    if (upper) d.label(ctx, text, left + w / 2, y + 0.5, size, o.color || BG.P.fg, 'center');
    else d.code(ctx, text, left + w / 2, y + 0.5, size, o.color || BG.P.fg, 'center');
    return { x: left, y: top, w, h };
  };

  /* ---- Shared drawing: superposition (used by the film and by the explorer in chapter 09) ----
     Features are unit vectors spread evenly round the plane of two neurons; the neurons' activity h is the sum of
     the active features. Each feature is read back as max(0, w·h + b), with a bias just big enough to silence a
     single neighbour (Elhage et al. 2022, simplified). */
  const SP = (BG.sp = {});
  SP.dirs = (n) => Array.from({ length: n }, (_, i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / n; return [Math.cos(a), Math.sin(a)]; });
  SP.bias = (n) => -(Math.max(0, Math.cos((2 * Math.PI) / n)) + 0.05);
  SP.hidden = (n, on) => { const W = SP.dirs(n); let x = 0, y = 0; on.forEach((v, i) => { x += v * W[i][0]; y += v * W[i][1]; }); return [x, y]; };
  SP.read = (n, h) => { const W = SP.dirs(n), b = SP.bias(n); return W.map((w) => Math.max(0, w[0] * h[0] + w[1] * h[1] + b) / (1 + b)); };
  /* Draws the plane in box (x, y, w, h). on: per-feature 0..1 (eased), h: the neurons' activity. */
  SP.plane = (ctx, bx, by, bw, bh, n, names, on, h, ls, opt = {}) => {
    const P = BG.P;
    const cx = bx + bw / 2, cy = by + bh / 2;
    const R = Math.min(bw, bh) * 0.5;
    const ru = R * (opt.unit || 0.5);
    const W = SP.dirs(n);
    ctx.lineWidth = 1;
    // Axes: the two neurons, each a tick scale from -1 to 1.
    ctx.strokeStyle = 'rgba(241,238,230,.22)';
    d.line(ctx, cx - R * 0.98, cy, cx + R * 0.98, cy);
    d.line(ctx, cx, cy - R * 0.98, cx, cy + R * 0.98);
    for (let v = -1; v <= 1; v += 0.5) {
      if (!v) continue;
      const m = v % 1 === 0 ? 6 : 3;
      d.line(ctx, cx + v * ru, cy - m / 2, cx + v * ru, cy + m / 2);
      d.line(ctx, cx - m / 2, cy - v * ru, cx + m / 2, cy - v * ru);
    }
    d.label(ctx, 'Neuron 1', cx + R * 0.98, cy + 12, ls * 0.88, P.fg3, 'right');
    d.label(ctx, 'Neuron 2', cx + 8, cy - R * 0.94, ls * 0.88, P.fg3, 'left');
    ctx.strokeStyle = 'rgba(241,238,230,.1)';
    ctx.beginPath(); ctx.arc(cx, cy, ru, 0, Math.PI * 2); ctx.stroke();
    // Feature directions.
    W.forEach((w, i) => {
      const a = on[i] || 0;
      const x2 = cx + w[0] * ru, y2 = cy - w[1] * ru;
      ctx.globalAlpha = 0.35 + 0.65 * a;
      ctx.strokeStyle = P.fg; ctx.lineWidth = 1 + a;
      d.arrow(ctx, cx, cy, x2, y2, 6);
      ctx.lineWidth = 1;
      const lx = cx + w[0] * (ru + 12), ly = cy - w[1] * (ru + 12);
      const align = Math.abs(w[0]) < 0.25 ? 'center' : w[0] > 0 ? 'left' : 'right';
      d.label(ctx, names[i], lx, ly + (Math.abs(w[0]) < 0.25 ? (w[1] > 0 ? -6 : 6) : 0), ls * 0.86, a > 0.5 ? P.fg : P.fg3, align);
      ctx.globalAlpha = 1;
    });
    // The neurons' combined activity.
    const mag = Math.hypot(h[0], h[1]);
    if (mag > 0.02) {
      ctx.strokeStyle = P.signal; ctx.lineWidth = 2;
      d.arrow(ctx, cx, cy, cx + h[0] * ru, cy - h[1] * ru, 8);
      ctx.lineWidth = 1;
    }
    d.sq(ctx, cx, cy, 4, P.fg);
    return { cx, cy, ru, R };
  };
  /* Readout rows: name, true state, bar, verdict. Returns the number of wrong rows. */
  SP.rows = (ctx, bx, by, bw, bh, n, names, truth, read, ls) => {
    const P = BG.P;
    const rh = Math.min(30, bh / n);
    const nameW = bw * 0.36, barX = bx + nameW + 26, barW = bw - nameW - 26 - ls * 6;
    let wrong = 0;
    for (let i = 0; i < n; i++) {
      const y = by + rh * (i + 0.5);
      const on = truth[i] > 0.5, rd = read[i] > 0.02, ok = on === rd;
      if (!ok) wrong++;
      d.label(ctx, names[i], bx + nameW, y, ls * 0.86, on ? P.fg : P.fg3, 'right');
      if (on) d.sq(ctx, bx + nameW + 12, y, 6, P.fg); else d.hollow(ctx, bx + nameW + 12, y, 6, P.fg3);
      ctx.fillStyle = 'rgba(241,238,230,.08)';
      ctx.fillRect(barX, y - 4, barW, 8);
      ctx.fillStyle = ok ? P.fg : P.signal;
      ctx.fillRect(barX, y - 4, Math.max(read[i] > 0.002 ? 1 : 0, barW * Math.min(1.15, read[i]) / 1.15), 8);
      d.label(ctx, ok ? 'ok' : 'wrong', bx + bw, y, ls * 0.82, ok ? P.fg3 : P.signal, 'right');
    }
    return wrong;
  };
})();
