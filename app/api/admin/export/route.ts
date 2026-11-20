import { getChatGPTUser } from "../../../chatgpt-auth";
import { enquiriesDb, isOwner, sameOrigin } from "../../../../db/enquiries";
import { createDataExport } from "../../../../db/export";

const noStore = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user || !isOwner(user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers: noStore });
  }
  if (!sameOrigin(request)) {
    return Response.json({ error: "Invalid request" }, { status: 403, headers: noStore });
  }

  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "enquiries" && kind !== "events") {
    return Response.json({ error: "Invalid export type" }, { status: 400, headers: noStore });
  }

  try {
    return await createDataExport(enquiriesDb(), kind);
  } catch {
    return Response.json({ error: "Export unavailable" }, { status: 503, headers: noStore });
  }
}