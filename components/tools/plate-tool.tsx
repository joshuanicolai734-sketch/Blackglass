"use client";

import { useState, type FormEvent } from "react";
import { BARS, formatKg, parseKg, plateLoading, PLATE_SETS, type PlateCount, type PlateSetId } from "@/lib/tools/plates";
import { syncQuery, toQuery, useSettled } from "./client";

export type PlateInput = { kg: string; bar: string; set: string; collars: boolean };
const SET_NAMES: Record<PlateSetId, string> = {
  standard: "Gym: 25 to 1.25 kg",
  fractional: "Gym with 0.5 and 0.25 kg",
  home: "Home: 20 to 1.25 kg",
};

export const plateQuery = (i: PlateInput) => ({ kg: i.kg, bar: i.bar === "20" ? "" : i.bar, set: i.set === "standard" ? "" : i.set, collars: i.collars ? "1" : "" });

export function plateSummary(perSide: PlateCount[]) {
  return perSide.length ? perSide.map((p) => `${p.count > 1 ? `${p.count} × ` : ""}${formatKg(p.kg)}`).join(", ") : "no plates: just the bar";
}

/** One sleeve of the bar, plates heaviest-first from the collar outward. Decorative: the list above it is the answer. */
export function PlateDrawing({ perSide, collars }: { perSide: PlateCount[]; collars: boolean }) {
  const plates = perSide.flatMap((p) => Array.from({ length: p.count }, () => p.kg));
  const h = (kg: number) => (kg >= 20 ? 120 : kg >= 15 ? 108 : kg >= 10 ? 96 : kg >= 5 ? 72 : kg >= 2.5 ? 58 : kg >= 1.25 ? 48 : 40);
  const w = (kg: number) => (kg >= 25 ? 26 : kg >= 20 ? 23 : kg >= 15 ? 20 : kg >= 10 ? 16 : kg >= 5 ? 12 : kg >= 2.5 ? 9 : 7);
  const shapes = plates.map((kg, i) => ({ kg, i, w: w(kg), h: h(kg), x: 96 + plates.slice(0, i).reduce((sum, p) => sum + w(p) + 3, 0) }));
  const x = 96 + plates.reduce((sum, p) => sum + w(p) + 3, 0);
  const width = Math.max(420, x + (collars ? 28 : 0) + 40);
  return (
    <svg className="plate-svg" viewBox={`0 0 ${width} 150`} aria-hidden="true" focusable="false">
      <rect className="bar" x="0" y="68" width="70" height="14" />
      <rect className="bar" x="70" y="56" width="22" height="38" />
      <rect className="bar" x="92" y="66" width={width - 92} height="18" />
      {shapes.map((s) => (
        <g key={s.i}>
          <rect className="plate" x={s.x} y={75 - s.h / 2} width={s.w} height={s.h} />
          {s.w >= 16 && <text x={s.x + s.w / 2} y={75 - s.h / 2 - 6} textAnchor="middle">{s.kg}</text>}
        </g>
      ))}
      {collars && <rect className="collar" x={x + 2} y="58" width="22" height="34" />}
    </svg>
  );
}

export function PlateTool({ initial }: { initial: PlateInput }) {
  const [input, setInput] = useState(initial);
  const target = parseKg(input.kg);
  const bar = Number(input.bar) || 20;
  const set = (input.set in PLATE_SETS ? input.set : "standard") as PlateSetId;
  const result = input.kg.trim() === "" ? null : plateLoading(target ?? NaN, bar, set, input.collars);

  const update = (patch: Partial<PlateInput>) => {
    const next = { ...input, ...patch };
    setInput(next);
    syncQuery("/tools/plates", plateQuery(next), "tool_plates");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    syncQuery("/tools/plates", plateQuery(input), "tool_plates");
  };

  const said = useSettled(
    !result ? "" : !result.ok ? result.error
      : `${formatKg(result.loading.total)}${result.exact ? "" : `, the nearest without going over ${formatKg(result.target)}`}: on each side, ${plateSummary(result.loading.perSide)}.`,
  );
  const errorId = "plates-error";

  return (
    <div className="tool-grid">
      <form className="tool-form" method="get" action="/tools/plates" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="plates-kg">Target weight <span className="opt">kg</span></label>
          <input id="plates-kg" name="kg" inputMode="decimal" autoComplete="off" placeholder="e.g. 102.5" value={input.kg}
            aria-invalid={result && !result.ok ? true : undefined} aria-describedby={result && !result.ok ? errorId : undefined}
            onChange={(e) => update({ kg: e.target.value })} />
        </div>
        <div className="row2">
          <div className="field">
            <label htmlFor="plates-bar">Bar</label>
            <select id="plates-bar" name="bar" value={String(bar)} onChange={(e) => update({ bar: e.target.value })}>
              {BARS.map((b) => <option key={b} value={b}>{b} kg</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="plates-set">Plates</label>
            <select id="plates-set" name="set" value={set} onChange={(e) => update({ set: e.target.value })}>
              {(Object.keys(PLATE_SETS) as PlateSetId[]).map((id) => <option key={id} value={id}>{SET_NAMES[id]}</option>)}
            </select>
          </div>
        </div>
        <label className="tool-check">
          <input type="checkbox" name="collars" value="1" checked={input.collars} onChange={(e) => update({ collars: e.target.checked })} />
          Competition collars (2.5 kg each)
        </label>
        <button className="btn btn-primary" type="submit"><span>Load the bar</span></button>
      </form>

      <section className="tool-result" aria-labelledby="plates-result">
        <h2 id="plates-result" className="label tool-kicker">On the bar</h2>
        {!result && <p className="tool-sub">Enter a weight to see the plates for each side.</p>}
        {result && !result.ok && <p className="tool-error" id={errorId}>{result.error}</p>}
        {result && result.ok && (
          <>
            <p className="tool-headline">{result.loading.total}<small>kg</small></p>
            <p className="tool-sub">
              {result.exact ? "Exactly your target." : `${formatKg(result.target)} can’t be made with these plates. This is the nearest without going over.`}{" "}
              Empty bar{input.collars ? " and collars" : ""}: {formatKg(result.empty)}.
            </p>
            <div className="tool-block">
              <p className="label">Each side, from the collar out</p>
              {result.loading.perSide.length ? (
                <ul className="plate-list">
                  {result.loading.perSide.map((p) => <li key={p.kg}><b>{formatKg(p.kg)}</b><span>× {p.count}</span></li>)}
                </ul>
              ) : <p className="tool-sub">No plates: lift the empty bar.</p>}
              <PlateDrawing perSide={result.loading.perSide} collars={input.collars} />
            </div>
            {!result.exact && (
              <div className="tool-block">
                <p className="label">Nearest loads</p>
                <ul className="tool-alt">
                  {[result.below, result.above].filter((l) => l !== null).map((l) => (
                    <li key={l.total}>
                      <a className="inline-link" href={`/tools/plates?${toQuery(plateQuery({ ...input, kg: String(l.total) }))}`}
                        onClick={(e) => { e.preventDefault(); update({ kg: String(l.total) }); }}>
                        {formatKg(l.total)}: {plateSummary(l.perSide)} a side
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        <p className="vh" aria-live="polite">{said}</p>
      </section>
    </div>
  );
}
