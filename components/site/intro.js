/* Blackglass intro. Inlined after the #intro markup on the homepage, so it starts with the first paint.
   The head gate (app/layout.tsx) has already decided to play it and set html[data-intro="play"].
   Web Animations API only; every timing lives in T. Any click, tap, key or scroll skips to the dive. */
(function () {
  var d = document, h = d.documentElement, root = d.getElementById('intro');
  if (!root || h.dataset.intro !== 'play' || !root.animate) { h.dataset.intro = 'done'; return; }

  var T = {
    inOut: 'cubic-bezier(.76,0,.24,1)', out: 'cubic-bezier(.16,1,.3,1)', diveEase: 'cubic-bezier(.7,0,.84,0)',
    rim: [60, 520],      // two strokes leave the top-left chamfer and meet at the bottom-right
    pane: [360, 260],    // the glass is set
    facet: [440, 330],   // the lit facet wipes in along the 45° seam
    sweep: [760, 380],   // a band of light passes through the pane
    glint: 840,          // …and catches the glint
    slide: [900, 380],   // the mark moves to its place in the lockup
    word: [980, 330],    // the wordmark resolves behind a hard edge
    exit: 1340,          // camera dives through the pane into the hero
    fade: 140, dive: 560
  };
  var $ = function (s) { return root.querySelector(s); };
  var mark = $('.in-m'), anims = [], started = performance.now(), leaving = false;
  var play = function (el, frames, t, easing, fill) {
    var a = el.animate(frames, { delay: t[0], duration: t[1], easing: easing || 'linear', fill: fill || 'both' });
    anims.push(a); return a;
  };
  var tf = function (x, y, s) { return 'translate(' + x + 'px,' + y + 'px) translate(44px,44px) scale(' + s + ') translate(-44px,-44px)'; };
  // Offset (mark units) from the window centre (44,44) to the viewport centre, and px per unit.
  var geo = function () {
    var r = mark.getBoundingClientRect(), u = r.height / 88;
    return { u: u, x: (root.clientWidth / 2 - r.left) / u - 44, y: (root.clientHeight / 2 - r.top) / u - 44 };
  };

  var finish = function () {
    h.dataset.intro = 'done';
    off();
    root.dispatchEvent(new Event('intro:done', { bubbles: true }));
  };
  var off = function () {};
  try {
  var g0 = geo();
  root.querySelectorAll('.in-rs').forEach(function (p) { play(p, [{ strokeDashoffset: 147 }, { strokeDashoffset: 0 }], T.rim, T.inOut); });
  play($('#in-pane'), [{ opacity: 0 }, { opacity: 1 }], T.pane, T.inOut);
  play($('.in-fw'), [{ transform: 'translate(14.5505px,14.5505px)' }, { transform: 'translate(45px,45px)' }], T.facet, T.out);
  play($('.in-sw'), [{ transform: 'translate(-8px,-8px)' }, { transform: 'translate(88px,88px)' }], T.sweep, T.inOut);
  play($('#in-glint'), [{ opacity: 0 }, { opacity: 1 }], [T.glint, 0]);
  play($('.in-s'), [{ transform: 'translate(' + g0.x + 'px,' + g0.y + 'px)' }, { transform: 'translate(0px,0px)' }], T.slide, T.inOut);
  var sweep = [{ transform: 'translateX(0px)' }, { transform: 'translateX(414px)' }];
  play($('.in-wr'), sweep, T.word, T.out);

  } catch { finish(); return; } // any failure: get out of the way at once

  var exit = function () {
    if (leaving) return;
    leaving = true;
    try { dive(); } catch { finish(); }
  };
  var dive = function () {
    anims.forEach(function (a) { a.finish(); });
    h.dataset.intro = 'out';
    var g = geo(), vw = root.clientWidth, vh = root.clientHeight, u = g.u;
    var R = Math.hypot(vw, vh) / u + 88, ground = $('.in-gr');
    ground.setAttribute('d', 'M' + (44 - R) + ' ' + (44 - R) + 'H' + (44 + R) + 'V' + (44 + R) + 'H' + (44 - R) + 'ZM7 22.101 22.101 7H65.899L81 22.101V65.899L65.899 81H22.101L7 65.899Z');
    ground.style.opacity = 1;
    $('.in-bg').style.opacity = 0;
    $('.in-w').style.opacity = 0;
    ['#in-pane', '#in-facet', '#in-glint'].forEach(function (s) {
      $(s).animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.fade, fill: 'forwards' });
    });
    // The window is the inner octagon: |x|,|y| <= 37 and |x|+|y| <= 58.899. Scale until it holds every corner.
    var s = 1.03 * Math.max(vw / 74, vh / 74, (vw + vh) / 117.798) / u;
    $('.in-d').animate([{ transform: tf(0, 0, 1) }, { transform: tf(g.x, g.y, s) }],
      { duration: T.dive, easing: T.diveEase, fill: 'forwards' }).finished.then(finish, finish);
  };

  var skip = function (e) {
    if (e.type === 'wheel' || / |Arrow|Page|Home|End/.test(e.key || '')) e.preventDefault();
    exit();
  };
  var evs = ['pointerdown', 'keydown', 'wheel'], opts = { capture: true, passive: false };
  off = function () { evs.forEach(function (t) { removeEventListener(t, skip, opts); }); };
  evs.forEach(function (t) { addEventListener(t, skip, opts); });
  setTimeout(exit, Math.max(0, T.exit - (performance.now() - started)));
})();
