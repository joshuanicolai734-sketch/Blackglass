import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { createDataExport } from "../db/export.ts";

function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE enquiries (id TEXT PRIMARY KEY, created_at TEXT, name TEXT, email TEXT, phone TEXT, route TEXT, goal TEXT, status TEXT);
    CREATE TABLE events (day TEXT, name TEXT, source TEXT, count INTEGER, PRIMARY KEY (day, name, source));
  `);
  const addEnquiry = sqlite.prepare("INSERT INTO enquiries VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const addEvent = sqlite.prepare("INSERT INTO events VALUES (?, ?, ?, ?)");
  for (let i = 0; i < 501; i++) {
    const id = String(i).padStart(4, "0");
    addEnquiry.run(id, "2026-09-29T00:00:00.000Z", `Person ${id}`, `${id}@example.com`, null, "coaching", "line 1\nline 2", "new");
    addEvent.run("2026-09-29", "cta_get_hero", `source-${id}`, i + 1);
  }
  const db = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async all() { return { results: statement.all(...args) }; },
        async first() { return statement.get(...args); },
      };
    },
  };
  return { sqlite, db, addEnquiry, addEvent };
}

for (const kind of ["enquiries", "events"]) {
  test(`${kind} exports every row across page boundaries`, async () => {
    const { sqlite, db } = fixture();
    try {
      const response = await createDataExport(db, kind, "2026-09-29T04:00:00.000Z");
      assert.equal(response.status, 200);
      assert.match(response.headers.get("cache-control"), /no-store/);
      assert.match(response.headers.get("content-disposition"), new RegExp(`blackglass-${kind}-2026-09-29.json`));
      const data = await response.json();
      assert.equal(data.kind, kind);
      assert.equal(data.format, "blackglass-export-v1");
      assert.equal(data.rows.length, 501);
      assert.equal(new Set(data.rows.map((row) => kind === "enquiries" ? row.id : row.source)).size, 501);
      assert.equal(data.rows[0][kind === "enquiries" ? "id" : "source"], kind === "enquiries" ? "0000" : "source-0000");
      assert.equal(data.rows[500][kind === "enquiries" ? "id" : "source"], kind === "enquiries" ? "0500" : "source-0500");
    } finally {
      sqlite.close();
    }
  });
}

test("a missing table rejects before serving a download", async () => {
  const sqlite = new DatabaseSync(":memory:");
  const db = {
    prepare(sql) {
      return {
        bind() { return this; },
        async all() { return { results: sqlite.prepare(sql).all(250) }; },
        async first() { return sqlite.prepare(sql).get(); },
      };
    },
  };
  try {
    await assert.rejects(createDataExport(db, "enquiries"), /no such table/);
  } finally {
    sqlite.close();
  }
});

test("an enquiry arriving earlier in the sort order interrupts the download", async () => {
  const { sqlite, db, addEnquiry } = fixture();
  try {
    const response = await createDataExport(db, "enquiries");
    addEnquiry.run("late", "2026-09-28T00:00:00.000Z", "Late", "late@example.com", null, "coaching", "", "new");
    await assert.rejects(response.text(), /Export interrupted/);
  } finally {
    sqlite.close();
  }
});

test("an activity count changing mid-export interrupts the download", async () => {
  const { sqlite, db } = fixture();
  try {
    const response = await createDataExport(db, "events");
    sqlite.prepare("UPDATE events SET count = count + 1 WHERE source = ?").run("source-0000");
    await assert.rejects(response.text(), /Export interrupted/);
  } finally {
    sqlite.close();
  }
});