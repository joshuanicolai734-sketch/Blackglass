"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  ACTIVITY, buildPlan, calorieFloor, maintenanceKcal, MIN_TARGET_BF, navyBodyFat, optimalRatePct, screen,
  weeksToGoal, type ActivityId, type Plan, type Screen, type Sex,
} from "@/lib/cut/protocol";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type Fields = {
  sex: "" | Sex; age: string; height: string; weight: string; bfMode: "known" | "tape";
  bf: string; neck: string; waist: string; hips: string; activity: ActivityId; goal: string;
  pregnancy: boolean; eating: boolean; medical: boolean;
};

type Result =
  | { kind: "screened"; reason: Exclude<Screen, { ok: true }>["reason"] }
  | { kind: "plan"; sex: Sex; weightKg: number; bf: number; tape: boolean; maint: number; plan: Plan; goal: number | null; toGoal: number | null };

const blank: Fields = {
  sex: "", age: "", height: "", weight: "", bfMode: "known", bf: "", neck: "", waist: "", hips: "",
  activity: "desk", goal: "", pregnancy: false, eating: false, medical: false,
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-NZ");
const num = (s: string) => (s.trim() === "" ? Number.NaN : Number(s.replace(",", ".")));

const SCREENED: Record<Exclude<Screen, { ok: true }>["reason"], { title: string; body: string }> = {
  age: { title: "This plan is for adults.", body: "Training is good at any age, but calorie targets from a website aren't the right tool under 18. Your GP, or a coach at your school or gym, can help you train safely." },
  pregnancy: { title: "Not during pregnancy or breastfeeding.", body: "Your energy needs change, so a fat-loss plan is the wrong tool right now. Your midwife or GP can help with training and food that suit this time." },
  eating: { title: "This one isn't for you, and thanks for saying so.", body: "A plan built on calorie targets can make things harder. If food or weight takes up a lot of your thinking, EDANZ can help: 0800 2 EDANZ (0800 233 269). Need to talk? Free call or text 1737, any time." },
  medical: { title: "Your GP should set your targets.", body: "Your condition or medicine can change what's safe to eat and how fast to go. Training is still worth doing; your GP or a registered dietitian can tell you what fits." },
  underweight: { title: "There's nothing to cut.", body: "At a BMI under 20, eating less would cost you muscle. If you want to change shape, building muscle at maintenance is the better route." },
  bmi: { title: "Bring your GP in.", body: "At a BMI of 40 or over, your GP should be part of the plan: they can check what's safe and what support is available." },
};

export function CutCalculator({ storeUrl, price, coachingHref }: { storeUrl: string | null; price: string; coachingHref: string | null }) {
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [f, setF] = useState<Fields>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const bad = (k: keyof Fields) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `cut-err-${k}` } : {});
  const err = (k: keyof Fields) => errors[k] && <span className="field-error" id={`cut-err-${k}`}>{errors[k]}</span>;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Partial<Record<keyof Fields, string>> = {};
    const age = num(f.age), height = num(f.height), weight = num(f.weight);
    if (!f.sex) next.sex = "Choose one.";
    if (!(age >= 10 && age <= 100)) next.age = "Enter your age in years.";
    if (!(height >= 120 && height <= 230)) next.height = "Enter your height in centimetres, e.g. 175.";
    if (!(weight >= 35 && weight <= 250)) next.weight = "Enter your weight in kilograms, e.g. 82.";
    let bf = Number.NaN;
    if (f.bfMode === "known") {
      bf = num(f.bf);
      if (!(bf >= 4 && bf <= 65)) next.bf = "Enter your body fat as a percentage, e.g. 22.";
    } else {
      const neck = num(f.neck), waist = num(f.waist), hips = num(f.hips);
      if (!(neck >= 20 && neck <= 70)) next.neck = "Neck in centimetres, e.g. 38.";
      if (!(waist >= 40 && waist <= 200)) next.waist = "Waist in centimetres, e.g. 86.";
      if (f.sex === "female" && !(hips >= 50 && hips <= 200)) next.hips = "Hips in centimetres, e.g. 100.";
      if (!next.neck && !next.waist && !next.hips && f.sex && !next.height) {
        const est = navyBodyFat(f.sex, height, waist, neck, hips || 0);
        if (est === null) next.waist = "Those measurements don't add up. Measure again.";
        else bf = est;
      }
    }
    const goal = f.goal.trim() === "" ? null : num(f.goal);
    if (goal !== null && !(goal >= 5 && goal <= 50)) next.goal = "A body fat between 5 and 50, or leave it blank.";
    setErrors(next);
    if (Object.keys(next).length) {
      setResult(null);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    const sex = f.sex as Sex;
    const s = screen({ age, pregnancy: f.pregnancy, eatingDisorder: f.eating, medical: f.medical, heightCm: height, weightKg: weight });
    if (!s.ok) {
      setResult({ kind: "screened", reason: s.reason });
    } else {
      const factor = ACTIVITY.find((a) => a.id === f.activity)?.factor ?? ACTIVITY[0].factor;
      const maint = maintenanceKcal(weight, bf, factor);
      const plan = buildPlan({ sex, weightKg: weight, bodyFatPct: bf, goalBodyFatPct: goal ?? MIN_TARGET_BF[sex], maintenanceKcal: maint, weeks: 9 });
      if (!plan) {
        setErrors({ weight: "Those numbers don't make a usable plan. Check them." });
        return;
      }
      const toGoal = goal === null ? null : weeksToGoal({ sex, weightKg: weight, bodyFatPct: bf, goalBodyFatPct: goal, maintenanceKcal: maint }, 40);
      setResult({ kind: "plan", sex, weightKg: weight, bf, tape: f.bfMode === "tape", maint, plan, goal, toGoal });
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  const w1 = result?.kind === "plan" ? result.plan.weeks[0] : null;
  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof Fields, string][];

  return (
    <div className="cut-calc">
      <form className="form-card cut-form" onSubmit={onSubmit} noValidate={enhanced} aria-describedby="cut-privacy">
        <h3 className="title">Your numbers</h3>
        <p>Takes a minute. Use a 7-day average for weight if you have one.</p>

        {errorList.length > 0 && (
          <div className="msg error" role="alert" tabIndex={-1} ref={errorRef}>
            <p>Check {errorList.length === 1 ? "this" : "these"}:</p>
            <ul className="cut-errlist">{errorList.map(([k, v]) => <li key={k}><a className="inline-link" href={`#cut-${k}`}>{v}</a></li>)}</ul>
          </div>
        )}

        <fieldset className="field cut-fs" id="cut-sex">
          <legend id="cut-sex-legend">Body-fat scale</legend>
          <div className="cut-seg" role="radiogroup" aria-labelledby="cut-sex-legend" {...bad("sex")}>
            {(["male", "female"] as const).map((v) => (
              <label key={v}><input type="radio" name="sex" value={v} checked={f.sex === v} onChange={() => set("sex", v)} /><span>{v === "male" ? "Man" : "Woman"}</span></label>
            ))}
          </div>
          {err("sex")}
        </fieldset>

        <div className="cut-row3">
          <div className="field"><label htmlFor="cut-age">Age</label><input id="cut-age" inputMode="numeric" autoComplete="off" value={f.age} onChange={(e) => set("age", e.target.value)} {...bad("age")} />{err("age")}</div>
          <div className="field"><label htmlFor="cut-height">Height <span className="opt">cm</span></label><input id="cut-height" inputMode="decimal" autoComplete="off" value={f.height} onChange={(e) => set("height", e.target.value)} {...bad("height")} />{err("height")}</div>
          <div className="field"><label htmlFor="cut-weight">Weight <span className="opt">kg</span></label><input id="cut-weight" inputMode="decimal" autoComplete="off" value={f.weight} onChange={(e) => set("weight", e.target.value)} {...bad("weight")} />{err("weight")}</div>
        </div>

        <fieldset className="field cut-fs">
          <legend>Body fat</legend>
          <div className="cut-seg">
            <label><input type="radio" name="bfMode" value="known" checked={f.bfMode === "known"} onChange={() => set("bfMode", "known")} /><span>I know it</span></label>
            <label><input type="radio" name="bfMode" value="tape" checked={f.bfMode === "tape"} onChange={() => set("bfMode", "tape")} /><span>Measure with a tape</span></label>
          </div>
        </fieldset>
        {f.bfMode === "known" ? (
          <div className="field"><label htmlFor="cut-bf">Body fat <span className="opt">%</span></label><input id="cut-bf" inputMode="decimal" autoComplete="off" value={f.bf} onChange={(e) => set("bf", e.target.value)} {...bad("bf")} />{err("bf")}</div>
        ) : (
          <>
            <p className="hint cut-hint">Tape snug, breathing out. Neck just below the Adam&rsquo;s apple; men&rsquo;s waist at the navel; women&rsquo;s waist at the narrowest point and hips at the widest.</p>
            <div className="cut-row3">
              <div className="field"><label htmlFor="cut-neck">Neck <span className="opt">cm</span></label><input id="cut-neck" inputMode="decimal" autoComplete="off" value={f.neck} onChange={(e) => set("neck", e.target.value)} {...bad("neck")} />{err("neck")}</div>
              <div className="field"><label htmlFor="cut-waist">Waist <span className="opt">cm</span></label><input id="cut-waist" inputMode="decimal" autoComplete="off" value={f.waist} onChange={(e) => set("waist", e.target.value)} {...bad("waist")} />{err("waist")}</div>
              {f.sex === "female" && <div className="field"><label htmlFor="cut-hips">Hips <span className="opt">cm</span></label><input id="cut-hips" inputMode="decimal" autoComplete="off" value={f.hips} onChange={(e) => set("hips", e.target.value)} {...bad("hips")} />{err("hips")}</div>}
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="cut-activity">Your week, training included</label>
          <select id="cut-activity" value={f.activity} onChange={(e) => set("activity", e.target.value as ActivityId)}>
            {ACTIVITY.map((a) => <option key={a.id} value={a.id}>{a.label}: {a.detail}</option>)}
          </select>
        </div>

        <div className="field"><label htmlFor="cut-goal">Goal body fat <span className="opt">% · optional</span></label><input id="cut-goal" inputMode="decimal" autoComplete="off" value={f.goal} onChange={(e) => set("goal", e.target.value)} {...bad("goal")} aria-describedby={errors.goal ? "cut-err-goal" : "cut-goal-hint"} />{err("goal")}<span className="hint" id="cut-goal-hint">No lower than {MIN_TARGET_BF.male}% for men or {MIN_TARGET_BF.female}% for women on a plan nobody supervises.</span></div>

        <fieldset className="field cut-fs cut-checks">
          <legend>Tick any that apply</legend>
          <label><input type="checkbox" checked={f.pregnancy} onChange={(e) => set("pregnancy", e.target.checked)} /><span>I&rsquo;m pregnant, trying to get pregnant, or breastfeeding</span></label>
          <label><input type="checkbox" checked={f.eating} onChange={(e) => set("eating", e.target.checked)} /><span>I have, or have had, an eating disorder or a hard relationship with food</span></label>
          <label><input type="checkbox" checked={f.medical} onChange={(e) => set("medical", e.target.checked)} /><span>I have diabetes, heart, kidney or liver disease, or take medicine that affects appetite, blood sugar or blood pressure</span></label>
        </fieldset>

        <button className="btn btn-primary" type="submit" disabled={!enhanced} data-track="cut_calc"><span>Show my numbers</span></button>
        {!enhanced && <p className="form-note">The calculator needs JavaScript. The method and tables below work without it.</p>}
        <p className="form-note" id="cut-privacy">Worked out on your device. Nothing you type is sent to this site or saved. General guidance, not medical advice.</p>
      </form>

      <div className="cut-result" aria-live="polite">
        {result?.kind === "screened" && (
          <div className="cut-out">
            <h3 className="title" tabIndex={-1} ref={resultRef}>{SCREENED[result.reason].title}</h3>
            <p className="body-2">{SCREENED[result.reason].body}</p>
            {coachingHref && result.reason === "underweight" && <p><a className="link" href={coachingHref} data-track="cta_cut_coaching"><span>Coaching with Josh</span></a></p>}
          </div>
        )}
        {result?.kind === "plan" && w1 && (
          <div className="cut-out">
            <h3 className="title" tabIndex={-1} ref={resultRef}>Week 1</h3>
            <div className="cut-big"><span className="cut-kcal">{fmt(w1.kcal)}</span><span className="label">kcal a day</span></div>
            <dl className="cut-spec label">
              <dt>Protein</dt><dd>{w1.proteinG} g</dd>
              <dt>Fat</dt><dd>{w1.fatG} g</dd>
              <dt>Carbs</dt><dd>{w1.carbsG} g</dd>
              <dt>Body fat used</dt><dd>{result.bf.toFixed(1)}%{result.tape ? " (tape estimate)" : ""}</dd>
              <dt>Maintenance, estimated</dt><dd>{fmt(result.maint)} kcal</dd>
              <dt>Protocol rate</dt><dd>{optimalRatePct(result.bf, result.sex).toFixed(2)}% a week</dd>
              <dt>Your floor</dt><dd>{fmt(calorieFloor(result.weightKg))} kcal</dd>
            </dl>
            {w1.floored && <p className="body-2">Your floor is above the protocol&rsquo;s number, so expect about {w1.lossKg.toFixed(2)} kg a week instead of {((result.weightKg * w1.ratePct) / 100).toFixed(2)}.{w1.lossKg < (result.weightKg * w1.ratePct) / 100 * 0.75 ? " Slower, and on purpose: the floor is what keeps a plan nobody supervises safe." : ""}</p>}
            {result.plan.goalRaised && <p className="body-2">Your goal was below {MIN_TARGET_BF[result.sex]}%, the lowest this plan aims for, so it&rsquo;s been raised.</p>}
            {result.goal !== null && !result.plan.goalRaised && (
              <p className="body-2">{result.toGoal === null ? `${result.goal}% is more than 40 weeks away at a rate that keeps muscle. That's normal for a big change: run blocks with maintenance breaks between them.` : result.toGoal === 0 ? `You're at or below ${result.goal}% already.` : `At this rate you'd reach about ${result.goal}% around week ${result.toGoal}, with a maintenance week every ninth week.`}</p>
            )}
            <div className="cut-table-wrap">
              <table className="cut-table">
                <caption className="label">Nine weeks, projected. Your weekly check-ins will move these.</caption>
                <thead><tr><th scope="col">Week</th><th scope="col">kcal</th><th scope="col">Protein</th><th scope="col">Start kg</th><th scope="col">Fat %</th></tr></thead>
                <tbody>
                  {result.plan.weeks.map((w) => (
                    <tr key={w.week} className={w.maintenance ? "is-maint" : undefined}>
                      <th scope="row">{w.week}{w.maintenance ? " · maintenance" : ""}</th>
                      <td>{fmt(w.kcal)}</td><td>{w.proteinG} g</td><td>{w.weightKg.toFixed(1)}</td><td>{w.bodyFatPct.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="body-2">These are your targets. The plan adds the training, the weekly check-in and the rules for when to change them.</p>
            <div className="actions">
              {storeUrl
                ? <a className="btn btn-primary" href={storeUrl} rel="noopener" data-track="cta_cut_result"><span>Get the full plan · {price}</span></a>
                : coachingHref && <a className="btn btn-ghost" href={coachingHref} data-track="cta_cut_coaching"><span>Coaching with Josh</span></a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
