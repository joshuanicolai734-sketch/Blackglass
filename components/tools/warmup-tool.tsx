"use client";

import { useState, type FormEvent } from "react";
import { BARS, formatKg, parseKg, PLATE_SETS, type PlateSetId } from "@/lib/tools/plates";
import { warmup } from "@/lib/tools/warmup";
import { syncQuery, useSettled } from "./client";
import { plateSummary } from "./plate-tool";

export type WarmupInput = { kg: string; reps: string; bar: string; set: string };
export const warmupQuery = (i: WarmupInput) => ({ kg: i.kg, reps: i.reps === "5" ? "" : i.reps, bar: i.bar === "20" ? "" : i.bar, set: i.set === "standard" ? "" : i.set });

export function WarmupTool({ initial }: { initial: WarmupInput }) {
  const [input, setInput] = useState(initial);
  const update = (patch: Partial<WarmupInput>) => {
    const next = { ...input, ...patch };
    setInput(next);
    syncQuery("/tools/warm-up", warmupQuery(next));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    syncQuery("/tools/warm-up", warmupQuery(input));
  };
  const bar = Number(input.bar) || 20;
  const set = (input.set in PLATE_SETS ? input.set : "standard") as PlateSetId;
  const reps = Math.round(Number(input.reps) || 5);
  const result = input.kg.trim() === "" ? null : warmup(parseKg(input.kg) ?? NaN, reps, bar, set);
  const said = useSettled(!result ? "" : !result.ok ? result.error : `${result.sets.length} warm-up sets: ${result.sets.map((s) => `${s.load} kilograms for ${s.reps}`).join(", ")}.`);

  return (
    <div className="tool-grid">
      <form className="tool-form" method="get" action="/tools/warm-up" onSubmit={submit} noValidate>
        <div className="row2">
          <div className="field">
            <label htmlFor="wu-kg">Working weight <span className="opt">kg</span></label>
            <input id="wu-kg" name="kg" inputMode="decimal" autoComplete="off" placeholder="e.g. 140" value={input.kg}
              aria-invalid={result && !result.ok ? true : undefined} aria-describedby={result && !result.ok ? "wu-error" : undefined}
              onChange={(e) => update({ kg: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="wu-reps">Reps per work set</label>
            <select id="wu-reps" name="reps" value={String(reps)} onChange={(e) => update({ reps: e.target.value })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="row2">
          <div className="field">
            <label htmlFor="wu-bar">Bar</label>
            <select id="wu-bar" name="bar" value={String(bar)} onChange={(e) => update({ bar: e.target.value })}>
              {BARS.map((b) => <option key={b} value={b}>{b} kg</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="wu-set">Plates</label>
            <select id="wu-set" name="set" value={set} onChange={(e) => update({ set: e.target.value })}>
              <option value="standard">Gym: 25 to 1.25 kg</option>
              <option value="fractional">Gym with 0.5 and 0.25 kg</option>
              <option value="home">Home: 20 to 1.25 kg</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" type="submit"><span>Build the warm-up</span></button>
      </form>

      <section className="tool-result" aria-labelledby="wu-result">
        <h2 id="wu-result" className="label tool-kicker">Warm-up</h2>
        {!result && <p className="tool-sub">Enter the weight of your first work set.</p>}
        {result && !result.ok && <p className="tool-error" id="wu-error">{result.error}</p>}
        {result && result.ok && (
          <>
            <ol className="warm-list" aria-label="Sets, lightest first">
              {result.sets.map((s) => (
                <li key={s.load}>
                  <span className="w-load">{formatKg(s.load)}</span>
                  <span className="w-reps">× {s.reps}</span>
                  <span className="w-plates">{s.bar ? "Empty bar" : `${s.percent}% · ${plateSummary(s.perSide)} a side`}</span>
                </li>
              ))}
              <li data-work="">
                <span className="w-load">{formatKg(result.work)}</span>
                <span className="w-reps">× {reps}</span>
                <span className="w-plates">Work sets · <a className="inline-link" href={`/tools/plates?kg=${result.work}${bar !== 20 ? `&bar=${bar}` : ""}${set !== "standard" ? `&set=${set}` : ""}`}>plates</a></span>
              </li>
            </ol>
            <p className="tool-note">Rest as long as you need between warm-up sets: about a minute early on, longer near the top.</p>
          </>
        )}
        <p className="vh" aria-live="polite">{said}</p>
      </section>
    </div>
  );
}
