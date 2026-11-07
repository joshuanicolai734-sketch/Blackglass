import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { accessKeys, verifyAccessJwt } from "../lib/access-jwt";
import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";

export type OwnerAuth = {
  /** "cloudflare-access" on Josh's Cloudflare account; "chatgpt" on ChatGPT Sites and in local development; "none" when
   * neither is set up, which keeps the owner area locked. */
  mode: "cloudflare-access" | "chatgpt" | "none";
  /** The signed-in email, or null. Callers still check it against the owner list (db/enquiries.ts `isOwner`). */
  email: string | null;
  /** Where to sign in, when the page itself offers it (ChatGPT only; Cloudflare Access signs in before the page runs). */
  signInPath: string | null;
};

/**
 * Who is signed in to the owner area.
 * - With Cloudflare Access settings (CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD), only a valid Access token counts.
 * - ChatGPT sign-in headers are trusted only where the ChatGPT Sites edge sets them (OWNER_AUTH = "chatgpt-sites") or in
 *   local development, where the Sites Vite plugin fakes them. Anywhere else a visitor could send them, so they're ignored.
 * - Otherwise nobody is signed in: the owner area stays locked until Access is set up.
 */
export async function ownerAuth(returnTo = "/admin"): Promise<OwnerAuth> {
  const team = (env.CF_ACCESS_TEAM_DOMAIN || "").trim();
  const aud = (env.CF_ACCESS_AUD || "").trim();
  if (team && aud) {
    const token = (await headers()).get("cf-access-jwt-assertion");
    let email: string | null = null;
    if (token) {
      try {
        email = await verifyAccessJwt(token, { team, aud, keys: await accessKeys(team) });
      } catch {
        email = null;
      }
    }
    return { mode: "cloudflare-access", email, signInPath: null };
  }
  if (env.OWNER_AUTH === "chatgpt-sites" || import.meta.env.DEV) {
    const user = await getChatGPTUser();
    return { mode: "chatgpt", email: user?.email ?? null, signInPath: chatGPTSignInPath(returnTo) };
  }
  return { mode: "none", email: null, signInPath: null };
}
