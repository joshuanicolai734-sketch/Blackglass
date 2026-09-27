import { env } from "cloudflare:workers";

export type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  route: string;
  goal: string;
  status: string;
};

export function enquiriesDb(): D1Database {
  if (!env.DB) throw new Error("Enquiry storage is unavailable");
  return env.DB;
}

const ownerEmails = new Set([
  "joshuanicolai734@gmail.com",
  "joshuanicolai@live.com",
]);

export function isOwner(email: string | undefined): boolean {
  return ownerEmails.has((email || "").trim().toLowerCase());
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
