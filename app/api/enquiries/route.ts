import { enquiriesDb, sameOrigin } from "../../../db/enquiries";

const noStore = { "Cache-Control": "no-store" };
const routes = new Set(["coaching", "programme", "app"]);

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request" }, { status: 403, headers: noStore });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "JSON required" }, { status: 415, headers: noStore });
  }
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 8192) return Response.json({ error: "Too large" }, { status: 413, headers: noStore });

  let payload: Record<string, unknown>;
  try {
    const body = await request.text();
    if (body.length > 8192) return Response.json({ error: "Too large" }, { status: 413, headers: noStore });
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON");
    payload = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400, headers: noStore });
  }
  const value = (key: string) => typeof payload[key] === "string" ? payload[key].trim() : "";
  const name = value("name");
  const email = value("email").toLowerCase();
  const phone = value("phone");
  const route = value("route");
  const goal = value("goal");
  const website = value("website");
  const phoneDigits = phone.replace(/\D/g, "");
  if (!name || name.length > 80 || !email || email.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !routes.has(route) ||
      !goal || goal.length > 600 ||
      (phone && (phone.length > 30 || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^\+?[0-9\s().-]+$/.test(phone)))) {
    return Response.json({ error: "Check your details and try again" }, { status: 400, headers: noStore });
  }
  if (website) return Response.json({ ok: true }, { status: 201, headers: noStore });

  try {
    const db = enquiriesDb();
    const recent = await db.prepare("SELECT id FROM enquiries WHERE email = ? AND created_at > ? LIMIT 1")
      .bind(email, new Date(Date.now() - 2 * 60_000).toISOString()).first();
    if (recent) return Response.json({ error: "An enquiry from this email was received in the last two minutes" }, { status: 409, headers: noStore });
    await db.prepare("INSERT INTO enquiries (id, created_at, name, email, phone, route, goal, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')")
      .bind(crypto.randomUUID(), new Date().toISOString(), name, email, phone || null, route, goal).run();
    return Response.json({ ok: true }, { status: 201, headers: noStore });
  } catch {
    return Response.json({ error: "Enquiry storage is temporarily unavailable" }, { status: 503, headers: noStore });
  }
}
