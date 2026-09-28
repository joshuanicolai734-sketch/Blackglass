import { enquiriesDb, sameOrigin } from "../../../db/enquiries";
import { countEvent } from "../../../db/events";

const noStore = { "Cache-Control": "no-store" };
const routes = new Set(["coaching", "programme", "app"]);

type Outcome = "ok" | "invalid" | "duplicate" | "unavailable" | "forbidden" | "too-large" | "unsupported";

/**
 * Where a plain HTML form post (no JavaScript) lands afterwards: back on its own page with a status flag, never with
 * anything the visitor typed. The page renders the matching message from that flag.
 */
function landing(request: Request, route: string, outcome: Outcome): Response {
  const coachingForm = route === "coaching" || route === "programme";
  const url = new URL(coachingForm ? "/coaching" : "/get", request.url);
  if (outcome === "ok") url.searchParams.set(coachingForm ? "sent" : "joined", "1");
  else url.searchParams.set("error", outcome);
  url.hash = coachingForm ? "enquire" : "preview";
  return new Response(null, { status: 303, headers: { ...noStore, Location: url.pathname + url.search + url.hash } });
}

async function readPayload(request: Request, json: boolean): Promise<Record<string, unknown> | null> {
  const body = await request.text();
  if (body.length > 8192) throw new RangeError("Too large");
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
  let route = "";
  const reply = (outcome: Outcome, body: Record<string, unknown>, status: number) =>
    json ? Response.json(body, { status, headers: noStore }) : landing(request, route, outcome);

  if (!sameOrigin(request)) return reply("forbidden", { error: "Invalid request" }, 403);
  if (!json && !form) return Response.json({ error: "JSON required" }, { status: 415, headers: noStore });
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 8192) return reply("too-large", { error: "Too large" }, 413);

  let payload: Record<string, unknown> | null;
  try {
    if (type.includes("multipart/form-data")) {
      const data = await request.formData();
      payload = {};
      for (const [k, v] of data.entries()) if (typeof v === "string") payload[k] = v;
      if (JSON.stringify(payload).length > 8192) throw new RangeError("Too large");
    } else {
      payload = await readPayload(request, json);
    }
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
  const phoneDigits = phone.replace(/\D/g, "");
  if (!name || name.length > 80 || !email || email.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !routes.has(route) ||
      (route !== "app" && !goal) || goal.length > 600 ||
      (phone && (phone.length > 30 || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^\+?[0-9\s().-]+$/.test(phone)))) {
    return reply("invalid", { error: "Check your details and try again" }, 400);
  }
  if (website) return reply("ok", { ok: true }, 201);

  try {
    const db = enquiriesDb();
    const recent = await db.prepare("SELECT id FROM enquiries WHERE email = ? AND created_at > ? LIMIT 1")
      .bind(email, new Date(Date.now() - 2 * 60_000).toISOString()).first();
    if (recent) return reply("duplicate", { error: "An enquiry from this email was received in the last two minutes" }, 409);
    await db.prepare("INSERT INTO enquiries (id, created_at, name, email, phone, route, goal, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')")
      .bind(crypto.randomUUID(), new Date().toISOString(), name, email, phone || null, route, goal).run();
    await countEvent(db, route === "app" ? "preview_signup" : "enquiry_sent", value("src")).catch(() => {});
    return reply("ok", { ok: true }, 201);
  } catch {
    return reply("unavailable", { error: "Enquiry storage is temporarily unavailable" }, 503);
  }
}
