"use client";

import { useState, type FormEvent } from "react";
import { parseKg } from "@/lib/tools/plates";
import { estimate, plannedLoad, RELIABLE_REPS, ROUNDINGS, RPE_STEPS } from "@/lib/tools/strength";
import { syncQuery, useSettled } from "./client";

export type StrengthInput = { kg: string; reps: string; rpe: string; round: string; preps: string; prpe: string };
const RPE_NAMES: Record<string, string> = { "10": "10: nothing left", "9": "9: one more rep", "8": "8: two more", "7": "7: three more", "6": "6: four or more" };
const rpeLabel = (r: number) => RPE_NAMES[String(r)] ?? `${r}`;
const one = (n: number) => Number(n.toFixed(1));

export const strengthQuery = (i: StrengthInput) => ({
  kg: i.kg, reps: i.reps, rpe: i.rpe === "10" ? "" : i.rpe, round: i.round === "2.5" ? "" : i.round,
  preps: i.preps === "5" ? "" : i.preps, prpe: i.prpe === "8" ? "" : i.prpe,
});

export function StrengthTool({ initial }: { initial: StrengthInput }) {
  const [input, setInput] = useState(initial);
  const update = (patch: Partial<StrengthInput>) => {
    const next = { ...input, ...patch };
    setInput(next);
    syncQuery("/tools/one-rep-max", strengthQuery(next), "tool_1rm");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    syncQuery("/tools/one-rep-max", strengthQuery(input), "tool_1rm");
  };

  const filled = input.kg.trim() !== "" && input.reps.trim() !== "";
  const round = Number(input.round) || 2.5;
  const result = filled ? estimate({ weight: parseKg(input.kg) ?? NaN, reps: Number(input.reps), rpe: Number(input.rpe) || 10, round }) : null;
  const planReps = Math.min(12, Math.max(1, Math.round(Number(input.preps) || 5)));
  const planRpe = Number(input.prpe) || 8;
  const plan = result && result.ok ? plannedLoad(result.e1rm, planReps, planRpe, round) : null;
  const said = useSettled(!result ? "" : !result.ok ? result.error : `Estimated one-rep max ${one(result.e1rm)} kilograms. ${planReps} reps at RPE ${planRpe}: ${plan} kilograms.`);

  return (
    <div className="tool-grid">
      <form className="tool-form" method="get" action="/tools/one-rep-max" onSubmit={submit} noValidate>
        <p className="label">A set you&rsquo;ve done</p>
        <div className="row2">
          <div className="field">
            <label htmlFor="rm-kg">Weight <span className="opt">kg</span></label>
            <input id="rm-kg" name="kg" inputMode="decimal" autoComplete="off" placeholder="e.g. 100" value={input.kg}
              aria-invalid={result && !result.ok ? true : undefined} aria-describedby={result && !result.ok ? "rm-error" : undefined}
              onChange={(e) => update({ kg: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="rm-reps">Reps</label>
            <input id="rm-reps" name="reps" inputMode="numeric" autoComplete="off" placeholder="e.g. 5" value={input.reps}
              aria-invalid={result && !result.ok ? true : undefined} aria-describedby={result && !result.ok ? "rm-error" : undefined}
              onChange={(e) => update({ reps: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="rm-rpe">How hard was it? <span className="opt">RPE</span></label>
          <select id="rm-rpe" name="rpe" value={input.rpe} onChange={(e) => update({ rpe: e.target.value })}>
            {RPE_STEPS.map((r) => <option key={r} value={r}>{rpeLabel(r)}</option>)}
          </select>
        </div>
        <p className="label" style={{ marginTop: 32 }}>Your next set</p>
        <div className="row2">
          <div className="field">
            <label htmlFor="rm-preps">Reps</label>
            <select id="rm-preps" name="preps" value={String(planReps)} onChange={(e) => update({ preps: e.target.value })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rm-prpe">At RPE</label>
            <select id="rm-prpe" name="prpe" value={String(planRpe)} onChange={(e) => update({ prpe: e.target.value })}>
              {RPE_STEPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="rm-round">Round loads to</label>
          <select id="rm-round" name="round" value={String(round)} onChange={(e) => update({ round: e.target.value })}>
            {ROUNDINGS.map((r) => <option key={r} value={r}>{r} kg</option>)}
          </select>
        </div>
        <button className="btn btn-primary" type="submit"><span>Estimate</span></button>
      </form>

      <section className="tool-result" aria-labelledby="rm-result">
        <h2 id="rm-result" className="label tool-kicker">Estimated one-rep max</h2>
        {!result && <p className="tool-sub">Enter the weight and reps of a recent hard set.</p>}
        {result && !result.ok && <p className="tool-error" id="rm-error">{result.error}</p>}
        {result && result.ok && (
          <>
            <p className="tool-headline">{one(result.e1rm)}<small>kg</small></p>
            <p className="tool-sub">
              Epley&rsquo;s formula{result.brzycki !== null ? <>; Brzycki&rsquo;s gives {one(result.brzycki)} kg</> : null}.
              {Number(input.rpe) < 10 ? ` Your set counts as ${result.effectiveReps} reps to failure.` : ""}
            </p>
            {!result.reliable && (
              <p className="tool-note">That&rsquo;s {result.effectiveReps} reps to failure. Estimates are most reliable from sets of {RELIABLE_REPS} or fewer, so treat this one loosely.</p>
            )}
            <div className="tool-block">
              <p className="label">Next set</p>
              <p className="tool-headline" style={{ fontSize: "clamp(2rem, 6vw, 3.25rem)" }}>{plan}<small>kg</small></p>
              <p className="tool-sub">for {planReps} rep{planReps === 1 ? "" : "s"} at RPE {planRpe}{planRpe < 10 ? `, leaving about ${10 - planRpe} in the tank` : ", all-out"}.</p>
              <p className="tool-note"><a className="inline-link" href={`/tools/plates?kg=${plan}`}>Plates for {plan} kg</a> · <a className="inline-link" href={`/tools/warm-up?kg=${plan}&reps=${planReps}`}>Warm up to it</a></p>
            </div>
            <div className="tool-block tool-tables">
              <table className="tool-table">
                <caption className="label" style={{ textAlign: "left", paddingBottom: 12 }}>Percentages</caption>
                <thead><tr><th scope="col">% of 1RM</th><th scope="col" className="num">Load</th><th scope="col" className="num">About</th></tr></thead>
                <tbody>
                  {result.percentages.map((p) => (
                    <tr key={p.percent}><td>{p.percent}%</td><td className="num">{p.load} kg</td><td className="num">{p.reps} rep{p.reps === 1 ? "" : "s"}</td></tr>
                  ))}
                </tbody>
              </table>
              <table className="tool-table">
                <caption className="label" style={{ textAlign: "left", paddingBottom: 12 }}>Rep maxes</caption>
                <thead><tr><th scope="col">Reps</th><th scope="col" className="num">Best load</th></tr></thead>
                <tbody>
                  {result.repMaxes.map((m) => (
                    <tr key={m.reps} data-mark={m.reps === planReps && planRpe === 10 ? "" : undefined}><td>{m.reps}</td><td className="num">{m.load} kg</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="vh" aria-live="polite">{said}</p>
      </section>
    </div>
  );
}

