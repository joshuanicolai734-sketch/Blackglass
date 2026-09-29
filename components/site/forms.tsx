import { coaching, contact, site } from "@/content/site";

/*
 * The two money forms, shared by their pages and the no-JavaScript retry pages.
 *
 * With JavaScript, public/site.js validates inline and posts JSON. Without it, the browser validates natively
 * (the markup has no `noValidate`; site.js sets it as a property), then posts to /api/enquiries. The server answers
 * a plain post with a 303 to a static result page (/get/joined, /coaching/sent) or to a retry page that names the
 * field at fault (/get/retry, /coaching/retry). Those URLs carry a field name at most, never what was typed.
 */

type Params = Record<string, string | string[] | undefined>;
export type FormField = "name" | "email" | "phone" | "goal";
export type Retry = { error: "invalid" | "duplicate" | "failed"; field: FormField | null };

/** What a rejected no-JavaScript post typed, handed back by a short-lived HttpOnly cookie (see the API route). */
export type Typed = Partial<Record<FormField | "route", string>>;
export function typedFrom(raw: string | undefined): Typed {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(decodeURIComponent(raw));
    if (!v || typeof v !== "object") return {};
    const out: Typed = {};
    for (const k of ["name", "email", "phone", "goal", "route"] as const) {
      const x = (v as Record<string, unknown>)[k];
      if (typeof x === "string") out[k] = x;
    }
    return out;
  } catch { return {}; }
}

const FIELDS: FormField[] = ["name", "email", "phone", "goal"];

/** Reads a retry page's flags. Only known values pass through. */
export function retryFrom(params: Params): Retry {
  const one = (k: string) => (Array.isArray(params[k]) ? params[k][0] : params[k]) || "";
  const e = one("error");
  const f = one("field") as FormField;
  return { error: e === "invalid" || e === "duplicate" ? e : "failed", field: FIELDS.includes(f) ? f : null };
}

const fieldText: Record<FormField, string> = {
  name: "Enter your name.",
  email: "Enter a valid email address, like name@example.com.",
  phone: "Enter a valid mobile number, or leave it blank.",
  goal: `Tell ${site.founder} a little about what you want to change.`,
};

