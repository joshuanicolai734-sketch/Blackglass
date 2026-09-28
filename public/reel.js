/* Blackglass showreel: a 12 s tempo film, seamless loop, no audio. Loaded by site.js after the page has loaded, never
   with reduced motion. Every layer is server-rendered by components/site/reel.tsx, and its first frame is the poster;
   this script only moves those layers, with transform and opacity, from a pure seek(t): no randomness, no state, so
   any frame renders the same way in any order and window.blackglassReel.seek(t) can drive a frame capture to MP4.
   Beat sheet and rules: design/DESIGN_LANGUAGE.md.

    0.0  Squat    one back squat at a 3-1-1 tempo. Brace 0.6 s, lower 3 s under control, pause 1 s in the hole,
                  drive up in under a second, lock out dead still. The readout lights the phase in play and the
                  volt square steps to it; at lockout the whole tempo is lit again, as on the poster.
    6.0  The app  Today · Train · Learn · Fuel, a hard cut on each second; each module drives in.
   10.0  Lockup   the mark drives in along the 45° facet, then the wordmark and the line; dead still to 12.0.
   12.0 = 0.0     hard cut back to the braced athlete: seek(12) and seek(0) are the same frame.
   Plays only while at least half the reel is on screen. */
(() => {
  const host = document.querySelector('[data-reel]');
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = host.querySelector('.reel-stage');
  const { model: M, dur: DUR } = JSON.parse(host.dataset.geometry);
  const $ = (s) => [...host.querySelectorAll(s)];

  /* ---- Time helpers ---- */
  const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const k = (t, a, b) => clamp((t - a) / (b - a));
  const expo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  // A move with a short ramp in, a steady middle and a ramp out: the velocity profile of a controlled rep.
  const rep = (x, a, b) => { const v = 1 / (1 - a / 2 - b / 2); return x <= 0 ? 0 : x >= 1 ? 1 : x < a ? (v * x * x) / (2 * a) : x < 1 - b ? v * (x - a / 2) : 1 - (v * (1 - x) * (1 - x)) / (2 * b); };
  const quart = (x) => 1 - Math.pow(1 - x, 4);
  const DRIVE = 0.15, LOAD = 0.35; // --t-drive, --t-load
  const DIM = 0.28;
  // When each tempo column changes: [time, [Lower, Pause, Drive]].
  const LIT = [[0.6, [1, DIM, DIM]], [3.6, [DIM, 1, DIM]], [4.6, [DIM, DIM, 1]], [5.6, [1, 1, 1]]];

  /* ---- The athlete: the same solver as pose() in reel.tsx (keep them identical; the poster is its u = 0). ---- */
  const R = Math.PI / 180;
  const tr = (P, rad) => `translate(${P[0].toFixed(2)} ${P[1].toFixed(2)}) rotate(${(rad / R).toFixed(2)})`;
  function pose(u) {
    const s = (M.top[0] + (M.bottom[0] - M.top[0]) * u) * R, f = (M.top[1] + (M.bottom[1] - M.top[1]) * u) * R;
    const A = M.ankle;
    const K = [A[0] + M.shin * Math.sin(s), A[1] - M.shin * Math.cos(s)];
    const H = [K[0] - M.thigh * Math.sin(f), K[1] - M.thigh * Math.cos(f)];
    const a = M.bar[0], d = -M.bar[1];
    const p = Math.atan2(d, a) + Math.asin((M.mid - H[0]) / Math.hypot(a, d));
    const loc = (x, y) => [H[0] + x * Math.sin(p) + y * Math.cos(p), H[1] - x * Math.cos(p) + y * Math.sin(p)];
    const S = loc(M.sh[0], M.sh[1]), B = loc(M.bar[0], M.bar[1]);
    const D = Math.min(Math.hypot(B[0] - S[0], B[1] - S[1]), M.upper + M.fore - 0.01);
    const ua = Math.atan2(B[1] - S[1], B[0] - S[0]) - Math.acos((M.upper ** 2 + D * D - M.fore ** 2) / (2 * M.upper * D));
    const E = [S[0] + M.upper * Math.cos(ua), S[1] + M.upper * Math.sin(ua)];
    return {
      shin: tr(A, Math.atan2(K[1] - A[1], K[0] - A[0])), thigh: tr(K, Math.atan2(H[1] - K[1], H[0] - K[0])), torso: tr(H, p - Math.PI / 2),
      upper: tr(S, ua), fore: tr(E, Math.atan2(B[1] - E[1], B[0] - E[0])),
    };
  }
  // Depth over the rep: brace, 3 s down, 1 s pause, up in 0.85 s, lockout.
  const depth = (t) => {
    if (t < 0.6 || t >= 6) return 0;
    if (t < 3.6) return rep(k(t, 0.6, 3.6), 0.15, 0.25);
    if (t < 4.6) return 1;
    return 1 - rep(k(t, 4.6, 5.45), 0.1, 0.6);
  };

  /* ---- Layers ---- */
  const joints = $('[data-j]').map((e) => [e, e.dataset.j]);
  const scenes = $('[data-scene]'), cols = $('[data-col]'), mark = host.querySelector('[data-mark]'), mods = $('[data-mod]');
  const lock = scenes[2].children;
  // Writes are cached, so a still layer costs nothing: between moves the reel does no style or paint work.
  const last = new Map();
  const set = (e, key, v) => { const id = last.get(e) || {}; if (id[key] === v) return; id[key] = v; last.set(e, id); if (key === 'transform' && e.ownerSVGElement) e.setAttribute('transform', v); else e.style[key] = v; };
  const op = (e, v) => set(e, 'opacity', String(Math.round(v * 1000) / 1000));
  const css = (e, v) => set(e, 'transform', v);
  let lastU = -1;

  function seek(t) {
    t = ((t % DUR) + DUR) % DUR;
    const scene = t < 6 ? 0 : t < 10 ? 1 : 2;
    scenes.forEach((s, i) => op(s, i === scene ? 1 : 0));
    host.dataset.scene = String(scene);

    // Squat.
    const u = depth(t);
    if (u !== lastU) { const P = pose(u); joints.forEach(([e, n]) => set(e, 'transform', P[n])); lastU = u; }
    // The readout: before and after the rep all three phases are lit; during it, only the phase in play. A phase
    // lights at drive speed and dims at load speed. The volt square steps to the phase in play and stays under Drive.
    cols.forEach((c, i) => {
      let v = 1;
      for (const [a, to] of LIT) {
        if (t < a) break;
        if (to[i] !== v) v += (to[i] - v) * (to[i] > v ? expo(k(t, a, a + DRIVE)) : quart(k(t, a, a + LOAD)));
      }
      op(c, v);
    });
    css(mark, `translateX(${((expo(k(t, 3.6, 3.6 + DRIVE)) + expo(k(t, 4.6, 4.6 + DRIVE))) * 100).toFixed(2)}%)`);

    // The app: a module a second, each driving in along the reading axis.
    mods.forEach((m, i) => {
      const a = 6 + i, on = scene === 1 && t >= a && t < a + 1, x = on ? expo(k(t, a, a + DRIVE)) : 0;
      op(m, x);
      css(m, `translateX(${((1 - x) * -2).toFixed(2)}%)`);
    });

    // Lockup: the mark drives in along the facet's 45°, the wordmark and the line follow along the reading axis.
    [0, 0.1, 0.2].forEach((d, i) => {
      const x = expo(k(t, 10 + d, 10 + d + DRIVE));
      op(lock[i], x);
      css(lock[i], i === 0 ? `translate(${((1 - x) * -6).toFixed(2)}%, ${((1 - x) * 6).toFixed(2)}%)` : `translateX(${((1 - x) * -3).toFixed(2)}%)`);
    });
  }

  /* ---- Playback: autoplay from the poster frame; pause offscreen, when the tab is hidden, or on request. ---- */
  const toggle = stage.querySelector('[data-reel-toggle]');
  const chapters = stage.querySelector('[data-reel-chapters]');
  const chFill = chapters.querySelector('.rc-fill'), chRun = chapters.querySelector('.rc-run');
  const chBtns = [...chapters.querySelectorAll('[data-at]')];
  let chOn = -1;
  // The timeline is only drawn while it can be seen (hover, focus, pause), so hidden it costs no style work.
  let chShown = false;
  const drawChapters = (t) => {
    t = ((t % DUR) + DUR) % DUR;
    const on = chBtns.findLastIndex((b) => t >= +b.dataset.at);
    if (on !== chOn) { chBtns.forEach((b, i) => { b.classList.toggle('is-on', i === on); if (i === on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); chOn = on; }
    if (!chShown && !userPaused) return;
    chFill.style.transform = `scaleX(${(t / DUR).toFixed(4)})`;
    chRun.style.transform = `translateX(${((t / DUR) * 100).toFixed(2)}%)`;
  };
  const toggleText = toggle.querySelector('[data-reel-toggle-text]');
  let base = 0, t0 = 0, userPaused = false, inView = false, running = false, raf = 0, current = 0;
  const now = () => (running ? (base + (performance.now() - t0) / 1000) % DUR : current);
  const frame = () => { current = now(); seek(current); drawChapters(current); raf = requestAnimationFrame(frame); };
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
    host.classList.toggle('is-paused', userPaused);
    sync();
  });
  // Chapters are one toolbar: a single tab stop, arrow keys (and Home, End) move between them, Enter or Space jumps.
  const rove = (i) => { chBtns.forEach((b, j) => { b.tabIndex = j === i ? 0 : -1; }); chBtns[i].focus(); };
  chBtns.forEach((b, i) => {
    b.addEventListener('click', () => {
      chBtns.forEach((c, j) => { c.tabIndex = j === i ? 0 : -1; });
      current = +b.dataset.at + 0.4; // just past the chapter's opening drive, so a paused jump lands on a full frame
      if (running) { base = current; t0 = performance.now(); }
      seek(current); drawChapters(current);
    });
    b.addEventListener('keydown', (e) => {
      const n = chBtns.length, key = e.key;
      const next = key === 'ArrowRight' || key === 'ArrowDown' ? (i + 1) % n : key === 'ArrowLeft' || key === 'ArrowUp' ? (i - 1 + n) % n : key === 'Home' ? 0 : key === 'End' ? n - 1 : -1;
      if (next >= 0) { e.preventDefault(); rove(next); }
    });
  });
  const show = (v) => () => { chShown = v || stage.matches(':hover') || chapters.matches(':focus-within'); drawChapters(current); };
  stage.addEventListener('pointerenter', show(true)); stage.addEventListener('pointerleave', show(false));
  chapters.addEventListener('focusin', show(true)); chapters.addEventListener('focusout', show(false));
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver((e) => { inView = e[0].intersectionRatio >= 0.5; host.classList.toggle('in-view', inView); sync(); }, { threshold: [0, 0.5, 1] }).observe(stage);

  seek(current);
  host.classList.add('is-live');
  toggle.hidden = false;
  chapters.hidden = false;
  drawChapters(current);
  // Frame capture: blackglassReel.seek(t) renders any moment and stops playback.
  window.blackglassReel = { duration: DUR, seek: (t) => { userPaused = true; sync(); current = t; seek(t); drawChapters(t); } };
})();
