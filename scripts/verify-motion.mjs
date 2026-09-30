/* Read-only browser checks. Set BASE, PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE for the local runtime.
   Optional AXE_PATH enables accessibility scans. No forms are submitted, no remote services are mutated. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : "playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
const base = process.env.BASE || "http://127.0.0.1:5174";
const results = [], errors = [];
await mkdir("outputs", { recursive: true });
const check = (name, value) => { assert.ok(value, name); results.push(name); };
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
const capture = async (name, fullPage = false) => page.screenshot({ path: `outputs/${name}.png`, fullPage });
const motion = () => page.evaluate(() => window.blackglassMotion.state());
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.blackglassMotion);
  await page.waitForTimeout(350);
  check("Hero film runs while visible", (await motion()).running);
  await page.getByRole("button", { name: "Pause brand film", exact: true }).click();
  const stopped = (await motion()).time;
  await page.waitForTimeout(180);
  check("Pause freezes the precise film frame", (await motion()).time === stopped);
  for (const [index, name] of ["Load", "Drive", "Lock in"].entries()) {
    await page.getByRole("group", { name: "Brand film chapters" }).getByRole("button", { name: new RegExp(name) }).click();
    check(`Chapter ${name} is selected and paused`, await page.locator(".mp-chapters button").nth(index).getAttribute("aria-pressed") === "true" && !(await motion()).running);
    await capture(`brand-${index + 1}`);
  }
  await page.getByRole("button", { name: "Play brand film", exact: true }).click();
  await page.locator("#how-it-works").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  check("Offscreen film stops its frame loop", !(await motion()).running);
  await page.locator("#tab-plan").click();
  await page.locator("#tab-today").click();
  await page.waitForFunction(() => document.querySelector('#panel-today img').naturalWidth > 1);
  check("Real Android capture loads on use", await page.locator('#panel-today img').evaluate(img => img.naturalWidth > 1));
  await page.locator(".motion-poster").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  check("Offscreen return resumes the film", (await motion()).running);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pagehide")));
  check("Pagehide cancels the film", !(await motion()).running);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pageshow")));
  await page.waitForTimeout(100);
  check("Pageshow restores eligible playback", (await motion()).running);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  check("Live reduced-motion change stops playback", !(await motion()).running && (await motion()).reduced);
  check("Reduced-motion poster stays fully legible", await page.locator('[data-motion-word]').nth(2).evaluate(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  check("Removing reduced motion does not silently resume", !(await motion()).running);

  for (let visit = 0; visit < 3; visit++) {
    await page.goto(`${base}/movements`, { waitUntil: "networkidle" });
    await page.locator('.ms-studio[data-enhanced]').waitFor();
    for (const label of ["Deadlift", "Push-up", "Back squat"]) await page.getByRole('tab', { name: new RegExp(label, 'i') }).click();
    check(`Repeated studio selection ${visit + 1} leaves one panel`, await page.locator('.ms-panel:visible').count() === 1);
    await page.getByRole('button', { name: 'Play back squat', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.ms-panel:not([data-inactive]) video').paused);
    await page.waitForTimeout(250);
    check(`Playback ${visit + 1} advances actual video`, await page.locator('.ms-panel:visible video').evaluate(v => v.currentTime > 0));
    await page.locator('.ms-panel:visible .ms-views').getByRole('button', { name: 'Front', exact: true }).click();
    await page.waitForTimeout(200);
    check(`Camera switch ${visit + 1} pauses the video`, await page.locator('.ms-panel:visible video').evaluate(v => v.paused));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.blackglassMotion);
  }

  const axe = [];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/movements", "/get", "/coaching"]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      check(`${route} has no horizontal overflow at ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (process.env.AXE_PATH && width === 390) {
        await page.addScriptTag({ path: process.env.AXE_PATH });
        const scan = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
        axe.push({ route, violations: scan });
        check(`${route} has no WCAG A/AA axe violations`, scan.length === 0);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator('.menu summary').click();
  check("Mobile menu makes background inert", await page.locator('main').evaluate(el => el.inert));
  await page.keyboard.press('Escape');
  check("Escape closes mobile menu and restores content", await page.locator('main').evaluate(el => !el.inert));
  await capture('home-mobile-viewport');
  await page.locator('.motion-poster').scrollIntoViewIfNeeded();
  await capture('brand-mobile');
  await page.goto(base + '/movements', { waitUntil: 'networkidle' });
  await capture('studio-mobile-viewport');

  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base);
  check("No-JavaScript poster is complete", await staticPage.locator('[data-motion-word]').first().isVisible());
  check("No-JavaScript film has no dead controls", await staticPage.locator('.mp-controls').isHidden());
  await staticPage.goto(base + '/movements');
  check("No-JavaScript studio preserves all three native players", await staticPage.locator('video[controls]').count() === 3);
  await staticContext.close();
  check("No client page errors during the journeys", errors.length === 0);
  await writeFile('outputs/motion-qa.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, checks: results, axe, errors, limits: ['Chromium desktop emulation; no physical phone, Safari or Firefox run.', 'Local Node production preview; production D1 submissions and authentication were not exercised.'] }, null, 2));
  console.log(`${results.length} browser checks passed.`);
} finally { await browser.close(); }
