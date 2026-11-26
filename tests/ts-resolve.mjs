// Lets `node --test` import the app's TypeScript modules, which use extensionless relative imports as the bundler
// does: "./plates" resolves to "./plates.ts". Used with --experimental-strip-types (see package.json check:tools).
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function resolve(specifier, context, next) {
  if (/^\\.{1,2}\\//.test(specifier) && !/\\.[cm]?[jt]sx?$/.test(specifier)) {
    try { return await next(specifier + ".ts", context); } catch {}
  }
  return next(specifier, context);
}`),
);
