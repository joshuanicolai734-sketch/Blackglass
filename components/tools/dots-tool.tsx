"use client";

import { useState, type FormEvent } from "react";
import { parseKg } from "@/lib/tools/plates";
import { COEFFICIENTS, FORMULAS, LIFTS, score, type Formula, type Lift } from "@/lib/tools/dots";
import { syncQuery, useSettled } from "./client";

export type DotsInput = { bw: string; kg: string; lift: string; f: string };

const LIFT_NAMES: Record<Lift, string> = { total: "Total (squat + bench + deadlift)", squat: "Squat", bench: "Bench press", deadlift: "Deadlift" };
const FORMULA_NAMES: Record<Formula, string> = { men: "Men’s", women: "Women’s" };
const asLift = (v: string): Lift => (LIFTS.includes(v as Lift) ? (v as Lift) : "total");
const asFormula = (v: string): Formula => (FORMULAS.includes(v as Formula) ? (v as Formula) : "men");
const two = (n: number) => n.toFixed(2);

export const dotsQuery = (i: DotsInput) => ({ bw: i.bw, kg: i.kg, lift: i.lift === "total" ? "" : i.lift, f: i.f === "men" ? "" : i.f });

export function DotsTool({ initial }: { initial: DotsInput }) {
  const [input, setInput] = useState(initial);
  const update = (patch: Partial<DotsInput>) => {
    const next = { ...input, ...patch };
    setInput(next);
    syncQuery("/tools/dots", dotsQuery(next), "tool_dots");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    syncQuery("/tools/dots", dotsQuery(input), "tool_dots");
  };

  const lift = asLift(input.lift);
  const formula = asFormula(input.f);
  const filled = input.bw.trim() !== "" && input.kg.trim() !== "";
  const result = filled ? score({ bodyweight: parseKg(input.bw) ?? NaN, result: parseKg(input.kg) ?? NaN, formula, lift }) : null;
  const what = lift === "total" ? "total" : LIFT_NAMES[lift].toLowerCase();
  const said = useSettled(!result ? "" : !result.ok ? result.error : `DOTS score ${two(result.score)} for that ${what}.`);
  const bad = result && !result.ok ? result.field : null;

  return (
    <div className="tool-grid">
      <form className="tool-form" method="get" action="/tools/dots" onSubmit={submit} noValidate>
        <p className="label">Your lift</p>
        <div className="row2">
          <div className="field">
            <label htmlFor="dots-bw">Bodyweight <span className="opt">kg</span></label>
            <input id="dots-bw" name="bw" inputMode="decimal" autoComplete="off" placeholder="e.g. 83" value={input.bw}
              aria-invalid={bad === "bw" ? true : undefined} aria-describedby={bad === "bw" ? "dots-error" : undefined}
              onChange={(e) => update({ bw: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="dots-kg">Weight lifted <span className="opt">kg</span></label>
            <input id="dots-kg" name="kg" inputMode="decimal" autoComplete="off" placeholder="e.g. 500" value={input.kg}
              aria-invalid={bad === "kg" ? true : undefined} aria-describedby={bad === "kg" ? "dots-error" : undefined}
              onChange={(e) => update({ kg: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="dots-lift">What it is</label>
          <select id="dots-lift" name="lift" value={lift} onChange={(e) => update({ lift: e.target.value })}>
            {LIFTS.map((l) => <option key={l} value={l}>{LIFT_NAMES[l]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dots-f">Coefficients</label>
          <select id="dots-f" name="f" value={formula} onChange={(e) => update({ f: e.target.value })}>
            {FORMULAS.map((f) => <option key={f} value={f}>{FORMULA_NAMES[f]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" type="submit"><span>Score it</span></button>
      </form>

      <section className="tool-result" aria-labelledby="dots-result">
        <h2 id="dots-result" className="label tool-kicker">DOTS score</h2>
        {!result && <p className="tool-sub">Enter your bodyweight and a total or a single lift.</p>}
        {result && !result.ok && <p className="tool-error" id="dots-error">{result.error}</p>}
        {result && result.ok && (
          <>
            <p className="tool-headline">{two(result.score)}</p>
            <p className="tool-sub">
              {FORMULA_NAMES[formula]} coefficients, for a {what} of {parseKg(input.kg)} kg at {parseKg(input.bw)} kg bodyweight.
            </p>
            {lift !== "total" && (
              <p className="tool-note">DOTS was made for totals. A {what} score only compares with other {what} scores.</p>
            )}
            {result.clamped && (
              <p className="tool-note">
                The formula covers {COEFFICIENTS[formula].min} to {COEFFICIENTS[formula].max} kg of bodyweight, so it scores you as {Math.min(COEFFICIENTS[formula].max, Math.max(COEFFICIENTS[formula].min, parseKg(input.bw) ?? 0))} kg.
              </p>
            )}
            {result.equivalents.length > 0 && (
              <div className="tool-block tool-tables">
                <table className="tool-table">
                  <caption className="label" style={{ textAlign: "left", paddingBottom: 12 }}>The same score at other bodyweights</caption>
                  <thead><tr><th scope="col">Bodyweight</th><th scope="col" className="num">{lift === "total" ? "Total" : LIFT_NAMES[lift]}</th></tr></thead>
                  <tbody>
                    {result.equivalents.map((r) => (
                      <tr key={r.bodyweight} data-mark={r.own ? "" : undefined}>
                        <td>{r.bodyweight} kg{r.own ? " · you" : ""}</td><td className="num">{r.result} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        <p className="vh" aria-live="polite">{said}</p>
      </section>
    </div>
  );
}
