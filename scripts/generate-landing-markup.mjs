import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync("app/landing-source.html", "utf8");
const body = source.match(/<body>([\s\S]*?)<\/body>/)?.[1];
if (!body) throw new Error("Landing source has no body content");

writeFileSync(
  "app/landing-markup.ts",
  `// Generated from app/landing-source.html. Edit that file, then regenerate this module.\nexport const landingMarkup = ${JSON.stringify(body)};\n`,
);
