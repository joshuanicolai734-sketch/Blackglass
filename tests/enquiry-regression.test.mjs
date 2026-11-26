import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

// Dependency-free, synthetic DOM/fetch regression coverage. Executes the exact
// Forms section of site.js, not a reimplementation and not a real browser.
const sourcePath = process.env.ENQUIRY_SOURCE;
assert.ok(sourcePath, 'ENQUIRY_SOURCE must point to the exact source under test');
const source = readFileSync(sourcePath, 'utf8');
const sha256 = createHash('sha256').update(source).digest('hex');
if (process.env.EXPECTED_SHA256) assert.equal(sha256, process.env.EXPECTED_SHA256);
const start = source.indexOf('  /* ---- Forms:');
const end = source.indexOf('  /* ---- Colophon:', start);
assert.ok(start >= 0 && end > start, 'Must identify one complete Forms section');
const formSource = source.slice(start, end);
const GENERIC = 'We couldn’t confirm whether this was received. Your answers are still here. You can try again, or send it by email instead.';
const DUPLICATE = 'We received a message from this email in the last two minutes. If this is something new, send it by email instead.';
const RATE_LIMIT = 'Too many requests right now. Your answers are still here. Please try again later, or send it by email instead.';

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.attrs = new Map();
    this.children = [];
    this.className = '';
    this.textContent = '';
    this.hidden = false;
    this.focusCount = 0;
    this.classList = {
      contains: (name) => this.className.split(/\s+/).includes(name),
      add: (name) => { if (!this.classList.contains(name)) this.className += ` ${name}`; },
    };
  }
  setAttribute(key, value) { this.attrs.set(key, String(value)); }
  getAttribute(key) { return this.attrs.get(key) ?? null; }
  removeAttribute(key) { this.attrs.delete(key); }
  set innerHTML(value) { this._innerHTML = value; this.children = []; }
  get innerHTML() { return this._innerHTML ?? ''; }
  append(...nodes) { this.children.push(...nodes); }
  focus(options) { this.focusCount++; this.focusOptions = options; }
  scrollIntoView(options) { this.scrollOptions = options; }
  closest() { return this.trap ? {} : null; }
  remove() { this.removed = true; }
  after(node) { this.afterNode = node; }
}

function fixture(kind, fetchImpl) {
  const timers = new Map();
  const calls = [];
  let timerId = 0;
  const form = new Element('form');
  form.dataset = { form: kind, founder: 'Josh', email: 'owner@example.test' };
  form.events = new Map();
  form.addEventListener = (name, handler) => form.events.set(name, handler);
  const original = {
    name: '  Synthetic & <Tester>  ', email: '  test.person@example.test  ',
    ...(kind === 'enquiry' ? { phone: '  +64 21 555 0123  ' } : {}),
    goal: '  Synthetic test: strength & balance?\nNo customer data.  ',
    route: kind === 'preview' ? 'app' : 'programme', website: '',
  };
  const fields = Object.entries(original).map(([name, value]) => {
    const input = new Element(name === 'goal' ? 'textarea' : name === 'route' && kind === 'enquiry' ? 'select' : 'input');
    Object.assign(input, { name, id: `${kind}-${name}`, value,
      type: name === 'route' && kind === 'preview' ? 'hidden' : name === 'email' ? 'email' : 'text',
      required: ['name', 'email'].includes(name) || (name === 'goal' && kind === 'enquiry'),
      trap: name === 'website',
    });
    if (['phone', 'goal'].includes(name)) input.setAttribute('aria-describedby', `${input.id}-hint`);
    return input;
  });
  const msg = new Element();
  msg.hidden = true;
  const button = new Element('button');
  const label = new Element('span');
  const idle = kind === 'preview' ? 'Join the preview list' : 'Send my enquiry';
  label.textContent = idle;
  button.querySelector = (selector) => { assert.equal(selector, 'span'); return label; };
  const title = new Element('h2');
  title.textContent = kind === 'preview' ? 'Join the Android preview list' : 'Coaching enquiry';
  form.querySelector = (selector) => {
    const result = { '[data-form-msg]': msg, '[type="submit"]': button, '.title': title }[selector];
    assert.ok(result, `Unexpected form selector ${selector}`); return result;
  };
  form.querySelectorAll = (selector) => {
    if (selector === 'input, textarea, select') return fields;
    if (selector === '.msg:not([data-form-msg])') return [];
    throw new Error(`Unexpected form multi-selector ${selector}`);
  };
  form.resetCount = 0;
  form.reset = () => { form.resetCount++; fields.forEach((input) => { input.value = ''; }); };
  const document = {
    querySelectorAll: (selector) => { assert.equal(selector, 'form[data-form]'); return [form]; },
    createElement: (tag) => new Element(tag),
    getElementById: (id) => fields.map((field) => field.afterNode).find((node) => node?.id === id && !node.removed) ?? null,
  };
  const context = vm.createContext({
    d: document, reduce: { matches: true }, whenHydrated: (callback) => callback(), source: 'synthetic-regression',
    FormData: class { constructor() { this.data = fields.map(({ name, value }) => [name, value]); } entries() { return this.data[Symbol.iterator](); } },
    AbortController,
    fetch: (url, options) => { calls.push({ url, options }); return fetchImpl(url, options, calls.length); },
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
  });
  vm.runInContext(formSource, context, { filename: sourcePath });
  return {
    kind, form, fields, msg, button, label, title, idle, original, timers, calls,
    submit: () => form.events.get('submit')({ preventDefault() {} }),
    fireDeadline: () => { assert.equal(timers.size, 1); const [id, timer] = [...timers][0]; assert.equal(timer.delay, 15000); timers.delete(id); timer.callback(); },
  };
}