/** A server-rendered message for a no-JavaScript post that didn't go through. The form points at it. */
function FormError({ id, retry, subject }: { id: string; retry: Retry | null; subject: string }) {
  if (!retry) return null;
  const text = retry.error === "invalid"
    ? retry.field ? `That didn’t go through. ${fieldText[retry.field]}` : "That didn’t go through. Check the details below and try again."
    : retry.error === "duplicate"
      ? `We received a message from this email in the last two minutes. If this is something new, email ${site.founder} instead.`
      : `That didn’t go through, and nothing was saved. Try again, or email ${site.founder} instead.`;
  return (
    <div className="msg error" id={id}>
      <p>{text}</p>
      {retry.error !== "invalid" && (
        <a className="link" href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}`}><span>Email {site.founder}</span></a>
      )}
    </div>
  );
}

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" /></svg>
);

/** The Android preview list. */
export function PreviewForm({ retry = null, typed = {} }: { retry?: Retry | null; typed?: Typed }) {
  const bad = (f: FormField) => retry?.error === "invalid" && retry.field === f;
  return (
    <form className="form-card" id="preview" method="post" action="/api/enquiries" data-form="preview" data-email={contact.email} data-founder={site.founder}
      {...(retry ? { tabIndex: -1, "aria-describedby": "preview-error" } : {})}>
      <h2 className="title">Join the Android preview list</h2>
      <p>Free. One email when there&rsquo;s a build you can try. No newsletter, and you can ask to be removed at any time.</p>
      <FormError id="preview-error" retry={retry} subject="Blackglass Android preview list" />
      <div className="field"><label htmlFor="p-name">Your name</label>
        <input id="p-name" name="name" type="text" defaultValue={typed.name} autoComplete="name" maxLength={80} required autoFocus={bad("name")} aria-invalid={bad("name") || undefined} /></div>
      <div className="field"><label htmlFor="p-email">Email address</label>
        <input id="p-email" name="email" type="email" defaultValue={typed.email} autoComplete="email" inputMode="email" maxLength={120} required autoFocus={bad("email")} aria-invalid={bad("email") || undefined} /></div>
      <div className="field"><label htmlFor="p-note">What do you want from a training app?<span className="opt">OPTIONAL</span></label>
        <input id="p-note" name="goal" type="text" defaultValue={typed.goal} maxLength={200} /></div>
      <div className="trap" aria-hidden="true"><label htmlFor="p-website">Leave blank</label><input id="p-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      <input type="hidden" name="route" value="app" />
      <button className="btn btn-primary" type="submit" data-vt-cta><span>Join the preview list</span><Arrow /></button>
      <p className="form-note">{site.founder} uses your name and email only to contact you about Blackglass for Android. <a href="/privacy">Privacy</a></p>
      <div className="msg" data-form-msg role="status" aria-live="polite" hidden />
    </form>
  );
}

/** What happens after an enquiry: only facts already stated on the site (the coaching FAQ and page). */
export function NextSteps({ className = "" }: { className?: string }) {
  return (
    <ol className={`next-steps ${className}`.trim()} aria-label="What happens next">
      <li>{site.founder} reads your enquiry and replies by email, or by text if you leave your number.</li>
      <li>You talk through your goal, start date and whether coaching is a good fit.</li>
      <li>You see the written scope and payment terms before you commit. No payment is taken here.</li>
    </ol>
  );
}

/** The coaching enquiry. */
export function EnquiryForm({ retry = null, typed = {} }: { retry?: Retry | null; typed?: Typed }) {
  const price = `${coaching.currency}${coaching.weekly}`;
  const bad = (f: FormField) => retry?.error === "invalid" && retry.field === f;
  return (
    <form className="form-card" id="enquire" method="post" action="/api/enquiries" data-form="enquiry" data-email={contact.email} data-founder={site.founder}
      {...(retry ? { tabIndex: -1, "aria-describedby": "enquire-error" } : {})}>
      <h2 className="title">Coaching enquiry</h2>
      <FormError id="enquire-error" retry={retry} subject="Blackglass coaching" />
      <div className="row2">
        <div className="field"><label htmlFor="e-name">Your name</label><input id="e-name" name="name" type="text" defaultValue={typed.name} autoComplete="name" maxLength={80} required autoFocus={bad("name")} aria-invalid={bad("name") || undefined} /></div>
        <div className="field"><label htmlFor="e-email">Email address</label><input id="e-email" name="email" type="email" defaultValue={typed.email} autoComplete="email" inputMode="email" maxLength={120} required autoFocus={bad("email")} aria-invalid={bad("email") || undefined} /></div>
      </div>
      <div className="field"><label htmlFor="e-phone">Mobile for a text reply<span className="opt">OPTIONAL</span></label>
        <input id="e-phone" name="phone" type="tel" defaultValue={typed.phone} autoComplete="tel" inputMode="tel" maxLength={30} pattern="\+?[0-9\s\(\)\.\-]{7,30}" aria-describedby="e-phone-hint" autoFocus={bad("phone")} aria-invalid={bad("phone") || undefined} /><span className="hint" id="e-phone-hint">Only used to reply to this enquiry.</span></div>
      <div className="field"><label htmlFor="e-route">What are you looking for?</label>
        <select id="e-route" name="route" defaultValue={typed.route === "programme" ? "programme" : "coaching"}><option value="coaching">{coaching.weeks}-week coaching ({price}/week)</option><option value="programme">A personal training programme</option></select></div>
      <div className="field"><label htmlFor="e-goal">What do you want to change?</label>
        <textarea id="e-goal" name="goal" defaultValue={typed.goal} rows={4} maxLength={600} required aria-describedby="e-goal-hint" autoFocus={bad("goal")} aria-invalid={bad("goal") || undefined} placeholder="Your goal, where you're at, and what has been getting in the way" /><span className="hint" id="e-goal-hint">Please don&rsquo;t include medical details. {site.founder} will ask what&rsquo;s relevant.</span></div>
      <div className="trap" aria-hidden="true"><label htmlFor="e-website">Leave blank</label><input id="e-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      {/* Reassurance at the click: what happens next, from facts already on this page. */}
      <NextSteps className="form-steps" />
      <button className="btn btn-primary" type="submit"><span>Send my enquiry</span><Arrow /></button>
      <p className="form-note">No payment is taken here, and enquiring doesn&rsquo;t commit you to anything. {site.founder} uses these details only to reply. <a href="/privacy">Privacy</a></p>
      <div className="msg" data-form-msg role="status" aria-live="polite" hidden />
    </form>
  );
}
