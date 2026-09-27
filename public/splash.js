/* Blackglass first-visit splash. Vanilla JS + Web Animations API. Load with defer. */
(() => {
  const CONFIG = {
    speed: 1, // global multiplier; ?splash=debug multiplies it by debugSpeed
    debugSpeed: 0.25,
    ease: {
      inOut: 'cubic-bezier(.76,0,.24,1)',
      out: 'cubic-bezier(.16,1,.3,1)',
      dive: 'cubic-bezier(.7,0,.84,0)'
    },
    rim: { at: 200, ms: 800 },
    pane: { at: 1000, ms: 300 },
    facet: { at: 1300, ms: 450 },
    glint: { at: 1950, ms: 160, bloom: 0.55, tap: 1.015 },
    slide: { at: 2400, ms: 650 },
    word: { at: 2520, ms: 520 },
    exit: { at: 3750, cap: 6000, fade: 150, ms: 700 },
    reduced: { hold: 600, fade: 250 },
    key: 'bg-splash'
  };
  const C = CONFIG, E = C.ease;
  const d = document, w = window;
  const root = d.getElementById('bgs');
  const done = () => { w.splashDone = true; w.dispatchEvent(new Event('splash:done')); };
  if (!root) return done();

  const mode = new URLSearchParams(location.search).get('splash');
  const debug = mode === 'debug';
  let seen = null;
  try { seen = sessionStorage.getItem(C.key); sessionStorage.setItem(C.key, '1'); } catch { /* storage blocked: still play once */ }
  // Once per session, and never in the way of a deep link such as /#apply.
  if ((seen || location.hash) && !mode) { root.remove(); return done(); }

  root.style.animation = 'none'; // cancel the CSS fail-safe
  // Everything beside the overlay, at each level up to <body>, is inert until splash:done.
  const inerted = [];
  for (let n = root; n !== d.body && n.parentElement; n = n.parentElement) {
    for (const s of n.parentElement.children) {
      if (s !== n && !s.inert && !/^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE)$/.test(s.tagName)) inerted.push(s);
    }
  }
  inerted.forEach(n => { n.inert = true; });

  const speed = C.speed * (debug ? C.debugSpeed : 1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => root.querySelector(s);
  const tl = d.timeline, clockNow = () => tl.currentTime ?? performance.now();
  const anims = [], lit = [];
  let origin = clockNow(), paused = false, held = 0, exitAt = null, raf = 0, dog = 0, gone = false, fading = null, bar = null;
  let loaded = d.readyState === 'complete';

  // One clock: every animation's currentTime is the splash time in ms, whatever the speed.
  const now = () => paused ? held : (clockNow() - origin) * speed;
  const sync = a => { if (paused) { a.pause(); a.currentTime = held; } else a.startTime = origin; };
  const seek = t => { held = t; origin = clockNow() - t / speed; anims.forEach(sync); };
  const pause = p => { const t = now(); paused = p; seek(t); };
  const play = (node, frames, at, ms, easing, fill) => {
    const a = node.animate(frames, { delay: at, duration: ms, easing, fill });
    a.playbackRate = speed;
    sync(a);
    anims.push(a);
    return a;
  };
  const cut = (node, v, at) => play(node, [{ opacity: v }, { opacity: v }], at, 0, 'linear', 'forwards');
  const tf = (x, y, s) => `translate(${x}px,${y}px) translate(44px,44px) scale(${s}) translate(-44px,-44px)`;

  const teardown = () => {
    if (gone) return;
    gone = true;
    cancelAnimationFrame(raf);
    clearTimeout(dog);
    off();
    root.remove();
    inerted.forEach(n => { n.inert = false; });
    done();
  };

  const mark = $('.bgs-m'), hud = $('.bgs-h'), clock = $('.bgs-tr span');
  const [pane, facet, glint] = ['#pane', '#facet', '#glint'].map($);
  const lis = root.querySelectorAll('.bgs-bl li');
  const beats = [C.rim.at + C.rim.ms, C.pane.at + C.pane.ms, C.facet.at + C.facet.ms, C.glint.at];

  // Mark units (u px each) and the offset from the window centre (44,44) to the viewport centre.
  const geo = () => {
    const r = mark.getBoundingClientRect(), u = r.height / 88;
    return { r, u, x: (root.clientWidth / 2 - r.left) / u - 44, y: (root.clientHeight / 2 - r.top) / u - 44 };
  };
  // The mark builds at viewport centre, then travels to its slot in the lockup.
  const slideFrames = () => { const { x, y } = geo(); return [{ transform: `translate(${x}px,${y}px)` }, { transform: 'translate(0px,0px)' }]; };

  const exit = at => {
    exitAt = at;
    const { u, x, y } = geo(), vw = root.clientWidth, vh = root.clientHeight;
    // Ground: a square around the window, big enough to cover the viewport for the whole dive.
    const R = Math.hypot(vw, vh) / u + 88, g = $('.bgs-gr');
    g.setAttribute('d', `M${44 - R} ${44 - R}H${44 + R}V${44 + R}H${44 - R}ZM7 22.101 22.101 7H65.899L81 22.101V65.899L65.899 81H22.101L7 65.899Z`);
    [hud, $('.bgs-w'), $('.bgs-bg')].forEach(n => cut(n, 0, at));
    cut(g, 1, at);
    [pane, facet, glint].forEach(n => play(n, [{ opacity: 1 }, { opacity: 0 }], at, C.exit.fade, 'linear', 'forwards'));
    // Window = inner octagon: |x|,|y| <= 37 and |x|+|y| <= 58.899 (mark units). Scale until it holds every corner.
    const s = 1.03 * Math.max(vw / 74, vh / 74, (vw + vh) / 117.798) / u;
    play($('.bgs-d'), [{ transform: tf(0, 0, 1) }, { transform: tf(x, y, s) }], at, C.exit.ms, E.dive, 'forwards');
  };

  // Settled states are plain attributes, never held animation fills (a held fill keeps an element
  // composited and shifts its anti-aliasing). Derived from time, so scrubbing works both ways.
  const settle = [
    ['#rim', C.rim.at + C.rim.ms, 'mask'],
    ['#pane', C.pane.at + C.pane.ms, 'style', 'opacity:1'],
    ['#facet', C.facet.at + C.facet.ms, 'clip-path'],
    ['#glint', C.glint.at, 'style', 'opacity:1'],
    ['#wordmark', C.word.at + C.word.ms, 'clip-path']
  ].map(([s, at, attr, after = null]) => { const n = $(s); return { n, at, attr, after, before: n.getAttribute(attr) }; });
  const render = t => {
    clock.textContent = (t / 1000).toFixed(3);
    lis.forEach((li, i) => { const on = t >= beats[i]; if (lit[i] !== on) li.classList.toggle('on', lit[i] = on); });
    settle.forEach(s => {
      const on = t >= s.at;
      if (s.on === on) return;
      const v = (s.on = on) ? s.after : s.before;
      if (v === null) s.n.removeAttribute(s.attr);
      else s.n.setAttribute(s.attr, v);
    });
  };

  const tick = () => {
    const t = now();
    render(t);
    if (bar && !paused) bar.value = t;
    if (exitAt === null && t >= C.exit.at && (loaded || debug || t >= C.exit.cap)) exit(debug ? C.exit.at : t);
    if (exitAt !== null && !paused && t >= exitAt + C.exit.ms) return teardown();
    raf = requestAnimationFrame(tick);
  };

  const fadeOut = () => {
    if (fading) return;
    fading = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: C.reduced.fade / speed, fill: 'forwards' });
    fading.finished.then(teardown, teardown);
  };

  const skip = e => {
    if (bar && bar.parentNode.contains(e.target)) return;
    if (e.type === 'wheel' || / |Arrow|Page|Home|End/.test(e.key)) e.preventDefault();
    if (reduced) return fadeOut();
    if (exitAt !== null) return;
    // Snap to the finished lockup, then leave.
    const t = Math.max(now(), C.exit.at);
    paused = false;
    seek(t);
    exit(t);
  };
  const onResize = () => { if (exitAt === null) slide.effect.setKeyframes(slideFrames()); };
  const evs = ['pointerdown', 'keydown', 'wheel'], opts = { capture: true, passive: false };
  const off = () => {
    evs.forEach(t => w.removeEventListener(t, skip, opts));
    w.removeEventListener('resize', onResize);
  };

  let slide;
  try {
    // Build animations fill backwards only; what each beat leaves behind is applied by render().
    // 01 RIM: two mask strokes leave the top-left chamfer and meet at the bottom-right one.
    root.querySelectorAll('.bgs-rs').forEach(p => play(p, [{ strokeDashoffset: 147 }, { strokeDashoffset: 0 }], C.rim.at, C.rim.ms, E.inOut, 'backwards'));
    // 02 PANE: glass is set.
    play(pane, [{ opacity: 0 }, { opacity: 1 }], C.pane.at, C.pane.ms, E.inOut, 'backwards');
    // 03 FACET: hard edge parallel to the seam, from the top-left chamfer (x+y=29.1) to just past the seam (x+y=88).
    play($('.bgs-fw'), [{ transform: 'translate(14.5505px,14.5505px)' }, { transform: 'translate(45px,45px)' }], C.facet.at, C.facet.ms, E.out, 'backwards');
    // 04 GLINT: hard cut (render() switches it on), one bloom, one tap.
    // Transient effects hold no fill, so the settled mark carries no leftover transform.
    play($('.bgs-fx'), [{ opacity: C.glint.bloom }, { opacity: 0 }], C.glint.at, C.glint.ms, E.out, 'none');
    play($('.bgs-t'), [{ transform: tf(0, 0, C.glint.tap) }, { transform: tf(0, 0, 1) }], C.glint.at, C.glint.ms, E.out, 'none');
    // 05 LOCKUP: mark to its slot; wordmark wiped in by a hard vertical edge carrying a 1px scanline.
    slide = play($('.bgs-s'), slideFrames(), C.slide.at, C.slide.ms, E.inOut, 'backwards');
    const sweep = [{ transform: 'translateX(0px)' }, { transform: 'translateX(414px)' }];
    [$('.bgs-wr'), $('.bgs-sl')].forEach(n => play(n, sweep, C.word.at, C.word.ms, E.out, 'backwards'));
    play($('.bgs-sl'), [{ opacity: 1 }, { opacity: 1 }], C.word.at, C.word.ms, 'linear', 'none');

    evs.forEach(t => w.addEventListener(t, skip, opts));
    w.addEventListener('resize', onResize);
    w.addEventListener('load', () => { loaded = true; }, { once: true });

    if (reduced) {
      paused = true;
      seek(C.exit.at);
      render(C.exit.at);
      setTimeout(fadeOut, C.reduced.hold / speed);
      return;
    }

    if (debug) {
      const el = d.createElement('div');
      el.className = 'bgs-dbg';
      el.innerHTML = `<button type="button">Pause</button><input type="range" min="0" max="${C.exit.at + C.exit.ms}" step="1">`;
      const [btn, range] = el.children;
      const toggle = p => { pause(p); btn.textContent = p ? 'Play' : 'Pause'; };
      btn.onclick = () => toggle(!paused);
      range.oninput = () => { if (!paused) toggle(true); seek(+range.value); };
      root.append(el);
      bar = range;
    } else {
      dog = setTimeout(teardown, (C.exit.cap + C.exit.ms + 2000) / speed);
    }
    raf = requestAnimationFrame(tick);
  } catch {
    teardown();
  }
})();
