import { enquiriesDb, sameOrigin } from "../../../db/enquiries";
import { countEvent } from "../../../db/events";

const noStore = { "Cache-Control": "no-store" };
const routes = new Set(["coaching", "programme", "app"]);

type Outcome = "ok" | "invalid" | "duplicate" | "unavailable" | "forbidden" | "too-large" | "unsupported";

/**
 * Where a plain HTML form post (no JavaScript) lands afterwards. Success goes to a static confirmation page
 * (/get/joined, /coaching/sent); anything else goes to a retry page with the reason and, for a validation failure,
 * the name of the field at fault. Nothing the visitor typed goes in the URL. So a rejected form isn't emptied, what
 * they typed rides back in a two-minute HttpOnly cookie scoped to the retry page alone. It pre-fills that page until
 * it expires or a successful post clears it.
 */
const KEEP = { name: 80, email: 120, phone: 30, goal: 600, route: 12 } as const;
function landing(request: Request, route: string, outcome: Outcome, field: string | null, typed: Record<string, string> | null): Response {
  const coachingForm = route === "coaching" || route === "programme";
  const base = coachingForm ? "/coaching" : "/get";
  const headers = new Headers({ ...noStore });
  // Secure whenever the visitor reached us over https: the URL's own scheme, or the proxy's word for it.
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? new URL(request.url).protocol.replace(":", "");
  const secure = proto === "https" ? "; Secure" : "";
  const cookie = (value: string, age: number) => `bg-retry=${value}; Path=${base}/retry; Max-Age=${age}; HttpOnly; SameSite=Lax${secure}`;
  let location: string;
  if (outcome === "ok") {
    location = `${base}/${coachingForm ? "sent" : "joined"}`;
    headers.append("Set-Cookie", cookie("", 0));
  } else {
    const q = new URLSearchParams({ error: outcome });
    if (field) q.set("field", field);
    location = `${base}/retry?${q}#${coachingForm ? "enquire" : "preview"}`;
    if (typed) {
      const keep: Record<string, string> = {};
      for (const [k, n] of Object.entries(KEEP)) if (typed[k]) keep[k] = typed[k].slice(0, n);
      headers.append("Set-Cookie", cookie(encodeURIComponent(JSON.stringify(keep)), 120));
    }
  }
  headers.set("Location", location);
  return new Response(null, { status: 303, headers });
}

const MAX_BODY_BYTES = 8192;

/** Enforce the same byte limit with or without Content-Length, before parsing a multipart body. */
async function readBody(request: Request): Promise<Uint8Array<ArrayBuffer>> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("Too large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(new ArrayBuffer(size));
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

async function readPayload(request: Request, json: boolean, multipart: boolean, type: string): Promise<Record<string, unknown> | null> {
  const bytes = await readBody(request);
  if (multipart) {
    const data = await new Request(request.url, { method: "POST", headers: { "Content-Type": type }, body: bytes }).formData();
    const payload: Record<string, unknown> = {};
    for (const [key, value] of data.entries()) {
      if (typeof value !== "string") return null; // File parts are not enquiry fields.
      payload[key] = value;
    }
    return payload;
  }
  const body = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (json) {
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  }
  return Object.fromEntries(new URLSearchParams(body));
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") || "";
  const json = type.includes("application/json");
  const form = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  // JSON callers (public/site.js) get JSON; plain form posts get a 303 back to their page.
  const from = new URL(request.url).searchParams.get("from") === "coaching" ? "coaching" : "app";
  let route = "";
  let field: string | null = null;
  let typed: Record<string, string> | null = null;
  const reply = (outcome: Outcome, body: Record<string, unknown>, status: number) =>
    json ? Response.json(body, { status, headers: noStore }) : landing(request, routes.has(route) ? route : from, outcome, field, typed);

  if (!sameOrigin(request)) return reply("forbidden", { error: "Invalid request" }, 403);
  if (!json && !form) return reply("unsupported", { error: "Unsupported form type" }, 415);
  const length = Number(request.headers.get("content-length") || "0");
  if (length > MAX_BODY_BYTES) return reply("too-large", { error: "Too large" }, 413);

  let payload: Record<string, unknown> | null;
  try {
    payload = await readPayload(request, json, type.includes("multipart/form-data"), type);
  } catch (e) {
    return e instanceof RangeError ? reply("too-large", { error: "Too large" }, 413) : reply("invalid", { error: "Invalid request" }, 400);
  }
  if (!payload) return reply("invalid", { error: "Invalid request" }, 400);
  const fields = payload;
  const value = (key: string) => typeof fields[key] === "string" ? (fields[key] as string).trim() : "";
  const name = value("name");
  const email = value("email").toLowerCase();
  const phone = value("phone");
  route = value("route");
  const goal = value("goal");
  const website = value("website");
  typed = { name, email, phone, goal, route };
  const phoneDigits = phone.replace(/\D/g, "");
  // The first field at fault, in form order (a field name carries no personal data).
  field = !name || name.length > 80 ? "name"
    : !email || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "email"
      : phone && (phone.length > 30 || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^\+?[0-9\s().-]+$/.test(phone)) ? "phone"
        : (route !== "app" && !goal) || goal.length > 600 ? "goal"
          : null;
  if (field || !routes.has(route)) {
    return reply("invalid", { error: "Check your details and try again" }, 400);
  }
  if (website) return reply("ok", { ok: true }, 201);

  try {
    const db = enquiriesDb();
    // A single SQLite statement closes the SELECT/INSERT race. A preview sign-up must not block a coaching enquiry.
    const saved = await db.prepare(`INSERT INTO enquiries (id, created_at, name, email, phone, route, goal, status)
      SELECT ?, ?, ?, ?, ?, ?, ?, 'new'
      WHERE NOT EXISTS (SELECT 1 FROM enquiries WHERE email = ? AND route = ? AND created_at > ?)`)
      .bind(crypto.randomUUID(), new Date().toISOString(), name, email, phone || null, route, goal,
        email, route, new Date(Date.now() - 2 * 60_000).toISOString()).run();
    if (!saved.success) throw new Error("Enquiry insert failed");
    if (saved.meta.changes === 0) return reply("duplicate", { error: "A submission from this email was received in the last two minutes" }, 409);
    if (saved.meta.changes !== 1) throw new Error("Enquiry insert did not save one row");
    await countEvent(db, route === "app" ? "preview_signup" : "enquiry_sent", value("src")).catch(() => {});
    return reply("ok", { ok: true }, 201);
  } catch {
    return reply("unavailable", { error: "Enquiry storage is temporarily unavailable" }, 503);
  }
}