function response(status, { type = 'application/json', json = { ok: true }, jsonError, jsonPromise } = {}) {
  return { status, ok: status >= 200 && status < 300,
    headers: { get: (name) => { assert.equal(name, 'content-type'); return type; } },
    json: () => jsonPromise ?? (jsonError ? Promise.reject(jsonError) : Promise.resolve(json)),
  };
}
const deferred = () => { let resolve, reject; const promise = new Promise((res, rej) => { resolve = res; reject = rej; }); return { promise, resolve, reject }; };
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

function assertIdle(f) {
  assert.equal(f.button.getAttribute('aria-disabled'), null, 'busy marker cleared in finally');
  assert.equal(f.label.textContent, f.idle, 'original submit label restored');
  assert.equal(f.timers.size, 0, 'deadline cleared after settlement');
}
function assertOneRequest(f) {
  assert.equal(f.calls.length, 1, 'one fetch, no automatic retry');
  const { url, options } = f.calls[0];
  assert.equal(url, '/api/enquiries'); assert.equal(options.method, 'POST');
  assert.equal(options.headers['Content-Type'], 'application/json');
  const expected = Object.fromEntries(Object.entries(f.original).map(([key, value]) => [key, value.trim()]));
  expected.src = 'synthetic-regression';
  assert.deepEqual(JSON.parse(options.body), expected);
}
function assertFailure(f, expectedMessage = GENERIC) {
  assertIdle(f); assertOneRequest(f);
  assert.equal(f.form.resetCount, 0, 'failures must never reset form');
  assert.deepEqual(Object.fromEntries(f.fields.map(({ name, value }) => [name, value])), f.original, 'typed values preserved exactly');
  assert.equal(f.form.classList.contains('is-done'), false);
  assert.equal(f.msg.hidden, false); assert.equal(f.msg.className, 'msg error');
  assert.equal(f.msg.children[0].textContent, expectedMessage);
  assert.equal(f.msg.getAttribute('tabindex'), '-1'); assert.equal(f.msg.focusCount, 1);
  assert.equal(f.msg.focusOptions.preventScroll, true);
  assert.equal(f.msg.children.length, 2);
  const anchor = f.msg.children[1];
  assert.equal(anchor.tagName, 'a'); assert.match(anchor.innerHTML, /Send it by email instead/);
  const mailto = new URL(anchor.href);
  assert.equal(mailto.protocol, 'mailto:'); assert.equal(mailto.pathname, 'owner@example.test');
  assert.equal(mailto.searchParams.get('subject'), f.kind === 'preview' ? 'Blackglass Android preview list' : 'Blackglass coaching enquiry');
  const expectedBody = f.kind === 'preview'
    ? `Please add me to the Blackglass Android preview list.\n\nName: ${f.original.name.trim()}\nEmail: ${f.original.email.trim()}\n\n${f.original.goal.trim()}`
    : `Name: ${f.original.name.trim()}\nEmail: ${f.original.email.trim()}\nMobile: ${f.original.phone.trim()}\nLooking for: ${f.original.route}\n\n${f.original.goal.trim()}`;
  assert.equal(mailto.searchParams.get('body'), expectedBody, 'fallback email preserves the submitted details');
}

