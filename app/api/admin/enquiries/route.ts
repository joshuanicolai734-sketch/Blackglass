import { getChatGPTUser } from "../../../chatgpt-auth";
import { enquiriesDb, isOwner, sameOrigin } from "../../../../db/enquiries";

const noStore = { "Cache-Control": "no-store" };
const statuses = new Set(["new", "contacted", "call", "won", "lost"]);

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !isOwner(user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers: noStore });
  }
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request" }, { status: 403, headers: noStore });
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid request");
    payload = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400, headers: noStore });
  }
  const id = payload.id;
  const status = payload.status;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id) ||
      typeof status !== "string" || !statuses.has(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400, headers: noStore });
  }
  try {
    await enquiriesDb().prepare("UPDATE enquiries SET status = ? WHERE id = ?").bind(status, id).run();
    return Response.json({ ok: true }, { headers: noStore });
  } catch {
    return Response.json({ error: "Could not save status" }, { status: 503, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !isOwner(user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers: noStore });
  }
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request" }, { status: 403, headers: noStore });
  let id: unknown;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid request");
    id = (payload as Record<string, unknown>).id;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400, headers: noStore });
  }
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) {
    return Response.json({ error: "Invalid enquiry" }, { status: 400, headers: noStore });
  }
  try {
    await enquiriesDb().prepare("DELETE FROM enquiries WHERE id = ?").bind(id).run();
    return Response.json({ ok: true }, { headers: noStore });
  } catch {
    return Response.json({ error: "Could not delete enquiry" }, { status: 503, headers: noStore });
  }
}
