#!/usr/bin/env node
/*
 * Acceptance check for the 7 Oct v33 port (PR #9 coaching + mobile items, PR #13, and with --clip the clip worker).
 *
 *   node verify-staging.mjs https://<staging-host> [--chromium /path/to/chromium] [--clip] [--storage-state <file>]
 *
 * --clip adds C7, the clip-range service worker checks (only once that worker is staged).
 * --storage-state loads a Playwright storage state (a signed-in browser session) for an owner-only preview.
 *   That file holds a sign-in cookie: keep it local, never commit or post it.
 *
 * Needs Playwright (`npm i playwright` or the repo's dev install). Read-only: it loads pages with GETs,
 * stubs navigator.sendBeacon and aborts every /api/ request, so nothing is counted or submitted.
 * Exit code 0 = every check passed, 1 = at least one failed, 2 = could not run.
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) || '').replace(/\/$/, '');
const exe = args.includes('--chromium') ? args[args.indexOf('--chromium') + 1] : undefined;
const storageState = args.includes('--storage-state') ? args[args.indexOf('--storage-state') + 1] : undefined;
if (!base) { console.error('usage: node verify-staging.mjs https://<host> [--chromium <path>] [--clip] [--storage-state <file>]'); process.exit(2); }

const FORMAT = 'In person in Dunedin, or online anywhere in New Zealand';
const PAGES = ['/', '/coaching', '/get', '/movements', '/links', '/privacy', '/get/joined', '/coaching/sent'];
const WIDTHS = [320, 360, 1280];
const results = [];
const add = (id, ok, detail) => results.push({ id, ok, detail });
let apiAborted = 0;

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
async function open(path, width, js = true) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, javaScriptEnabled: js, ...(storageState ? { storageState } : {}) });
  if (js) await ctx.addInitScript(() => { navigator.sendBeacon = () => true; });
  await ctx.route(/\/api\//, (r) => { apiAborted++; return r.abort(); });
  const page = await ctx.newPage();
  const res = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(800);
  return { ctx, page, status: res?.status() };
}

// 1. Coaching format line, description and FAQ.
{
  const { ctx, page } = await open('/coaching', 360);
  const m = await page.evaluate((f) => ({
    inBody: document.body.innerText.includes(f),
    desc: document.querySelector('meta[name=description]')?.content || '',
    faq: [...document.querySelectorAll('summary')].some((s) => /Do I need to be in Dunedin\?/.test(s.textContent)),
  }), FORMAT);
  add('C1 format line on /coaching', m.inBody, m.inBody ? `found "${FORMAT}"` : `missing "${FORMAT}"`);
  add('C1 meta description', /online anywhere in New Zealand/.test(m.desc), m.desc.slice(0, 120));
  add('C1 FAQ "Do I need to be in Dunedin?"', m.faq, m.faq ? 'present' : 'missing');
  await ctx.close();
}

// 2. Enquiry select: every option fits the box at 320 and 360.
for (const w of [320, 360]) {
  const { ctx, page } = await open('/coaching', w);
  const m = await page.evaluate(() => {
    const s = document.querySelector('form#enquire select, form[action*="enquiries"] select');
    if (!s) return null;
    const cs = getComputedStyle(s);
    const room = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return { room: Math.round(room), opts: [...s.options].map((o) => [o.text, Math.round(c.measureText(o.text).width)]) };
  });
  if (!m) add(`C2 enquiry select @${w}`, false, 'select not found');
  else {
    const over = m.opts.filter(([, px]) => px > m.room);
    add(`C2 enquiry select @${w}`, over.length === 0, `room ${m.room}px; ` + m.opts.map(([t, px]) => `"${t}" ${px}px`).join(', '));
  }
  await ctx.close();
}

// 3–5. Per page and width: text >= 12px, targets >= 24px (WCAG 2.5.8: a link is exempt only when it sits inline in
// real sentence text; navigation, breadcrumb and footer links never are), no horizontal overflow. Run with
// JavaScript at 320/360/1280, and once more at 360 with JavaScript off, where fallback controls appear.
async function pageChecks(path, w, js) {
  const tag = js ? `@${w}` : `@${w} no-JS`;
  const { ctx, page, status } = await open(path, w, js);
  if (status !== 200) { add(`page ${path} ${tag}`, false, `HTTP ${status}`); await ctx.close(); return; }
  const m = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[aria-hidden="true"]'); };
    const small = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12)
      .map((e) => `${parseFloat(getComputedStyle(e).fontSize).toFixed(1)}px "${e.textContent.trim().slice(0, 30)}"`);
    // Words in the parent that are not themselves links or buttons: "Open A / Open B" is a list of links, not a sentence.
    const otherWords = (p) => [...p.childNodes].map((n) => (n.nodeType === 3 ? n.textContent : n.matches?.('a, button') ? '' : n.textContent)).join(' ')
      .split(/\s+/).filter((w) => /[A-Za-z\u00C0-\u024F]{2,}/.test(w)).length;
    const inSentence = (e) => {
      if (e.closest('nav, header, footer .ftr-base, .crumbs, .links-foot')) return false;
      if (getComputedStyle(e).display !== 'inline') return false;
      const p = e.parentElement; return !!p && otherWords(p) >= 2;
    };
    const taps = [...document.querySelectorAll('a[href], button, select, summary, input:not([type=hidden])')]
      .filter((e) => vis(e) && !e.closest('.trap'))
      .filter((e) => { const r = e.getBoundingClientRect(); return r.height < 24 && !inSentence(e); })
      .map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.getAttribute('aria-label') || e.textContent).trim().slice(0, 30)}"`; });
    return { small: [...new Set(small)], taps: [...new Set(taps)], sw: document.documentElement.scrollWidth, vw: innerWidth };
  });
  add(`C3 text >= 12px ${path} ${tag}`, m.small.length === 0, m.small.slice(0, 6).join('; ') || 'ok');
  add(`C4 targets >= 24px ${path} ${tag}`, m.taps.length === 0, m.taps.slice(0, 6).join('; ') || 'ok');
  add(`C5 no overflow ${path} ${tag}`, m.sw <= m.vw, `scrollWidth ${m.sw} / viewport ${m.vw}`);
  await ctx.close();
}
for (const path of PAGES) for (const w of WIDTHS) await pageChecks(path, w, true);
for (const path of PAGES) await pageChecks(path, 360, false);

// 6. Movement Studio play row fits with the longest state words.
for (const w of [320, 360]) {
  const { ctx, page } = await open('/movements', w);
  const m = await page.evaluate(() => {
    const st = document.querySelector('.ms-state'); if (!st) return null;
    const row = st.parentElement; const out = {};
    for (const t of ['Paused', 'Loading', 'Playing']) { st.textContent = t; out[t] = row.scrollWidth - row.clientWidth; }
    return out;
  });
  add(`C6 play row fits @${w}`, !!m && Object.values(m).every((v) => v <= 0), m ? JSON.stringify(m) + ' (px over)' : '.ms-state not found');
  await ctx.close();
}

// 7 (only with --clip). The clip-range service worker from studio/fixes/movement-clip-range/.
if (args.includes('--clip')) {
  const { ctx, page } = await open('/movements', 360);
  const sw = await page.evaluate(async () => {
    const r = await fetch('/movement-clips-sw.js', { cache: 'no-store' });
    return { status: r.status, type: r.headers.get('content-type') || '' };
  });
  add('C7 worker file served as JavaScript', sw.status === 200 && /javascript/.test(sw.type), `${sw.status} ${sw.type}`);
  const controlled = await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 15000 }).then(() => true, () => false);
  add('C7 worker controls /movements', controlled, controlled ? 'controller present' : 'no controller after 15 s');
  if (controlled) {
    const range = await page.evaluate(async () => {
      const src = [...document.querySelectorAll('.ms-studio video')].map((v) => v.currentSrc || v.getAttribute('src')).find(Boolean)
        || [...document.querySelectorAll('.ms-studio a[href$=".mp4"]')].map((a) => a.href)[0];
      if (!src) return null;
      const r = await fetch(new URL(src, location.href).pathname, { headers: { Range: 'bytes=0-99' } });
      return { path: new URL(src, location.href).pathname, status: r.status, len: (await r.arrayBuffer()).byteLength, cr: r.headers.get('content-range') };
    });
    add('C7 clip range answered with 206', !!range && range.status === 206 && range.len === 100, range ? `${range.path}: ${range.status} ${range.cr} len=${range.len}` : 'no clip found');
    await page.locator('.ms-studio input[type=range]:visible').first().fill('60').catch(() => {});
    await page.waitForTimeout(3000);
    const seek = await page.evaluate(() => {
      const vs = [...document.querySelectorAll('.ms-studio video')].filter((v) => v.seekable.length && v.seekable.end(v.seekable.length - 1) > 0.5);
      const err = /couldn.t load/i.test(document.querySelector('.ms-studio')?.innerText || '');
      return { seekable: vs.length, t: vs.map((v) => +v.currentTime.toFixed(2)), err };
    });
    add('C7 slider seeks (60 %)', seek.seekable > 0 && seek.t.some((t) => t > 1) && !seek.err, JSON.stringify(seek));
  }
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id}  —  ${r.detail}`);
console.log(`\n${results.length - failed.length}/${results.length} passed. /api/ requests aborted: ${apiAborted} (none reached the server).`);
process.exit(failed.length ? 1 : 0);
