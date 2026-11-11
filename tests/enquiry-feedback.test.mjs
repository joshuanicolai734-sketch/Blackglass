import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

// Run the complete production script with a small synthetic DOM and controlled
// fetch/deadline implementations. No network, production form or database is used.
const sourcePath = process.env.SITE_JS_PATH || new URL('../public/site.js', import.meta.url);
const source = readFileSync(sourcePath, 'utf8');
const uncertain = 'We couldn’t confirm whether this was received. Your answers are still here. You can try again, or send it by email instead.';
const limited = 'Too many requests right now. Your answers are still here. Please try again later, or send it by email instead.';
const duplicate = 'We received a message from this email in the last two minutes. If this is something new, send it by email instead.';

function element(tag = 'div') {
  const attrs = new Map();
  const classes = new Set();
  const listeners = new Map();
  return {
    tag, children: [], dataset: {}, style: {}, textContent: '', hidden: false,
    classList: {
      add: (...values) => values.forEach((value) => classes.add(value)),
      contains: (value) => classes.has(value),
    },
    addEventListener: (name, fn) => listeners.set(name, fn),
    dispatch: (name, event) => listeners.get(name)?.(event),
    getAttribute: (name) => attrs.get(name) ?? null,
    setAttribute: (name, value) => attrs.set(name, String(value)),
    removeAttribute: (name) => attrs.delete(name),
    append(...children) { this.children.push(...children); },
    set innerHTML(value) { assert.equal(value === '' || tag === 'a', true); this.children = []; },
    focus(options) { this.focusCount = (this.focusCount || 0) + 1; this.focusOptions = options; },
    scrollIntoView(options) { this.scrollOptions = options; },
    closest: () => null,
  };
}

function fixture(fetchImpl, kind = 'enquiry') {
  const root = element();
  const main = { __reactFiber: {}, dataset: {} };
  const form = element('form');
  form.dataset = { form: kind, founder: 'Josh', email: 'fixture@example.invalid' };
  const message = element();
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.hidden = true;
  const title = element('h2');
  const button = element('button');
  const label = element('span');
  const idle = kind === 'preview' ? 'Join the preview list' : 'Send my enquiry';
  label.textContent = idle;
  button.querySelector = () => label;
  const original = { name: ' Synthetic Person ', email: 'synthetic@example.invalid', phone: '+64 21 555 0100', route: 'programme', goal: 'Build a consistent routine', website: '' };
  const inputs = Object.entries(original).map(([name, value]) => Object.assign(element('input'), {
    name, value, id: `test-${name}`, type: name === 'route' ? 'hidden' : 'text', required: ['name', 'email', 'goal'].includes(name),
    closest: (selector) => name === 'website' && selector === '.trap' ? {} : null,
  }));
  form.querySelector = (selector) => ({ '[data-form-msg]': message, '[type="submit"]': button, '.title': title })[selector] || null;
  form.querySelectorAll = (selector) => selector === 'input, textarea, select' ? inputs : [];
  form.reset = () => { form.resetCount = (form.resetCount || 0) + 1; inputs.forEach((input) => { input.value = ''; }); };
  const requests = [];
  const timers = new Map();
  const recordedDelays = [];
  let timerId = 0;
  const storage = { getItem: () => null, setItem() {} };
  const document = {
    documentElement: root, body: element('body'),
    querySelector: (selector) => selector === 'main' ? main : null,
    querySelectorAll: (selector) => selector === 'form[data-form]' ? [form] : [],
    addEventListener() {}, getElementById: () => null, createElement: element,
  };
  const window = { matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {} };
  vm.runInNewContext(source, {
    document, window, performance: { now: () => 0 },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    requestAnimationFrame: (fn) => fn(),
    setTimeout: (fn, delay) => { recordedDelays.push(delay); timers.set(++timerId, { fn, delay }); return timerId; },
    clearTimeout: (id) => timers.delete(id),
    localStorage: storage, sessionStorage: storage,
    location: { search: '', pathname: '/synthetic-fixture' },
    navigator: {}, URLSearchParams, URL, Blob, AbortController,
    fetch: (url, options) => { requests.push({ url, options }); return fetchImpl(url, options); },
    FormData: class { constructor(target) { assert.equal(target, form); } entries() { return inputs.map(({ name, value }) => [name, value]); } },
  }, { filename: String(sourcePath) });
  return {
    form, message, title, button, label, idle, inputs, original, requests, timers, recordedDelays,
    submit() { return form.dispatch('submit', { preventDefault() {} }); },
    text() { return message.children[0]?.textContent; },
    values() { return Object.fromEntries(inputs.map(({ name, value }) => [name, value])); },
    expire() {
      const deadline = [...timers.values()].find(({ delay }) => delay === 15000);
      assert.ok(deadline, 'the original 15-second deadline is installed');
      deadline.fn();
    },
  };
}

function response(status, body = { ok: true }, type = 'application/json') {
  return { status, ok: status >= 200 && status < 300, headers: { get: () => type }, json: async () => body };
}

