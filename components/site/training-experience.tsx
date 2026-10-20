"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createSession, DEMO_EXERCISES, readSession, recordSet, sessionSummary, validSet, type DemoSession } from "@/lib/experience/session";

const KEY = "blackglass-experience-v1";
const EVENT = "blackglass-experience-change";
const subscribeClient = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const EMPTY = JSON.stringify(createSession());
let memory = EMPTY;
let loaded = false;
let persistent = true;
function snapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try { memory = localStorage.getItem(KEY) || EMPTY; } catch { persistent = false; }
  }
  return memory;
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) { memory = event.newValue || EMPTY; notify(); } };
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(EVENT, notify); window.removeEventListener("storage", storage); };
}
function save(next: DemoSession) {
  memory = JSON.stringify(next);
  try { localStorage.setItem(KEY, memory); persistent = true; } catch { persistent = false; }
  window.dispatchEvent(new Event(EVENT));
}
function Arrow() { return <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M4 16 16 4M5 4h11v11" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>; }
function Check() { return <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>; }

function SetEntry({ session, setIndex, onComplete }: { session: DemoSession; setIndex: number; onComplete: (reps: number, weight: number) => void }) {
  const initial = session.sets[session.active][setIndex];
  const [reps, setReps] = useState(String(initial.reps));
  const [weight, setWeight] = useState(String(initial.weight));
  const [error, setError] = useState("");
  return <form className="xp-entry" onSubmit={(event) => {
    event.preventDefault();
    const r = Number(reps), w = Number(weight);
    if (!reps.trim() || !weight.trim() || !validSet(r, w)) { setError("Enter 1–100 whole reps and 0–500 kg in steps of 0.25."); return; }
    setError(""); onComplete(r, w);
  }}>
    <p className="label xp-entry-label">Set {setIndex + 1} of 3 <span>Example values</span></p>
    <div className="xp-inputs">
      <label htmlFor="xp-reps">Reps<input id="xp-reps" inputMode="numeric" type="number" min="1" max="100" step="1" required value={reps} onChange={(event) => setReps(event.target.value)} aria-describedby={error ? "xp-entry-error" : undefined} /></label>
      <span aria-hidden="true">×</span>
      <label htmlFor="xp-weight">Added weight · kg<input id="xp-weight" inputMode="decimal" type="number" min="0" max="500" step="0.25" required value={weight} onChange={(event) => setWeight(event.target.value)} aria-describedby={error ? "xp-entry-error" : undefined} /></label>
    </div>
    <p className="xp-field-note">Use 0 for no added weight. These are demo entries, not recommended loads.</p>
    {error && <p id="xp-entry-error" className="xp-error" role="alert">{error}</p>}
    <button className="xp-log" type="submit"><span>Log this set</span><Check /></button>
  </form>;
}

function MovementView({ exercise }: { exercise: typeof DEMO_EXERCISES[number] }) {
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState("angled");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  useEffect(() => {
    const current = video.current;
    const pause = () => { sequence.current++; current?.pause(); };
    const visible = () => { if (document.hidden) pause(); };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = () => { if (motion.matches) pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    if (stage.current) observer.observe(stage.current);
    document.addEventListener("visibilitychange", visible);
    motion.addEventListener("change", reduced);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visible); motion.removeEventListener("change", reduced); pause(); };
  }, [view]);
  const play = () => {
    const current = video.current;
    if (!current) return;
    const attempt = ++sequence.current;
    if (!current.paused) { current.pause(); return; }
    setError(""); current.playbackRate = speed;
    current.play().catch((cause: unknown) => { if (attempt === sequence.current && !(cause instanceof DOMException && cause.name === "AbortError")) setError("Playback is unavailable. The movement still remains visible."); });
  };
  return <div className="xp-visual" ref={stage}>
    <div className="xp-visual-head"><span className="label">Movement study / {exercise.pattern}</span><span className="xp-live label">{playing ? "Playing" : "Paused"}</span></div>
    <div className="xp-film">
      <span className="xp-orbit xp-orbit-a" aria-hidden="true" /><span className="xp-orbit xp-orbit-b" aria-hidden="true" />
      <video ref={video} src={`/movements/${exercise.id}-${view}.mp4`} poster={`/movements/${exercise.id}-${view}.webp`} width="768" height="588" preload="none" muted playsInline loop aria-label={`${exercise.name}, ${view} view`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setError("The clip could not load. Try the Movement Studio below.")} />
      <span className="xp-axis label" aria-hidden="true">BLACKGLASS<br />KINETIC STUDY</span>
      <span className="xp-frame-corner xp-frame-tl" aria-hidden="true" /><span className="xp-frame-corner xp-frame-br" aria-hidden="true" />
    </div>
    <div className="xp-transport">
      <button type="button" onClick={play} aria-label={`${playing ? "Pause" : "Play"} movement`}><span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>{playing ? "Pause" : "Play movement"}</button>
      <button type="button" aria-pressed={speed === 0.5} onClick={() => { const next = speed === 1 ? 0.5 : 1; setSpeed(next); if (video.current) video.current.playbackRate = next; }}>{speed === 1 ? "1×" : "½×"} speed</button>
      <button type="button" onClick={() => { sequence.current++; video.current?.pause(); setPlaying(false); setError(""); setView(view === "angled" ? "front" : "angled"); }}>{view === "angled" ? "Front" : "Angled"} view <Arrow /></button>
    </div>
    {error && <p className="xp-error" role="status">{error}</p>}
    <p className="xp-film-note">Authored movement artwork. <a href="/movements">Explore the Movement Studio ↗</a></p>
  </div>;
}

