"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { EXERCISES, GUIDE, MAX_ROWS, MAX_SETS, weeklyVolume } from "@/lib/tools/volume";
import { syncQuery, useSettled } from "./client";

export type VolumeRow = { exercise: string; sets: string };
const SCALE = 30; // the bar chart runs from 0 to 30 sets
const STATUS: Record<string, string> = { none: "Not trained", low: `Under ${GUIDE.low}`, "in-range": "In the guide range", high: `Over ${GUIDE.high}` };

export const volumeQuery = (rows: VolumeRow[]) =>
  Object.fromEntries(rows.flatMap((r, i) => (r.exercise || r.sets ? [[`e${i + 1}`, r.exercise], [`s${i + 1}`, r.sets]] : [])));

const noSubscribe = () => () => {};
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function VolumeTool({ initial, example }: { initial: VolumeRow[]; example: boolean }) {
  // Every row is in the server’s HTML, so the form works without JavaScript. Once it runs, empty rows fold away
  // behind "Add an exercise".
  const [rows, setRows] = useState<VolumeRow[]>(() => Array.from({ length: MAX_ROWS }, (_, i) => initial[i] ?? { exercise: "", sets: "" }));
  const enhanced = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [shown, setShown] = useState(() => Math.min(MAX_ROWS, Math.max(1, initial.filter((r) => r.exercise || r.sets).length + 1)));
  const [isExample, setIsExample] = useState(example);

  const result = weeklyVolume(rows);
  const change = (i: number, patch: Partial<VolumeRow>) => {
    const next = rows.map((r, j) => (j === i ? { ...r, ...patch } : r));
    setRows(next);
    setIsExample(false);
    syncQuery("/tools/volume", volumeQuery(next));
  };
  const remove = (i: number) => {
    const next = [...rows.filter((_, j) => j !== i), { exercise: "", sets: "" }];
    setRows(next);
    setShown((n) => Math.max(1, n - 1));
    setIsExample(false);
    syncQuery("/tools/volume", volumeQuery(next));
  };
  const submit = (e: FormEvent) => { e.preventDefault(); syncQuery("/tools/volume", volumeQuery(rows)); };
  const trained = result.totals.filter((t) => t.sets > 0);
  const said = useSettled(trained.length ? trained.map((t) => `${t.name} ${fmt(t.sets)}`).join(", ") : "No sets yet.", 900);

  return (
    <div className="tool-grid">
      <form className="tool-form" method="get" action="/tools/volume" onSubmit={submit} noValidate>
        <p className="label">Your week: hard sets per exercise</p>
        {isExample && <p className="tool-note" style={{ marginTop: 10 }}>This is an example week. Change it to yours.</p>}
        <div className="vol-rows">
          {rows.map((row, i) => (
            <div className="vol-row" key={i} hidden={enhanced && i >= shown ? true : undefined}>
              <div className="field">
                <label htmlFor={`vol-e${i}`}>Exercise {i + 1}</label>
                <select id={`vol-e${i}`} name={`e${i + 1}`} value={row.exercise} onChange={(e) => change(i, { exercise: e.target.value })}>
                  <option value="">Choose…</option>
                  {EXERCISES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`vol-s${i}`}>Sets</label>
                <input id={`vol-s${i}`} name={`s${i + 1}`} inputMode="numeric" autoComplete="off" value={row.sets}
                  aria-invalid={result.errors.some((e) => e.startsWith(`Row ${i + 1}:`)) ? true : undefined}
                  onChange={(e) => change(i, { sets: e.target.value })} />
              </div>
              {enhanced && (row.exercise || row.sets) ? (
                <button className="btn btn-ghost btn-sm" type="button" style={{ gridColumn: "1 / -1", justifySelf: "start", width: "auto", marginTop: 8 }}
                  onClick={() => remove(i)} aria-label={`Remove exercise ${i + 1}`}><span>Remove</span></button>
              ) : null}
            </div>
          ))}
        </div>
        {enhanced && (
          <div className="vol-actions">
            {shown < MAX_ROWS && <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShown((n) => Math.min(MAX_ROWS, n + 1))}><span>Add an exercise</span></button>}
          </div>
        )}
        <button className="btn btn-primary" type="submit"><span>Count my week</span></button>
      </form>

      <section className="tool-result" aria-labelledby="vol-result">
        <h2 id="vol-result" className="label tool-kicker">Hard sets per muscle, per week</h2>
        {result.errors.length > 0 && <div className="tool-error" role="alert">{result.errors.map((e) => <p key={e} style={{ margin: 0 }}>{e}</p>)}</div>}
        <p className="tool-sub">{result.totalSets} sets across {result.rows.length} exercise{result.rows.length === 1 ? "" : "s"}. The shaded band is the guide range, {GUIDE.low} to {GUIDE.high} sets.</p>
        <ul className="vol-muscles tool-block" aria-label="Sets per muscle">
          {result.totals.map((t) => (
            <li key={t.muscle} className="vol-muscle" data-status={t.status}>
              <span className="vol-name">{t.name}</span>
              <span className="vol-track" aria-hidden="true">
                <span className="vol-guide" style={{ left: `${(GUIDE.low / SCALE) * 100}%`, width: `${((GUIDE.high - GUIDE.low) / SCALE) * 100}%` }} />
                <span className="vol-fill" style={{ width: `${(Math.min(t.sets, SCALE) / SCALE) * 100}%` }} />
              </span>
              <span className="vol-sets">{fmt(t.sets)}</span>
              <span className="vol-status">{STATUS[t.status]}</span>
            </li>
          ))}
        </ul>
        <p className="tool-note">Up to {MAX_SETS} sets a row. Sets count fully for the muscles an exercise mainly trains and half for the ones it helps.</p>
        <p className="vh" aria-live="polite">{said}</p>
      </section>
    </div>
  );
}
