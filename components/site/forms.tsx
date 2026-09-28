import { contact, site } from "@/content/site";

type Params = Record<string, string | string[] | undefined>;

/**
 * Status flags that /api/enquiries adds when a form is posted without JavaScript (a 303 back to the page). The URL
 * only ever carries the flag, never what the visitor typed.
 */
export function formStatus(params: Params, success: "joined" | "sent") {
  const one = (k: string) => (Array.isArray(params[k]) ? params[k][0] : params[k]);
  if (one(success) === "1") return { done: true as const, error: null };
  const e = one("error");
  return { done: false as const, error: e ? (["invalid", "duplicate"].includes(e) ? e : "failed") : null };
}

/** The server-rendered message for a no-JavaScript post that didn't go through. */
export function FormError({ error, subject }: { error: string | null; subject: string }) {
  if (!error) return null;
  const text = error === "invalid"
    ? "Check your name and email address, then try again."
    : error === "duplicate"
      ? "We received a message from this email in the last two minutes. If this is something new, email " + site.founder + " instead."
      : "That didn’t go through, and nothing was saved. Try again, or email " + site.founder + " instead.";
  return (
    <div className="msg error" role="alert">
      <p>{text}</p>
      {error !== "invalid" && (
        <a className="link" href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}`}><span>Email {site.founder}</span></a>
      )}
    </div>
  );
}