for (const kind of ['preview', 'enquiry']) {
  for (const type of ['application/json', 'text/html', null]) {
    test(`${kind}: 429 ${type ?? 'no content type'} keeps input and gives a distinct retry-later message`, async () => {
      const f = fixture(kind, async () => response(429, { type, json: { error: '<script>untrusted</script>' } }));
      await f.submit(); assertFailure(f, RATE_LIMIT);
    });
  }
  const failures = [
    ['409 duplicate JSON', () => response(409), DUPLICATE],
    ['409 duplicate non-JSON', () => response(409, { type: 'text/html' }), DUPLICATE],
    ['503 unavailable JSON', () => response(503)],
    ['503 unavailable HTML', () => response(503, { type: 'text/html' })],
    ['500 untrusted error body', () => response(500, { json: { error: '<script>untrusted</script>' } })],
    ['200 HTML is not a receipt', () => response(200, { type: 'text/html' })],
    ['200 missing content-type is not a receipt', () => response(200, { type: null })],
    ['200 JSON missing ok', () => response(200, { json: {} })],
    ['200 JSON false ok', () => response(200, { json: { ok: false } })],
    ['200 JSON string ok', () => response(200, { json: { ok: 'true' } })],
    ['200 JSON numeric ok', () => response(200, { json: { ok: 1 } })],
    ['200 JSON null', () => response(200, { json: null })],
    ['200 malformed JSON', () => response(200, { jsonError: new SyntaxError('bad JSON') })],
    ['offline rejected fetch', () => Promise.reject(new TypeError('Network error'))],
    ['fetch synchronous exception', () => { throw new TypeError('Network error'); }],
  ];
  for (const [name, makeResponse, expected] of failures) {
    test(`${kind}: ${name} preserves values and restores controls`, async () => {
      const f = fixture(kind, makeResponse); await f.submit(); assertFailure(f, expected);
    });
  }
  for (const status of [200, 201]) {
    test(`${kind}: ${status} JSON strict ok true confirms success`, async () => {
      const f = fixture(kind, async () => response(status, { type: 'application/json; charset=utf-8' }));
      await f.submit(); assertIdle(f); assertOneRequest(f);
      assert.equal(f.form.resetCount, 1); assert.equal(f.form.classList.contains('is-done'), true);
      assert.equal(f.msg.className, 'msg is-ok'); assert.equal(f.msg.hidden, false);
      assert.equal(f.msg.focusCount, 1); assert.equal(f.msg.focusOptions.preventScroll, false);
      assert.equal(f.msg.children.length, 1, 'no error fallback shown on success');
      assert.equal(f.title.textContent, kind === 'preview' ? 'You’re on the list.' : 'Enquiry sent.');
      assert.equal(f.msg.children[0].textContent, kind === 'preview'
        ? 'Josh will email test.person@example.test when there’s an Android build you can try.'
        : 'Josh will reply by text or email. Thanks for reaching out.');
    });
  }
  test(`${kind}: timeout waiting for response headers aborts once and preserves input`, async () => {
    const pending = deferred(); const f = fixture(kind, () => pending.promise);
    const submission = f.submit(); assert.equal(f.button.getAttribute('aria-disabled'), 'true');
    f.fireDeadline(); await submission; assertFailure(f); assert.equal(f.calls[0].options.signal.aborted, true);
    pending.resolve(response(201)); await tick(); assert.equal(f.form.resetCount, 0, 'late response never becomes success'); assert.equal(f.calls.length, 1);
  });
  test(`${kind}: timeout waiting for JSON body aborts once and ignores a late receipt`, async () => {
    const pending = deferred(); const f = fixture(kind, async () => response(200, { jsonPromise: pending.promise }));
    const submission = f.submit(); await tick(); f.fireDeadline(); await submission;
    assertFailure(f); assert.equal(f.calls[0].options.signal.aborted, true);
    pending.resolve({ ok: true }); await tick(); assert.equal(f.form.resetCount, 0); assert.equal(f.calls.length, 1);
  });
  test(`${kind}: repeated submit while headers are pending sends one request; manual retry works after 429`, async () => {
    const pending = deferred(); const f = fixture(kind, (_url, _options, count) => count === 1 ? pending.promise : response(201));
    const first = f.submit(); assert.equal(f.calls.length, 1);
    assert.equal(f.button.getAttribute('aria-disabled'), 'true');
    assert.equal(f.label.textContent, kind === 'preview' ? 'Adding you…' : 'Sending…');
    assert.equal(f.form.resetCount, 0);
    await f.submit(); await f.submit(); assert.equal(f.calls.length, 1);
    pending.resolve(response(429)); await first; assertFailure(f, RATE_LIMIT);
    await tick(); assert.equal(f.calls.length, 1, '429 must not trigger an automatic retry');
    await f.submit(); assert.equal(f.calls.length, 2, 'busy flag reset permits an explicit new attempt');
    assert.equal(f.form.resetCount, 1); assertIdle(f); assert.equal(f.msg.className, 'msg is-ok');
  });
  test(`${kind}: repeated submit while JSON body is pending sends one request`, async () => {
    const pending = deferred(); const f = fixture(kind, async () => response(201, { jsonPromise: pending.promise }));
    const first = f.submit(); await tick(); await f.submit(); assert.equal(f.calls.length, 1);
    assert.equal(f.form.resetCount, 0, 'must not reset before the receipt body confirms');
    pending.resolve({ ok: true }); await first; assertIdle(f); assertOneRequest(f); assert.equal(f.form.resetCount, 1);
  });
}

console.log(`# Source SHA-256: ${sha256}`);
