// Renders the Blackglass launch kit and OG images.
//   cd social && npm install && node render.mjs            # everything
//   node render.mjs p01-intro v2-plan-to-last-set          # selected ids
// Needs Chromium (Playwright) and, for video, ffmpeg with libx264 (set FFMPEG=/path/to/ffmpeg if not on PATH).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { all } from "./assets.mjs";
import { ROOT } from "./lib.mjs";

const pick = process.argv.slice(2);
const jobs = pick.length ? all.filter((a) => pick.includes(a.id)) : all;
const FPS = 30;
const build = resolve(ROOT, "social/.build");
mkdirSync(build, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 1 });
  const file = resolve(build, `${job.id}.html`);
  writeFileSync(file, job.html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
  });
  const out = resolve(ROOT, job.out);
  mkdirSync(dirname(out), { recursive: true });
  if (!job.duration) {
    await page.screenshot({ path: out });
    console.log("image", job.id, "→", job.out);
  } else {
    const ff = spawn(process.env.FFMPEG || "ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((r, j) => ff.on("close", (code) => (code === 0 ? r() : j(new Error(`ffmpeg exited ${code}`)))));
    const frames = Math.round(job.duration * FPS);
    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.seek(t), f / FPS);
      const png = await page.screenshot({ type: "png" });
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    }
    ff.stdin.end();
    await done;
    // Optional soundtrack (e.g. teaser-sound.py output): keep a silent master and mux an audio version.
    if (job.audio && existsSync(resolve(ROOT, job.audio))) {
      const silent = out.replace(/\.mp4$/, "-silent.mp4");
      renameSync(out, silent);
      await new Promise((r, j) => spawn(process.env.FFMPEG || "ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", resolve(ROOT, job.audio),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], { stdio: "inherit" })
        .on("close", (code) => (code === 0 ? r() : j(new Error(`ffmpeg mux exited ${code}`)))));
    }
    console.log("video", job.id, `(${frames} frames) →`, job.out);
  }
  await page.close();
}
await browser.close();
