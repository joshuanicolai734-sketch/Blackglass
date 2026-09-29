import type { Enquiry } from "./enquiries";

type ActivityRow = { day: string; name: string; source: string; count: number };
export type ExportKind = "enquiries" | "events";
type ExportRow = Enquiry | ActivityRow;

const PAGE_SIZE = 250;

async function changeMarker(db: D1Database, kind: ExportKind): Promise<string> {
  const query = kind === "enquiries"
    ? "SELECT COUNT(*) AS total FROM enquiries"
    : "SELECT COUNT(*) AS total, COALESCE(SUM(count), 0) AS event_total FROM events";
  const result = await db.prepare(query).first<{ total: number; event_total?: number }>();
  if (!result) throw new Error("Export table unavailable");
  return `${result.total}:${result.event_total ?? ""}`;
}

async function loadPage(db: D1Database, kind: ExportKind, after?: ExportRow): Promise<ExportRow[]> {
  if (kind === "enquiries") {
    const sql = "SELECT id, created_at, name, email, phone, route, goal, status FROM enquiries";
    const query = after
      ? db.prepare(`${sql} WHERE created_at > ? OR (created_at = ? AND id > ?) ORDER BY created_at, id LIMIT ?`)
        .bind((after as Enquiry).created_at, (after as Enquiry).created_at, (after as Enquiry).id, PAGE_SIZE)
      : db.prepare(`${sql} ORDER BY created_at, id LIMIT ?`).bind(PAGE_SIZE);
    return (await query.all<Enquiry>()).results ?? [];
  }

  const sql = "SELECT day, name, source, count FROM events";
  const query = after
    ? db.prepare(`${sql} WHERE day > ? OR (day = ? AND name > ?) OR (day = ? AND name = ? AND source > ?) ORDER BY day, name, source LIMIT ?`)
      .bind(
        (after as ActivityRow).day,
        (after as ActivityRow).day, (after as ActivityRow).name,
        (after as ActivityRow).day, (after as ActivityRow).name, (after as ActivityRow).source,
        PAGE_SIZE,
      )
    : db.prepare(`${sql} ORDER BY day, name, source LIMIT ?`).bind(PAGE_SIZE);
  return (await query.all<ActivityRow>()).results ?? [];
}

/** Stream every record, not only the 100 newest entries shown in the admin inbox. */
export async function createDataExport(db: D1Database, kind: ExportKind, exportedAt = new Date().toISOString()): Promise<Response> {
  // Fail before sending download headers if the table or database is unavailable.
  // These markers detect writes during the download, but are not a database snapshot.
  const marker = await changeMarker(db, kind);
  const firstPage = await loadPage(db, kind);
  const encoder = new TextEncoder();
  let pending: ExportRow[] | null = firstPage;
  let lastRow: ExportRow | undefined;
  let started = false;
  let written = false;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (!started) {
          controller.enqueue(encoder.encode(
            `{"format":"blackglass-export-v1","kind":${JSON.stringify(kind)},"exportedAt":${JSON.stringify(exportedAt)},"rows":[`,
          ));
          started = true;
        }
        const rows = pending ?? await loadPage(db, kind, lastRow);
        pending = null;
        if (rows.length) {
          controller.enqueue(encoder.encode(`${written ? "," : ""}${rows.map((row) => JSON.stringify(row)).join(",")}`));
          written = true;
          lastRow = rows[rows.length - 1];
        }
        if (rows.length < PAGE_SIZE) {
          if (marker !== await changeMarker(db, kind)) {
            throw new Error("Export changed while downloading");
          }
          controller.enqueue(encoder.encode("]}"));
          controller.close();
        }
      } catch {
        controller.error(new Error("Export interrupted"));
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="blackglass-${kind}-${exportedAt.slice(0, 10)}.json"`,
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}