function assertFailure(f, expected = uncertain, expectedValues = f.original) {
  assert.equal(f.text(), expected);
  assert.deepEqual(f.values(), expectedValues, 'entries survive failure exactly as typed');
  assert.equal(f.form.resetCount || 0, 0);
  assert.equal(f.form.classList.contains('is-done'), false);
  assert.equal(f.message.hidden, false);
  assert.equal(f.message.className, 'msg error');
  assert.equal(f.message.getAttribute('role'), 'status');
  assert.equal(f.message.getAttribute('aria-live'), 'polite');
  assert.equal(f.message.getAttribute('tabindex'), '-1');
  assert.equal(f.message.focusCount, 1);
  assert.equal(f.message.focusOptions.preventScroll, true);
  assert.equal(f.button.getAttribute('aria-disabled'), null);
  assert.equal(f.label.textContent, f.idle);
  assert.equal(f.timers.size, 0, 'deadline is cleared without scheduling a retry');
  assert.deepEqual(f.recordedDelays, [15000]);
  assert.equal(f.requests.length, 1, 'exactly one enquiry request and no browser conversion event');
  assert.equal(f.requests[0].url, '/api/enquiries');
  const mail = new URL(f.message.children[1].href);
  assert.equal(mail.protocol, 'mailto:');
  assert.equal(mail.pathname, 'fixture@example.invalid');
  assert.match(mail.searchParams.get('body'), /synthetic@example\.invalid/);
}

for (const kind of ['enquiry', 'preview']) {
  for (const contentType of ['application/json', 'text/html', null]) {
    test(`${kind}: 429 ${contentType || 'without content type'} gives friendly retained-entry feedback`, async () => {
      let bodyReads = 0;
      const f = fixture(async () => ({ ...response(429, null, contentType), json: () => { bodyReads++; throw new Error('must not read error content'); } }), kind);
      await f.submit();
      assertFailure(f, limited);
      assert.equal(bodyReads, 0);
      assert.doesNotMatch(f.text(), /\b\d+\b|nothing was saved|received your|sent successfully/i);
      const body = JSON.parse(f.requests[0].options.body);
      assert.equal(body.route, kind === 'preview' ? 'app' : 'programme');
    });
  }

  test(`${kind}: successful JSON receipt resets only after confirmation`, async () => {
    let receive;
    const f = fixture(() => new Promise((resolve) => { receive = resolve; }), kind);
    const pending = f.submit();
    assert.deepEqual(f.values(), f.original);
    assert.equal(f.form.resetCount || 0, 0);
    assert.equal(f.button.getAttribute('aria-disabled'), 'true');
    assert.equal(f.label.textContent, kind === 'preview' ? 'Adding you…' : 'Sending…');
    receive(response(201));
    await pending;
    assert.equal(f.form.resetCount, 1);
    assert.equal(f.form.classList.contains('is-done'), true);
    assert.equal(f.message.className, 'msg is-ok');
    assert.equal(f.message.focusCount, 1);
    assert.equal(f.message.focusOptions.preventScroll, false);
    assert.equal(f.button.getAttribute('aria-disabled'), null);
    assert.equal(f.label.textContent, f.idle);
    assert.equal(f.requests.length, 1);
    assert.equal(f.timers.size, 0);
  });
}

for (const [name, reply] of [
  ['HTML 200', () => response(200, null, 'text/html')],
  ['missing receipt', () => response(200, {})],
  ['false receipt', () => response(200, { ok: false })],
  ['truthy string receipt', () => response(200, { ok: 'true' })],
  ['null receipt', () => response(200, null)],
  ['malformed JSON', () => ({ ...response(200), json: async () => { throw new SyntaxError('invalid JSON'); } })],
  ['storage 503', () => response(503)],
  ['network rejection', () => { throw new TypeError('offline'); }],
  ['network abort', () => { throw new DOMException('aborted', 'AbortError'); }],
]) {
  test(`${name}: no false success and controls recover`, async () => {
    const f = fixture(async () => reply());
    await f.submit();
    assertFailure(f);
  });
}

test('409 keeps its distinct duplicate message', async () => {
  const f = fixture(async () => response(409));
  await f.submit();
  assertFailure(f, duplicate);
});

for (const stalled of ['headers', 'body']) {
  test(`stalled ${stalled}: the deadline bounds completion even when the transport ignores abort`, async () => {
    let finish;
    let readingBody;
    const bodyStarted = new Promise((resolve) => { readingBody = resolve; });
    const never = new Promise((resolve) => { finish = resolve; });
    const f = fixture(() => stalled === 'headers' ? never : Promise.resolve({ ...response(200), json: () => { readingBody(); return never; } }));
    const pending = f.submit();
    if (stalled === 'body') await bodyStarted;
    f.expire();
    await pending;
    assertFailure(f);
    assert.equal(f.requests[0].options.signal.aborted, true);
    finish(stalled === 'headers' ? response(201) : { ok: true });
    await Promise.resolve();
    await Promise.resolve();
    assertFailure(f);
  });
}

test('repeated submits are ignored in flight; manual retry works after failure', async () => {
  let receive;
  const f = fixture(() => new Promise((resolve) => { receive = resolve; }));
  const pending = f.submit();
  await f.submit();
  await f.submit();
  assert.equal(f.requests.length, 1);
  receive(response(429));
  await pending;
  assertFailure(f, limited);
  const retry = f.submit();
  assert.equal(f.requests.length, 2);
  assert.equal(f.message.hidden, true);
  receive(response(201));
  await retry;
  assert.equal(f.form.resetCount, 1);
  assert.equal(f.message.className, 'msg is-ok');
  assert.equal(f.button.getAttribute('aria-disabled'), null);
  assert.equal(f.label.textContent, f.idle);
  assert.equal(f.timers.size, 0);
});

test('an edit made while awaiting a response survives failure', async () => {
  let receive;
  const f = fixture(() => new Promise((resolve) => { receive = resolve; }));
  const pending = f.submit();
  f.inputs.find(({ name }) => name === 'goal').value = 'Updated synthetic goal';
  receive(response(429));
  await pending;
  assertFailure(f, limited, { ...f.original, goal: 'Updated synthetic goal' });
});
