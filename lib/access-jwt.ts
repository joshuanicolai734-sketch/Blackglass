/**
 * Cloudflare Access tokens for the owner area.
 *
 * On Josh's Cloudflare account, Access sits in front of /admin and /api/admin. It signs every request it lets through
 * with a JSON Web Token (`Cf-Access-Jwt-Assertion`, RS256). The token is checked here too: signature, issuer, audience
 * and expiry. So a forged header can't open the owner area if the Worker is ever reached without Access in front.
 */

type Jwk = JsonWebKey & { kid?: string };
type Claims = { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: unknown };

const ALG = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } as const;

function b64urlBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function b64urlJson<T>(s: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlBytes(s))) as T;
  } catch {
    return null;
  }
}

export async function importAccessKeys(jwks: { keys?: Jwk[] }): Promise<Map<string, CryptoKey>> {
  const keys = new Map<string, CryptoKey>();
  for (const k of jwks.keys || []) {
    if (!k.kid || k.kty !== "RSA") continue;
    keys.set(k.kid, await crypto.subtle.importKey("jwk", k, ALG, false, ["verify"]));
  }
  return keys;
}

let cache: { team: string; at: number; keys: Map<string, CryptoKey> } | null = null;
const KEEP_MS = 10 * 60 * 1000;
const REFETCH_GAP_MS = 30 * 1000;

/** The key id a token was signed with, from its header (unverified: it only picks which key to verify with). */
export function tokenKid(token: string): string | null {
  const header = b64urlJson<{ kid?: unknown }>(token.split(".")[0] ?? "");
  return header && typeof header.kid === "string" ? header.kid : null;
}

/**
 * The team's signing keys, fetched from Access and kept for ten minutes (Access rotates keys with an overlap).
 * Given the `kid` of the token at hand, an unknown key id means Access may have rotated: the keys are fetched again,
 * at most once every 30 seconds, so a rotation can't lock the owner out and forged ids can't force a fetch per request.
 */
export async function accessKeys(team: string, fetchImpl: typeof fetch = fetch, opts: { kid?: string | null; now?: number } = {}): Promise<Map<string, CryptoKey>> {
  const now = opts.now ?? Date.now();
  if (cache && cache.team === team && now - cache.at < KEEP_MS) {
    const known = !opts.kid || cache.keys.has(opts.kid);
    if (known || now - cache.at < REFETCH_GAP_MS) return cache.keys;
  }
  const res = await fetchImpl(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs: ${res.status}`);
  const keys = await importAccessKeys((await res.json()) as { keys?: Jwk[] });
  cache = { team, at: now, keys };
  return keys;
}

/** The signed-in email if the token is valid for this team and application, otherwise null. */
export async function verifyAccessJwt(
  token: string,
  opts: { team: string; aud: string; keys: Map<string, CryptoKey>; now?: number },
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const header = b64urlJson<{ alg?: string; kid?: string }>(h);
  if (!header || header.alg !== "RS256" || !header.kid) return null;
  const key = opts.keys.get(header.kid);
  if (!key) return null;
  let valid = false;
  try {
    valid = await crypto.subtle.verify(ALG, key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
  } catch {
    return null;
  }
  if (!valid) return null;
  const claims = b64urlJson<Claims>(p);
  if (!claims) return null;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.includes(opts.aud)) return null;
  if (claims.iss !== `https://${opts.team}`) return null;
  if (typeof claims.exp !== "number" || claims.exp <= now) return null;
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) return null;
  return typeof claims.email === "string" && claims.email ? claims.email : null;
}
