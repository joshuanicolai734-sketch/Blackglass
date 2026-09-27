// Regenerates public/qr/get.svg from content/site.ts's qrTarget. Run: node scripts/generate-qr.mjs
// Uses the `qrcode` package on demand (npx), so it isn't a site dependency.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const src = readFileSync("content/site.ts", "utf8");
const base = src.match(/url: "([^"]+)"/)[1];
const campaign = src.match(/export const campaign = "([^"]+)"/)[1];
const target = `${base}/get?utm_source=qr&utm_medium=qr&utm_campaign=${campaign}&utm_content=desktop_handoff`;
execFileSync("npx", ["-y", "qrcode@1.5.4", "-t", "svg", "-e", "M", "-q", "1", "-d", "101113ff", "-l", "f4f5efff", "-o", "public/qr/get.svg", target], { stdio: ["ignore", "inherit", "inherit"] });
console.log("QR ->", target);
