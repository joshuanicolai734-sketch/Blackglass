import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  route: text("route").notNull(),
  goal: text("goal").notNull(),
  status: text("status").notNull().default("new"),
});

/** Daily action counts for the marketing site. No personal data: a date, an event name, a campaign source. */
export const events = sqliteTable("events", {
  day: text("day").notNull(),
  name: text("name").notNull(),
  source: text("source").notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.day, t.name, t.source] })]);
