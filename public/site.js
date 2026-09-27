(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const splash = document.getElementById('brand-splash');
  const splashSkip = document.getElementById('splash-skip');
  const introTime = document.getElementById('intro-time');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (splash && splashSkip && !reducedMotion.matches && !location.hash && !document.documentElement.dataset.skipIntro) {
    let dismissed = false;
    let ticker = 0;
    let autoDismiss = 0;
    const pageContent = document.querySelectorAll('.skip-link, .site-header, main, .site-footer');
    const startedAt = window.__blackglassIntroStart || performance.now();
    const dismissSplash = () => {
      if (dismissed) return;
      dismissed = true;
      window.clearTimeout(autoDismiss);
      cancelAnimationFrame(ticker);
      document.body.classList.remove('splash-open');
      document.body.classList.add('intro-revealing');
      pageContent.forEach(node => { node.inert = false; });
      splash.classList.add('is-leaving');
      if (document.activeElement === splashSkip) document.querySelector('.hero-actions .button')?.focus({ preventScroll: true });
      window.setTimeout(() => { splash.hidden = true; document.body.classList.remove('intro-revealing'); }, 820);
    };
    const updateClock = now => {
      if (dismissed) return;
      if (introTime) introTime.textContent = `T+${((now - startedAt) / 1000).toFixed(3)}`;
      ticker = requestAnimationFrame(updateClock);
    };
    document.body.classList.add('splash-open');
    pageContent.forEach(node => { node.inert = true; });
    splashSkip.addEventListener('click', dismissSplash);
    ticker = requestAnimationFrame(updateClock);
    splash.addEventListener('animationend', event => {
      if (event.target === splash && event.animationName === 'intro-autoplay-out') dismissSplash();
    });
    // The CSS timeline owns the reveal, even if the site script is late or unavailable.
    if (getComputedStyle(splash).visibility === 'hidden') dismissSplash();
    else autoDismiss = window.setTimeout(dismissSplash, 6000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) dismissSplash(); }, { once: true });
    reducedMotion.addEventListener('change', event => { if (event.matches) dismissSplash(); }, { once: true });
    window.addEventListener('hashchange', dismissSplash, { once: true });
  } else if (splash) {
    splash.hidden = true;
  }

  const field = document.getElementById('hero-lightfield');
  const fieldHost = field?.closest('.hero-art');
  if (field && fieldHost && !reducedMotion.matches) {
    const ctx = field.getContext('2d', { alpha: true });
    if (ctx) {
      let width = 0;
      let height = 0;
      let visible = false;
      let frame = 0;
      let lastPaint = 0;
      const pointer = { x: .5, y: .5, targetX: .5, targetY: .5 };
      const resize = () => {
        const rect = fieldHost.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        field.width = Math.round(width * scale);
        field.height = Math.round(height * scale);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
      };
      const paint = time => {
        if (!visible || document.hidden) { frame = 0; return; }
        frame = requestAnimationFrame(paint);
        if (time - lastPaint < 32 || !width || !height) return;
        lastPaint = time;
        pointer.x += (pointer.targetX - pointer.x) * .05;
        pointer.y += (pointer.targetY - pointer.y) * .05;
        ctx.clearRect(0, 0, width, height);
        const cx = width * (.5 + (pointer.x - .5) * .15 + Math.sin(time * .00019) * .025);
        const cy = height * (.49 + (pointer.y - .5) * .1 + Math.cos(time * .00016) * .02);
        const radius = Math.max(width, height) * .55;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        glow.addColorStop(0, 'rgba(213,255,63,.11)');
        glow.addColorStop(.22, 'rgba(183,208,187,.065)');
        glow.addColorStop(1, 'rgba(183,208,187,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(time * .00012) * .1);
        for (let i = 0; i < 5; i++) {
          const breathe = Math.sin(time * .00045 + i * .8) * 6;
          ctx.beginPath();
          ctx.ellipse(0, 0, width * (.24 + i * .11) + breathe, height * (.28 + i * .09) + breathe, -.24, -.8 + i * .09, 1.25 + i * .07);
          ctx.strokeStyle = i % 2 ? 'rgba(244,245,239,.075)' : 'rgba(213,255,63,.085)';
          ctx.lineWidth = i === 0 ? 1.5 : 1;
          ctx.stroke();
        }
        ctx.restore();
      };
      const observe = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(paint);
        if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
      }, { threshold: .05 });
      observe.observe(fieldHost);
      new ResizeObserver(resize).observe(fieldHost);
      resize();
      if (window.matchMedia('(pointer: fine)').matches) {
        fieldHost.addEventListener('pointermove', event => {
          const rect = fieldHost.getBoundingClientRect();
          pointer.targetX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          pointer.targetY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
          fieldHost.style.setProperty('--tilt-x', `${(.5 - pointer.targetY) * 5}deg`);
          fieldHost.style.setProperty('--tilt-y', `${(pointer.targetX - .5) * 7}deg`);
          fieldHost.style.setProperty('--shift-x', `${(pointer.targetX - .5) * 12}px`);
          fieldHost.style.setProperty('--shift-y', `${(pointer.targetY - .5) * 10}px`);
        }, { passive: true });
        fieldHost.addEventListener('pointerleave', () => {
          pointer.targetX = pointer.targetY = .5;
          ['--tilt-x', '--tilt-y', '--shift-x', '--shift-y'].forEach(name => fieldHost.style.removeProperty(name));
        });
      }
    }
  }

  const progress = document.getElementById('scroll-progress-fill');
  let ticking = false;
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 0}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  const screens = {
    program: {
      index: '001 / THE PROGRAMME',
      title: 'A plan worth<br>opening tomorrow.',
      detail: 'See the day, log the set, and move forward. The training view keeps the work in front of you.'
    },
    movement: {
      index: '002 / THE MOVEMENT',
      title: 'See the movement.<br>Own the rep.',
      detail: 'Go beyond an exercise name. Movement phases make the next rep more deliberate.'
    }
  };
  const visual = document.querySelector('.showcase-visual');
  const syncScreenA11y = key => {
    visual?.querySelectorAll('.device').forEach(figure => {
      figure.setAttribute('aria-hidden', String(!figure.classList.contains(`device-${key}`)));
    });
  };
  syncScreenA11y('program');
  const screenButtons = [...document.querySelectorAll('[data-screen]')];
  screenButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.screen;
    const screen = screens[key];
    if (!screen || !visual) return;
    visual.dataset.active = key;
    syncScreenA11y(key);
    document.getElementById('screen-index').textContent = screen.index;
    document.getElementById('screen-title').innerHTML = screen.title;
    document.getElementById('screen-detail').textContent = screen.detail;
    screenButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }));

  const form = document.getElementById('enquiry-form');
  const route = document.getElementById('route');
  const phoneInput = document.getElementById('phone');
  phoneInput?.addEventListener('input', () => phoneInput.setCustomValidity(''));
  const routeHeading = document.querySelector('.application-card-top span:first-child');
  const routeNames = {
    coaching: '1:1 coaching',
    programme: 'A personal training programme',
    app: 'The training app'
  };
  const routeHeadings = {
    coaching: 'COACHING ENQUIRY',
    programme: 'PROGRAMME ENQUIRY',
    app: 'APP ENQUIRY'
  };
  const selectRoute = key => {
    if (!routeNames[key] || !route) return;
    route.value = key;
    if (routeHeading) routeHeading.textContent = routeHeadings[key];
  };
  const queryRoute = new URLSearchParams(window.location.search).get('offer');
  if (queryRoute) selectRoute(queryRoute);
  document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', () => selectRoute(link.dataset.route)));
  route?.addEventListener('change', () => selectRoute(route.value));

  let enquiryText = '';
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const phoneDigits = phone.replace(/\D/g, '');
    if (phone && (phoneDigits.length < 7 || phoneDigits.length > 15 || !/^\+?[0-9\s().-]+$/.test(phone))) {
      phoneInput.setCustomValidity('Enter a valid mobile number or leave this blank.');
      phoneInput.reportValidity();
      return;
    }
    const goal = document.getElementById('goal').value.trim();
    if (!name || !email || !goal) return;

    const chosenRoute = routeNames[route.value] || routeNames.coaching;
    const subject = `Blackglass enquiry — ${chosenRoute}`;
    const body = `Hi Josh,\n\nI'd like to ask about ${chosenRoute.toLowerCase()}.\n\nName: ${name}\nEmail: ${email}${phone ? `\nMobile for a text reply: ${phone}` : ''}\n\nMy goal and situation:\n${goal}\n\nThanks,\n${name}`;
    enquiryText = `To: Joshuanicolai@live.com\nSubject: ${subject}\n\n${body}`;
    const feedback = document.getElementById('form-fallback');
    const message = document.getElementById('form-message');
    const copy = document.getElementById('copy-enquiry');
    const submit = form.querySelector('[type="submit"]');
    feedback.hidden = true;
    submit.disabled = true;
    submit.firstChild.textContent = 'Sending your enquiry ';
    let duplicate = false;
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, route: route.value, goal, website: form.elements.website.value })
      });
      duplicate = response.status === 409;
      if (!response.ok) throw new Error('Unable to save enquiry');
      form.reset();
      selectRoute('coaching');
      feedback.classList.add('is-success');
      message.textContent = `Enquiry received. Josh can see it and reply by ${phone ? 'text or email' : 'email'}. Thank you for reaching out.`;
      copy.hidden = true;
      feedback.hidden = false;
    } catch {
      feedback.classList.remove('is-success');
      message.textContent = duplicate
        ? 'An enquiry from this email was received in the last two minutes. If this is a different request, email Josh directly or copy it below.'
        : 'The form could not save your enquiry. Your answers are still here. Please email Josh directly or copy your enquiry below.';
      copy.hidden = false;
      feedback.hidden = false;
    } finally {
      submit.disabled = false;
      submit.firstChild.textContent = 'Send my enquiry ';
    }
  });

  document.getElementById('copy-enquiry')?.addEventListener('click', async event => {
    if (!enquiryText) return;
    const button = event.currentTarget;
    let copied = false;
    try { await navigator.clipboard.writeText(enquiryText); copied = true; } catch {
      const fallback = document.createElement('textarea');
      fallback.value = enquiryText;
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      fallback.remove();
    }
    button.textContent = copied ? 'Copied — email Josh to send it' : 'Copy failed — email Josh directly';
  });
})();
