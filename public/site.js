/* Blackglass site enhancements. Loaded after hydration (app/site-effects.tsx). Everything here is optional:
   the pages are complete without it. Timings and easing come from the CSS motion tokens. */
(() => {
  const d = document, w = window, root = d.documentElement;
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

  d.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---- Mobile menu (a native <details>; this only adds polish). ---- */
  const menu = d.querySelector('.menu');
  if (menu) {
    const sync = () => { root.style.overflow = menu.open ? 'hidden' : ''; };
    menu.addEventListener('toggle', sync);
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.open = false; sync(); } });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; sync(); menu.querySelector('summary').focus(); } });
    w.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) { menu.open = false; sync(); } });
  }

  /* ---- Product demonstration: accessible tabs with arrow-key support. ---- */
  const demo = d.querySelector('[data-demo]');
  if (demo) {
    const tabs = [...demo.querySelectorAll('[data-demo-tab]')];
    const panels = [...demo.querySelectorAll('[data-demo-panel]')];
    let interacted = false;
    const select = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => {
        p.toggleAttribute('data-inactive', i !== j);
        p.classList.remove('enter');
        if (i === j && !reduce.matches) { void p.offsetWidth; p.classList.add('enter'); }
      });
      if (focus) tabs[i].focus();
      if (!interacted) { interacted = true; track('demo_engaged'); }
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const n = tabs.length, k = e.key;
        const next = k === 'ArrowRight' ? (i + 1) % n : k === 'ArrowLeft' ? (i - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
        if (next >= 0) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ---- Scroll reveals, only for content still below the fold, so nothing on screen blinks out. ---- */
  if (!reduce.matches && 'IntersectionObserver' in w) {
    const pending = new Set();
    // Numbers tick: a count from 00 up to the element's value (the monumental price, section indices).
    const countUp = (el, to) => {
      const n = parseInt(to, 10), width = String(to).length, t0 = performance.now();
      if (!Number.isFinite(n)) return;
      const step = (t) => { const k = Math.min(1, (t - t0) / 600); el.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 4)))).padStart(width, '0'); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const show = (el) => {
      el.classList.add('in'); pending.delete(el); io.unobserve(el);
      if (el.dataset.count) countUp(el, el.dataset.count);
      el.querySelectorAll('[data-tick]').forEach((t) => countUp(t, t.dataset.tick));
    };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) show(en.target); }), { rootMargin: '0px 0px -8% 0px' });
    // Paper sections wipe open once they are well into view, so the wipe happens where it can be seen.
    const ioPaper = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); pending.delete(en.target); ioPaper.unobserve(en.target); } }), { rootMargin: '0px 0px -35% 0px' });
    // Sections are targets too: their seam hairline draws across as you reach them.
    d.querySelectorAll('[data-reveal], [data-enter], main > .section').forEach((el, i) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('pre');
        if (el.hasAttribute('data-reveal')) el.style.transitionDelay = `${(i % 3) * 60}ms`;
        pending.add(el);
        if (el.matches('section.paper, .offer-coach')) ioPaper.observe(el); else io.observe(el);
      }
    });
    // A jump (an anchor link, a fast fling) can carry content past the viewport without it ever intersecting:
    // reveal anything that is already above the bottom edge.
    let tick = 0;
    w.addEventListener('scroll', () => {
      if (tick || !pending.size) return;
      tick = requestAnimationFrame(() => { tick = 0; pending.forEach((el) => {
        const paper = el.matches('section.paper, .offer-coach');
        if (el.getBoundingClientRect().top < innerHeight * (paper ? 0.65 : 1)) { if (paper) { el.classList.add('in'); pending.delete(el); ioPaper.unobserve(el); } else show(el); }
      }); });
    }, { passive: true });
  }

  /* ---- Showreel: loaded once the page has finished loading, so it never competes with first paint. ---- */
  if (d.querySelector('[data-reel]') && !reduce.matches) {
    const load = () => { const s = d.createElement('script'); s.src = '/reel.js'; s.async = true; d.body.appendChild(s); };
    const idle = () => ('requestIdleCallback' in w ? w.requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 200));
    if (d.readyState === 'complete') idle(); else w.addEventListener('load', idle, { once: true });
  }

  /* ---- /get: say which platform the visitor is on. ---- */
  const note = d.querySelector('[data-platform-note]');
  if (note) {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);
    if (ios) {
      note.innerHTML = 'You’re on an iPhone. There’s no iPhone app' + (d.querySelector('#iphone a') ? ', but <a href="/coaching">coaching</a> works with any phone.' : '.');
      note.hidden = false;
    } else if (android) {
      note.textContent = 'You’re on Android, so you’re in the right place.';
      note.hidden = false;
    }
  }

  /* ---- Forms: real submission, inline validation, honest success and failure. ---- */
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  d.querySelectorAll('form[data-form]').forEach((form) => {
    const kind = form.dataset.form, who = form.dataset.founder || 'Josh', to = form.dataset.email;
    const msg = form.querySelector('[data-form-msg]');
    const button = form.querySelector('[type="submit"]');
    const label = button.querySelector('span');
    const idle = label.textContent;
    const fieldError = (input, text) => {
      const id = `${input.id}-err`;
      let el = d.getElementById(id);
      if (!text) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); el?.remove(); return; }
      if (!el) { el = d.createElement('span'); el.id = id; el.className = 'field-error'; input.after(el); }
      el.textContent = text;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
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
    const show = (text, ok, extra) => {
      msg.hidden = false;
      msg.className = ok ? 'msg' : 'msg error';
      msg.innerHTML = '';
      const p = d.createElement('p'); p.textContent = text; msg.append(p);
      if (extra) msg.append(extra);
      msg.focus?.();
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.hidden = true;
      if (!validate()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      Object.keys(data).forEach((k) => { data[k] = String(data[k]).trim(); });
      if (kind === 'preview') data.route = 'app';
      data.src = source;
      button.disabled = true;
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
        a.className = 'btn btn-quiet';
        a.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        a.innerHTML = '<span>Send it by email instead</span>';
        show(status === 409
          ? 'We received a message from this email in the last two minutes. If this is something new, send it by email instead.'
          : 'That didn’t go through, and nothing was saved. Your answers are still here. Try again, or send it by email instead.', false, a);
      } finally {
        button.disabled = false;
        label.textContent = idle;
      }
    });
    msg?.setAttribute('tabindex', '-1');
  });

  /* ---- Specular sweep runs once on arrival; after that only hover replays it. ---- */
  d.addEventListener('animationend', (e) => { if (e.animationName === 'sweep') e.target.closest('.pane')?.classList.add('swept'); });

  /* ---- Colophon: the time in Dunedin, to the minute. ---- */
  const clock = d.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' });
    const set = () => { clock.textContent = fmt.format(new Date()); };
    set(); setInterval(set, 20000);
    d.querySelectorAll('[data-clock-row]').forEach((e) => { e.hidden = false; });
  }

  /* ---- Snapping reticle (desktop, fine pointer): one set of registration brackets that glides between the
     targets you hover and locks onto their bounds. Keyboard focus keeps the per-card brackets. ---- */
  if (!reduce.matches && w.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const ret = d.createElement('div');
    ret.className = 'reticle';
    ret.setAttribute('aria-hidden', 'true');
    ret.innerHTML = '<i></i><i></i><i></i><i></i>';
    d.body.appendChild(ret);
    root.classList.add('has-reticle');
    const corners = [...ret.children];
    const SEL = '.btn, .link, .spec, .demo-tabs button, .faq summary, .reel-toggle, .hdr-brand, .ftr-col a, .ftr-base a, .field input, .field select, .field textarea';
    let cur = null;
    const place = () => {
      if (!cur) return;
      const r = cur.getBoundingClientRect(), p = cur.matches('.spec') ? 10 : 6;
      const x0 = r.left - p, y0 = r.top - p, x1 = r.right + p - 12, y1 = r.bottom + p - 12;
      [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y], i) => { corners[i].style.transform = `translate(${x}px, ${y}px)`; });
    };
    d.addEventListener('pointerover', (e) => {
      const t = e.target.closest?.(SEL) || null;
      if (t === cur) return;
      const wasOff = !cur;
      cur = t;
      if (!t) { ret.classList.remove('on'); return; }
      if (wasOff) { ret.classList.add('jump'); place(); void ret.offsetWidth; ret.classList.remove('jump'); } else place();
      ret.classList.add('on');
    });
    d.addEventListener('pointerleave', () => { cur = null; ret.classList.remove('on'); });
    let raf = 0;
    w.addEventListener('scroll', () => { if (cur && !raf) raf = requestAnimationFrame(() => { raf = 0; place(); }); }, { passive: true });
  }

  /* ---- Scroll gauge (desktop): a tick scale on the right edge. Major ticks are this page's sections; the
     signal square sits on the one in view. Decorative: the page's own navigation carries the same information. ---- */
  const secs = [...d.querySelectorAll('main [data-sec]')];
  if (secs.length > 1 && 'IntersectionObserver' in w) {
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
    const num = d.createElement('span');
    num.className = 'gauge-n';
    num.setAttribute('aria-hidden', 'true');
    num.style.marginTop = sq.style.marginTop;
    d.body.append(gauge, sq, num);
    const idx = secs.map((s) => s.querySelector('.sh-i')?.dataset.tick || '');
    const seen = new Map();
    const place = () => {
      let best = 0, bestV = -1;
      secs.forEach((s, i) => { const v = seen.get(s) || 0; if (v > bestV) { bestV = v; best = i; } });
      sq.style.transform = `translateY(${best * (MINOR + 1) * STEP}px)`;
      num.style.transform = sq.style.transform;
      // The index ticks between values rather than jumping.
      const to = parseInt(idx[best], 10), from = parseInt(num.textContent, 10);
      if (!Number.isFinite(to) || !Number.isFinite(from) || from === to || reduce.matches) num.textContent = idx[best];
      else { const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 260); num.textContent = String(Math.round(from + (to - from) * k)).padStart(2, '0'); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
    };
    const io = new IntersectionObserver((es) => { es.forEach((e) => seen.set(e.target, e.intersectionRatio * e.boundingClientRect.height)); place(); }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    secs.forEach((s) => io.observe(s));
  }
})();
