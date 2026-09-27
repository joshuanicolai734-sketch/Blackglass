(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

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
