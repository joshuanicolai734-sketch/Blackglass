/* Blackglass site enhancements. A deferred <script> in app/layout.tsx: it runs once per document at
   DOMContentLoaded, without waiting for hydration. Everything here is optional: the pages are complete without it.
   Timings and easing come from the CSS motion tokens. */
(() => {
  const d = document, w = window, root = d.documentElement;
  if (w.blackglassSite) return; // one initialisation per document, however the script is reached
  w.blackglassSite = true;
  /* This script can run before React hydrates the page. Listeners and attributes are safe then, but text or child
     changes would make hydration fail and rebuild the DOM, so those wait until React has claimed it. */
  const whenHydrated = (fn) => {
    const probe = d.querySelector('main') || d.body;
    const t0 = performance.now();
    const check = () => {
      if (Object.keys(probe).some((k) => k.startsWith('__react')) || performance.now() - t0 > 8000) fn();
      else setTimeout(check, 50);
    };
    check();
  };
  const reduce = w.matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get: (k, s = localStorage) => { try { return s.getItem(k); } catch { return null; } },
    set: (k, v, s = localStorage) => { try { s.setItem(k, v); } catch { /* storage blocked */ } },
  };

  /* ---- Measurement: daily counts only. No cookies, no identifiers, nothing typed into forms. ---- */
  const params = new URLSearchParams(location.search);
  if (params.get('utm_source')) store.set('bg-src', params.get('utm_source').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24), sessionStorage);
  const source = store.get('bg-src', sessionStorage) || 'none';
  const track = (name) => {
    const body = JSON.stringify({ e: name, s: source });
    try {
      if (!navigator.sendBeacon?.('/api/events', new Blob([body], { type: 'application/json' }))) {
        fetch('/api/events', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    } catch { /* never let measurement break the page */ }
  };
  w.blackglassTrack = track;
  const page = d.querySelector('main[data-page]')?.dataset.page || (location.pathname === '/' ? 'home' : '');
  if (page) track(`${page}_view`);
  d.addEventListener('click', (e) => {
    const el = e.target.closest?.('[data-track]');
    if (el) track(el.dataset.track);
  });

  whenHydrated(() => d.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); }));

  /* ---- Mobile menu (a native <details>; this only adds polish). While it's open, everything behind the sheet is
     inert, so Tab stays inside the menu. ---- */
  const menu = d.querySelector('.menu');
  if (menu) {
    const behind = () => [d.querySelector('main'), d.querySelector('.ftr'), d.querySelector('[data-sticky]'), ...d.querySelectorAll('.hdr > :not(.menu)')].filter(Boolean);
    const sync = () => { root.style.overflow = menu.open ? 'hidden' : ''; behind().forEach((el) => { el.inert = menu.open; }); };
    menu.addEventListener('toggle', sync);
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.open = false; sync(); } });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; sync(); menu.querySelector('summary').focus(); } });
    w.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) { menu.open = false; sync(); } });
  }

  /* ---- Product demonstration: accessible tabs with arrow keys and swipe.
     Load · Drive · Lockout: the shared indicator drives to the chosen tab (--t-drive, expo). The incoming screen
     drives in 24px along the direction of travel from the first frame; the outgoing one crosses under it and yields
     late (opacity out at the halfway mark of --t-load, --ease-load), so the frame is never empty. The inactive
     screens ship as data-src (no bytes before the page's load event) and are warmed once the demo is near or
     touched; a swap waits for the incoming image to decode, capped at 300ms. Reduced motion: an instant swap. ---- */
  const demo = d.querySelector('[data-demo]');
  if (demo) whenHydrated(() => {
    const tabs = [...demo.querySelectorAll('[data-demo-tab]')];
    const panels = [...demo.querySelectorAll('[data-demo-panel]')];
    const list = demo.querySelector('[role="tablist"]');
    const css = getComputedStyle(root);
    const ms = (v) => parseFloat(css.getPropertyValue(v)) || 0;
    const ease = (v) => css.getPropertyValue(v).trim() || 'ease-out';
    let current = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    let interacted = false, turn = 0;
    const ink = () => {
      const t = tabs[current], sq = t.querySelector('.sq');
      list.style.setProperty('--bx', t.offsetLeft);
      list.style.setProperty('--bw', t.offsetWidth);
      list.style.setProperty('--sx', t.offsetLeft + (sq ? sq.offsetLeft : 0));
    };
    ink();
    list.setAttribute('data-ink', '');
    requestAnimationFrame(() => requestAnimationFrame(() => list.setAttribute('data-ink-live', '')));
    if ('ResizeObserver' in w) new ResizeObserver(ink).observe(list);
    d.fonts?.ready.then(ink);

    // Warm the deferred screens: after load, when the demo is within ~600px, or on first contact with the tabs.
    const shots = [...demo.querySelectorAll('img[data-src]')];
    const warm = (img) => {
      if (!img?.dataset.src) return;
      img.fetchPriority = 'low';
      if (img.dataset.srcset) { img.sizes = img.dataset.sizes || ''; img.srcset = img.dataset.srcset; }
      img.src = img.dataset.src;
      delete img.dataset.src;
    };
    const warmAll = () => shots.forEach(warm);
    ['pointerenter', 'focusin', 'touchstart'].forEach((t) => list.addEventListener(t, warmAll, { once: true, passive: true }));
    const afterLoad = (fn) => (d.readyState === 'complete' ? fn() : w.addEventListener('load', fn, { once: true }));
    afterLoad(() => {
      if (!('IntersectionObserver' in w)) return warmAll();
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); warmAll(); } }, { rootMargin: '600px 0px' });
      io.observe(demo);
    });
    const ready = (img) => {
      if (!img) return Promise.resolve();
      warm(img);
      if (img.complete && img.naturalWidth > 1) return Promise.resolve();
      return Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 300))]);
    };

    const leaving = new Map();
    const settle = () => { leaving.forEach((anims, p) => { anims.forEach((a) => a.cancel()); p.classList.remove('is-leaving'); p.inert = false; }); leaving.clear(); panels.forEach((p) => p.classList.remove('is-entering')); };
    const select = async (i, focus) => {
      if (focus) tabs[i].focus();
      if (i === current) return;
      const prev = current, dir = i > prev ? 1 : -1, me = ++turn;
      current = i;
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      ink();
      if (!interacted) { interacted = true; track('demo_engaged'); }
      const out = panels[prev], inn = panels[i], img = inn.querySelector('.pane-glass img');
      await ready(img);
      if (me !== turn) return;
      settle();
      panels.forEach((p, j) => p.toggleAttribute('data-inactive', j !== i));
      if (reduce.matches || !inn.animate) return;
      const load = ms('--t-load'), drive = ms('--t-drive');
      out.classList.add('is-leaving'); out.inert = true;
      const outAnims = [
        out.querySelector('.pane-glass img')?.animate([
          { opacity: 1, transform: 'none' },
          { opacity: 1, transform: `translateX(${-dir * 8}px)`, offset: 0.2 },
          { opacity: 0, transform: `translateX(${-dir * 24}px)` },
        ], { duration: load, easing: ease('--ease-load'), fill: 'forwards' }),
        out.querySelector('.demo-copy')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms('--t-snap'), easing: 'linear', fill: 'forwards' }),
      ].filter(Boolean);
      leaving.set(out, outAnims);
      Promise.all(outAnims.map((a) => a.finished)).then(() => {
        outAnims.forEach((a) => a.cancel()); out.classList.remove('is-leaving'); out.inert = false; leaving.delete(out);
      }, () => {});
      // The arriving screen sits on top with a see-through frame, so the leaving one shows beneath it until it lands.
      inn.classList.add('is-entering');
      const drop = () => inn.classList.remove('is-entering');
      const a = img?.animate([{ opacity: 0, transform: `translateX(${dir * 24}px)` }, { opacity: 1, transform: 'none' }], { duration: drive, easing: ease('--ease-expo') });
      if (a) a.finished.then(drop, drop); else drop();
      inn.querySelector('.demo-copy')?.animate([{ opacity: 0, transform: `translateX(${dir * 8}px)` }, { opacity: 1, transform: 'none' }], { duration: drive, delay: ms('--t-snap'), easing: ease('--ease-expo'), fill: 'backwards' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const n = tabs.length, k = e.key;
        const next = k === 'ArrowRight' ? (i + 1) % n : k === 'ArrowLeft' ? (i - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
        if (next >= 0) { e.preventDefault(); select(next, true); }
      });
    });
    // Swipe the screen like the app: a horizontal drag of 40px or more steps one tab; vertical drags scroll.
    let sx = null, sy = 0;
    demo.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && e.target.closest('.demo-pane')) { sx = e.clientX; sy = e.clientY; warmAll(); } }, { passive: true });
    demo.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) select(Math.min(tabs.length - 1, Math.max(0, current + (dx < 0 ? 1 : -1))));
    }, { passive: true });
    demo.addEventListener('pointercancel', () => { sx = null; }, { passive: true });
  });

  /* ---- Buttons: hold the press for at least --t-snap, so a quick phone tap still reads as a press. The
     /get buttons carry the "cta" view-transition name to the preview form's button on the next page. ---- */
  {
    const rack = parseFloat(getComputedStyle(root).getPropertyValue('--t-snap')) || 120;
    let held = null, t0 = 0;
    const release = () => {
      const el = held; held = null;
      if (el) setTimeout(() => el.removeAttribute('data-press'), Math.max(0, rack - (performance.now() - t0)));
    };
    d.addEventListener('pointerdown', (e) => {
      const b = e.target.closest?.('.btn');
      if (!b || e.button > 0) return;
      held = b; t0 = performance.now(); b.setAttribute('data-press', '');
    }, { passive: true });
    ['pointerup', 'pointercancel', 'dragstart'].forEach((t) => d.addEventListener(t, release, { passive: true }));
    d.addEventListener('click', (e) => {
      const b = e.target.closest?.('a.btn[href="/get"]');
      if (!b || reduce.matches) return;
      d.querySelectorAll('.btn').forEach((x) => { x.style.viewTransitionName = ''; });
      b.style.viewTransitionName = 'cta';
      try { sessionStorage.setItem('bg-cta', '1'); } catch { /* storage blocked */ }
    });
    w.addEventListener('pageshow', () => d.querySelectorAll('.btn').forEach((x) => { x.style.viewTransitionName = ''; x.removeAttribute('data-press'); }));
  }

  /* ---- Phone action bar: drives in once the hero has left view and loads out for good at the page's decision point
     (the fork, or the enquiry form), so it changes state twice per page. It also steps aside only while one of the
     reel's own controls is under it. If it hides while focused, focus moves to the page instead of being dropped. ---- */
  const bar = d.querySelector('[data-sticky]');
  if (bar && 'IntersectionObserver' in w) whenHydrated(() => {
    const hero = d.querySelector('main > section');
    const stop = d.querySelector('#start, #enquire');
    const controls = [...d.querySelectorAll('[data-reel-toggle], [data-reel-chapters]')];
    let heroGone = false, past = false, under = new Set();
    bar.hidden = false;
    const sync = () => {
      const show = heroGone && !past && under.size === 0;
      if (!show && bar.contains(d.activeElement)) { const m = d.querySelector('main'); m.tabIndex = -1; m.focus({ preventScroll: true }); }
      bar.toggleAttribute('data-show', show);
      root.toggleAttribute('data-sticky-on', show);
    };
    new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting; sync(); }).observe(hero);
    // The root reaches far above the viewport, so "intersecting" means the stop's top has come into view or passed it.
    if (stop) new IntersectionObserver(([e]) => { past = e.isIntersecting; sync(); }, { rootMargin: '100000px 0px 0px 0px' }).observe(stop);
    // Only the bottom ~12% of the viewport, where the bar sits.
    const zone = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? under.add(e.target) : under.delete(e.target))); sync(); }, { rootMargin: '-88% 0px 0px 0px' });
    controls.forEach((c) => zone.observe(c));
  });

  /* ---- In-page anchors scroll smoothly (when motion is allowed); keyboard focus moves stay instant. ---- */
  d.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    const target = d.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', url.hash);
    if (target.matches('form, [tabindex]')) target.focus({ preventScroll: true });
  });

  /* ---- Showreel: loaded once the page has finished loading, so it never competes with first paint. ---- */
  if (d.querySelector('[data-reel]') && !reduce.matches) {
    const load = () => { const s = d.createElement('script'); s.src = '/reel.js'; s.async = true; d.body.appendChild(s); };
    const idle = () => ('requestIdleCallback' in w ? w.requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 200));
    const start = () => whenHydrated(idle); // reel.js builds DOM inside React-rendered nodes
    if (d.readyState === 'complete') start(); else w.addEventListener('load', start, { once: true });
  }

  /* ---- /get: say which platform the visitor is on. ---- */
  const note = d.querySelector('[data-platform-note]');
  if (note) whenHydrated(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);
    // Both notes are rendered by the server (hidden); this only picks one, so nothing is written into the page.
    const pick = ios ? 'ios' : android ? 'android' : '';
    if (pick) { note.querySelector(`[data-note="${pick}"]`).hidden = false; note.setAttribute('data-platform', pick); }
  });

  /* ---- Forms: real submission, inline validation, honest success and failure. Without JavaScript the same forms
     post to /api/enquiries and land back on the page with a status flag. While sending, focus stays on the button
     (aria-disabled); on success the confirmation replaces the form and takes focus. ---- */
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  d.querySelectorAll('form[data-form]').forEach((form) => {
    const kind = form.dataset.form, who = form.dataset.founder || 'Josh', to = form.dataset.email;
    const msg = form.querySelector('[data-form-msg]');
    const button = form.querySelector('[type="submit"]');
    const label = button.querySelector('span');
    const idle = label.textContent;
    // Hints stay announced: an error is added to aria-describedby, never swapped in for the hint.
    const hints = new WeakMap(); // each field's own hint ids, read before the first error is added
    const describe = (input, err) => {
      if (!hints.has(input)) hints.set(input, (input.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && !x.endsWith('-err')).join(' '));
      const v = [hints.get(input), err].filter(Boolean).join(' ');
      if (v) input.setAttribute('aria-describedby', v); else input.removeAttribute('aria-describedby');
    };
    const fieldError = (input, text) => {
      const id = `${input.id}-err`;
      let el = d.getElementById(id);
      if (!text) { input.removeAttribute('aria-invalid'); describe(input, ''); el?.remove(); return; }
      if (!el) { el = d.createElement('span'); el.id = id; el.className = 'field-error'; (input.nextElementSibling?.classList.contains('hint') ? input.nextElementSibling : input).after(el); }
      el.textContent = text;
      input.setAttribute('aria-invalid', 'true');
      describe(input, id);
    };
    const validate = () => {
      let first = null;
      form.querySelectorAll('input, textarea, select').forEach((input) => {
        if (input.type === 'hidden' || input.closest('.trap')) return;
        const v = input.value.trim();
        let err = '';
        if (input.required && !v) err = input.name === 'email' ? 'Enter your email address.' : input.name === 'name' ? 'Enter your name.' : `Tell ${who} a little about your goal.`;
        else if (input.name === 'email' && v && !emailOk(v)) err = 'Check your email address. It should look like name@example.com.';
        else if (input.name === 'phone' && v) {
          const digits = v.replace(/\D/g, '');
          if (digits.length < 7 || digits.length > 15 || !/^\+?[0-9\s().-]+$/.test(v)) err = 'Enter a valid mobile number, or leave this blank.';
        }
        fieldError(input, err);
        if (err && !first) first = input;
      });
      if (first) first.focus();
      return !first;
    };
    form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid')) fieldError(e.target, ''); });
    const title = form.querySelector('.title');
    const show = (text, ok, extra) => {
      form.querySelectorAll('.msg:not([data-form-msg])').forEach((m) => m.remove());
      msg.hidden = false;
      msg.className = ok ? 'msg is-ok' : 'msg error';
      msg.innerHTML = '';
      const p = d.createElement('p'); p.textContent = text; msg.append(p);
      if (extra) msg.append(extra);
      if (ok) {
        form.classList.add('is-done');
        if (title) title.textContent = kind === 'preview' ? 'You’re on the list.' : 'Enquiry sent.';
        form.scrollIntoView({ block: 'nearest', behavior: reduce.matches ? 'auto' : 'smooth' });
      }
      msg.focus?.({ preventScroll: !ok });
    };
    let busy = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;
      msg.hidden = true;
      if (!validate()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      Object.keys(data).forEach((k) => { data[k] = String(data[k]).trim(); });
      if (kind === 'preview') data.route = 'app';
      data.src = source;
      busy = true;
      button.setAttribute('aria-disabled', 'true');
      label.textContent = kind === 'preview' ? 'Adding you…' : 'Sending…';
      let status = 0;
      try {
        const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        status = res.status;
        if (!res.ok) throw new Error(String(status));
        form.reset();
        if (kind === 'preview') {
          show(`You’re on the list. ${who} will email ${data.email} when there’s an Android build you can try.`, true);
        } else {
          show(`Enquiry received. ${who} will reply by ${data.phone ? 'text or email' : 'email'}. Thanks for reaching out.`, true);
        }
      } catch {
        const subject = kind === 'preview' ? 'Blackglass Android preview list' : 'Blackglass coaching enquiry';
        const body = kind === 'preview'
          ? `Please add me to the Blackglass Android preview list.\n\nName: ${data.name}\nEmail: ${data.email}${data.goal ? `\n\n${data.goal}` : ''}`
          : `Name: ${data.name}\nEmail: ${data.email}${data.phone ? `\nMobile: ${data.phone}` : ''}\nLooking for: ${data.route}\n\n${data.goal}`;
        const a = d.createElement('a');
        a.className = 'btn btn-ghost btn-sm msg-action';
        a.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        a.innerHTML = '<span>Send it by email instead</span><svg class="arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>';
        show(status === 409
          ? 'We received a message from this email in the last two minutes. If this is something new, send it by email instead.'
          : 'That didn’t go through, and nothing was saved. Your answers are still here. Try again, or send it by email instead.', false, a);
      } finally {
        busy = false;
        button.removeAttribute('aria-disabled');
        label.textContent = idle;
      }
    });
    whenHydrated(() => msg?.setAttribute('tabindex', '-1'));
  });

  /* ---- Colophon: the time in Dunedin, to the minute. ---- */
  const clock = d.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' });
    const set = () => { clock.textContent = fmt.format(new Date()); };
    whenHydrated(() => {
      set(); setInterval(set, 20000);
      d.querySelectorAll('[data-clock-row]').forEach((e) => { e.hidden = false; });
    });
  }

  /* ---- Scroll gauge (desktop): a tick scale on the right edge. Major ticks are this page's sections; the
     signal square sits on the one in view. Decorative: the page's own navigation carries the same information. ---- */
  const secs = [...d.querySelectorAll('main [data-sec]')];
  if (secs.length > 1 && 'IntersectionObserver' in w) whenHydrated(() => {
    const STEP = 10, MINOR = 3;
    const gauge = d.createElement('div');
    gauge.className = 'gauge';
    gauge.setAttribute('aria-hidden', 'true');
    const n = (secs.length - 1) * (MINOR + 1) + 1;
    // Ticks are difference-blended so they read on Glass and Paper; the square is a separate layer so it stays volt.
    gauge.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i % (MINOR + 1) === 0 ? 'M' : ''}" style="top:${i * STEP}px"></i>`).join('');
    const sq = d.createElement('span');
    sq.className = 'gauge-sq';
    sq.setAttribute('aria-hidden', 'true');
    gauge.style.height = `${(n - 1) * STEP + 1}px`;
    gauge.style.marginTop = sq.style.marginTop = `${-((n - 1) * STEP) / 2}px`;
    d.body.append(gauge, sq);
    // The reel has its own volt marker, so the gauge square rests while the reel holds the screen.
    const reelEl = d.querySelector('[data-reel]');
    if (reelEl) new IntersectionObserver(([e]) => root.toggleAttribute('data-reel-in', e.isIntersecting), { threshold: 0.35 }).observe(reelEl);
    const seen = new Map();
    const place = () => {
      let best = 0, bestV = -1;
      secs.forEach((s, i) => { const v = seen.get(s) || 0; if (v > bestV) { bestV = v; best = i; } });
      sq.style.transform = `translateY(${best * (MINOR + 1) * STEP}px)`;
      // One volt per viewport: the square rests while the hero or the closer (each with its own volt action) leads.
      sq.toggleAttribute('data-quiet', secs[best].matches('.hero, .closer'));
    };
    const io = new IntersectionObserver((es) => { es.forEach((e) => seen.set(e.target, e.intersectionRatio * e.boundingClientRect.height)); place(); }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    secs.forEach((s) => io.observe(s));
  });

})();
