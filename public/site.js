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
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    d.querySelectorAll('[data-reveal]').forEach((el, i) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('pre');
        el.style.transitionDelay = `${(i % 3) * 60}ms`;
        io.observe(el);
      }
    });
  }

  /* ---- Heading wipes and the closing mark: the same 45° facet cut as the panes, drawn in once. ---- */
  if (!reduce.matches && 'IntersectionObserver' in w) {
    const once = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); once.unobserve(en.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    d.querySelectorAll('[data-wipe]').forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre-wipe'); once.observe(el); }
    });
    const closer = d.querySelector('[data-closer]');
    if (closer && closer.getBoundingClientRect().top > innerHeight) { closer.classList.add('armed'); once.observe(closer); }
  }

  /* ---- Living glass: panes lean toward a fine pointer and catch its light. ---- */
  if (!reduce.matches && w.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.pane').forEach((pane) => {
      let frame = 0;
      pane.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = pane.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          pane.style.setProperty('--ry', `${((x - .5) * 8).toFixed(2)}deg`);
          pane.style.setProperty('--rx', `${((.5 - y) * 8).toFixed(2)}deg`);
          pane.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
          pane.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
          pane.classList.add('is-live');
        });
      }, { passive: true });
      pane.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        ['--rx', '--ry', '--mx', '--my'].forEach((k) => pane.style.removeProperty(k));
        pane.classList.remove('is-live');
      });
    });
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

  /* ---- Ambient light: light passing through black glass. WebGL at reduced resolution, ~30 fps,
     paused offscreen, in background tabs and on request; skipped entirely for reduced motion. ---- */
  const hosts = [...d.querySelectorAll('[data-ambient]')];
  const toggle = d.querySelector('[data-motion-toggle]');
  if (hosts.length && !reduce.matches) {
    const host = hosts[0];
    const canvas = d.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (gl) {
      const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1)),f.x),f.y);}
void main(){vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
float w=n(p*1.4+vec2(t*.021,-t*.015))*.5+n(p*2.9-vec2(t*.013))*.25;
float dg=(p.x+p.y)*.7071+w*.22;
vec2 k=vec2(.42+m.x*.12,.12+m.y*.08);float key=exp(-dot(p-k,p-k)*2.4);
float b1=smoothstep(.5,0.,abs(fract(dg*.62-t*.016)-.5)*2.);
float b2=smoothstep(.5,0.,abs(fract(dg*1.35+.3-t*.011)-.5)*2.);
float l=key*.42+key*(b1*b1*.55+b2*b2*.22)+b1*.035;
vec3 c=vec3(.0627,.0667,.0745)+l*vec3(.15,.158,.17)+key*b1*b1*b1*vec3(.018,.024,0.);
c+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)/255.;
gl_FragColor=vec4(c,1.);}`;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uM = gl.getUniformLocation(prog, 'm');
        host.append(canvas);
        const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        let visible = true, raf = 0, last = 0, t0 = performance.now(), shown = false;
        let paused = store.get('bg-motion') === 'paused';
        const size = () => {
          const s = Math.min(.5 * (w.devicePixelRatio || 1), 1);
          canvas.width = Math.max(2, Math.round(host.clientWidth * s));
          canvas.height = Math.max(2, Math.round(host.clientHeight * s));
          gl.viewport(0, 0, canvas.width, canvas.height);
        };
        const frame = (now) => {
          raf = 0;
          if (paused || !visible || d.hidden) return;
          raf = requestAnimationFrame(frame);
          if (now - last < 33) return;
          last = now;
          mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
          gl.uniform2f(uR, canvas.width, canvas.height);
          gl.uniform1f(uT, (now - t0) / 1000);
          gl.uniform2f(uM, mouse.x, mouse.y);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          if (!shown) { shown = true; canvas.classList.add('on'); }
        };
        const run = () => { if (!raf && !paused && visible && !d.hidden) raf = requestAnimationFrame(frame); };
        const setPaused = (p) => {
          paused = p;
          root.dataset.motion = p ? 'paused' : '';
          store.set('bg-motion', p ? 'paused' : 'on');
          if (toggle) { toggle.setAttribute('aria-pressed', String(p)); toggle.textContent = p ? 'Play background motion' : 'Pause background motion'; }
          if (p) { cancelAnimationFrame(raf); raf = 0; } else run();
        };
        size();
        new ResizeObserver(size).observe(host);
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; run(); }).observe(host);
        d.addEventListener('visibilitychange', run);
        reduce.addEventListener('change', (e) => { if (e.matches) setPaused(true); });
        if (w.matchMedia('(pointer: fine)').matches) {
          host.parentElement.addEventListener('pointermove', (e) => {
            const r = host.getBoundingClientRect();
            mouse.tx = (e.clientX - r.left) / r.width - .5; mouse.ty = .5 - (e.clientY - r.top) / r.height;
          }, { passive: true });
        }
        if (toggle) { toggle.hidden = false; toggle.addEventListener('click', () => setPaused(!paused)); }
        setPaused(paused);
      }
    }
  }
})();
