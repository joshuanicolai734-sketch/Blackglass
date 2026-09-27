import { enquiriesDb, sameOrigin } from "../../../db/enquiries";
import { BROWSER_EVENTS, countEvent } from "../../../db/events";

const noStore = { "Cache-Control": "no-store" };

// Receives {e: event name, s: campaign source} from public/site.js. Only allowlisted names are counted.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403, headers: noStore });
  let body: { e?: unknown; s?: unknown };
  try {
    const text = await request.text();
    if (text.length > 256) return new Response(null, { status: 413, headers: noStore });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400, headers: noStore });
  }
  if (typeof body.e !== "string" || !BROWSER_EVENTS.has(body.e)) return new Response(null, { status: 400, headers: noStore });
  try {
    await countEvent(enquiriesDb(), body.e, String(body.s ?? ""));
  } catch {
    // Counting must never affect visitors (e.g. before the events migration has run).
  }
  return new Response(null, { status: 204, headers: noStore });
}