export function TrainingExperience({ appCta }: { appCta: string }) {
  const enhanced = useSyncExternalStore(subscribeClient, clientSnapshot, serverSnapshot);
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const session = useMemo(() => readSession(raw), [raw]);
  const summary = sessionSummary(session);
  const exercise = DEMO_EXERCISES[session.active];
  const setIndex = session.sets[session.active].findIndex((set) => !set.done);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("Choose a movement and log an example set.");
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetRevision, setResetRevision] = useState(0);
  const nextButton = useRef<HTMLButtonElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, []);
  const remaining = session.restUntil ? Math.min(session.restDuration, Math.max(0, Math.ceil((session.restUntil - now) / 1000))) : 0;
  const nextExercise = DEMO_EXERCISES.findIndex((_, i) => i !== session.active && session.sets[i].some((set) => !set.done));
  const update = (next: DemoSession) => { save(next); };
  const select = (index: number) => { update({ ...session, active: index }); setNotice(`${DEMO_EXERCISES[index].name} selected.`); };
  const focusEntry = () => window.requestAnimationFrame(() => {
    const target = document.getElementById("xp-reps") || nextButton.current || document.getElementById("xp-complete-title");
    target?.focus({ preventScroll: true });
  });

  return <div className="xp-shell">
    <div className="xp-session-top"><div><span className="xp-signal" /><span className="label">Sample session / Full body</span></div><span className="label">03 movements · 09 sets</span></div>
    <noscript><p className="xp-nojs">The interactive logger needs JavaScript. You can still <a href="/movements">watch the movement studies</a> or <a href="/get">open Get Blackglass</a>.</p></noscript>
    <fieldset className="xp-session-grid" disabled={!enhanced}>
      <nav className="xp-exercises" aria-label="Sample session movements">
        {DEMO_EXERCISES.map((item, i) => <button type="button" key={item.id} onClick={() => select(i)} aria-pressed={session.active === i}>
          <span className="xp-exercise-index">0{i + 1}</span><span><small>{item.pattern}</small><strong>{item.name}</strong><span className="xp-set-dots" aria-label={`${session.sets[i].filter((set) => set.done).length} of ${item.sets} sets logged`}>{session.sets[i].map((set, j) => <i key={j} data-done={set.done ? "" : undefined} />)}</span></span><Arrow />
        </button>)}
        <div className="xp-session-total"><span className="label">Sets logged</span><span className="xp-fraction">{String(summary.completed).padStart(2, "0")}<small> / 09</small></span><div className="xp-progress" role="progressbar" aria-label="Sample session completion" aria-valuemin={0} aria-valuemax={9} aria-valuenow={summary.completed}><i style={{ transform: `scaleX(${summary.completed / summary.total})` }} /></div></div>
      </nav>

      <MovementView key={exercise.id} exercise={exercise} />

      <aside className="xp-logger" aria-label="Set logger">
        <div className="xp-logger-title"><span className="label">Your current movement</span><h2>{exercise.name}</h2></div>
        {summary.completed === summary.total ? <div className="xp-complete"><span className="xp-complete-icon"><Check /></span><p className="label">Session logged</p><h3 id="xp-complete-title" tabIndex={-1}>Every set.<br />Accounted for.</h3><p>You tried the full flow. Your example session is {persistent ? "kept in this browser" : "available until you leave this page"}.</p><a href="/get">{appCta} <Arrow /></a></div>
          : setIndex >= 0 ? <SetEntry key={`${exercise.id}-${setIndex}-${resetRevision}`} session={session} setIndex={setIndex} onComplete={(reps, weight) => {
            const next = recordSet(session, session.active, setIndex, reps, weight);
            update(next); setNotice(`${exercise.name} set ${setIndex + 1} logged: ${reps} reps, ${weight} kilograms added. ${sessionSummary(next).completed} of 9 sets complete.`);
            focusEntry();
          }} /> : <div className="xp-movement-done"><Check /><h3>Movement complete.</h3><p>All three example sets are logged.</p><button type="button" ref={nextButton} onClick={() => { select(nextExercise); focusEntry(); }}>Next: {DEMO_EXERCISES[nextExercise]?.name}<Arrow /></button></div>}
        <div className="xp-sets" aria-label={`${exercise.name} logged sets`}>{session.sets[session.active].map((set, i) => <div key={i} data-done={set.done ? "" : undefined}><span className="label">Set {i + 1}</span><span>{set.done ? `${set.reps} × ${set.weight} kg` : "—"}</span>{set.done ? <button type="button" aria-label={`Undo ${exercise.name} set ${i + 1}`} onClick={() => {
          update({ ...session, restUntil: 0, sets: session.sets.map((rows, e) => rows.map((row, j) => e === session.active && j === i ? { ...row, done: false } : row)) }); setNotice(`${exercise.name} set ${i + 1} undone.`); focusEntry();
        }}>Undo</button> : <span className="xp-empty-set" aria-hidden="true">○</span>}</div>)}</div>
        <div className="xp-rest"><div><span className="label">{remaining > 0 ? "Take a breath" : "Rest timer"}</span><strong aria-label={`${remaining} seconds remaining`}>{`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}</strong></div><div className="xp-rest-actions"><label htmlFor="xp-rest-duration" className="label">After each set</label><select id="xp-rest-duration" value={session.restDuration} onChange={(event) => update({ ...session, restDuration: Number(event.target.value), restUntil: remaining > 0 ? Date.now() + Number(event.target.value) * 1000 : 0 })}><option value={30}>30 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option></select>{remaining > 0 && <button type="button" onClick={() => { update({ ...session, restUntil: 0 }); setNotice("Rest timer skipped."); window.requestAnimationFrame(() => document.getElementById("xp-rest-duration")?.focus({ preventScroll: true })); }}>Skip rest ↗</button>}</div></div>
      </aside>
    </fieldset>
    <div className="xp-session-bottom"><div className="xp-metrics"><div><span className="label">Reps logged</span><strong>{summary.reps}</strong></div><div><span className="label">Added-load volume</span><strong>{summary.volume.toLocaleString("en-NZ")}<small> kg</small></strong></div><p>Reps × added weight.<br />Bodyweight is excluded.</p></div><div className="xp-save"><span className="label">{persistent ? "Kept on this browser" : "Temporary session only"}</span><p>{persistent ? "Close and return to resume. No entries are sent." : "Browser storage is unavailable. This session will reset when you leave."}</p><button type="button" ref={resetButton} disabled={!enhanced} onClick={() => { setConfirmReset(true); window.requestAnimationFrame(() => document.getElementById("xp-confirm-clear")?.focus({ preventScroll: true })); }}>Clear demo session ↗</button></div></div>
    {confirmReset && <div className="xp-reset" role="group" aria-label="Confirm clearing the demo"><p>Clear all nine example sets and the timer?</p><button type="button" id="xp-confirm-clear" onClick={() => { update(createSession()); setResetRevision((value) => value + 1); setConfirmReset(false); setNotice("Demo session cleared."); focusEntry(); }}>Clear session</button><button type="button" onClick={() => { setConfirmReset(false); window.requestAnimationFrame(() => resetButton.current?.focus({ preventScroll: true })); }}>Keep session</button></div>}
    <p className="xp-announcement" role="status" aria-live="polite">{notice}</p>
  </div>;
}
