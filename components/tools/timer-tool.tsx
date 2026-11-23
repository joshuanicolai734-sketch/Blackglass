"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { adjust, ANNOUNCE_AT, clock, idle, left, pause, PRESETS, spoken, start, type TimerState } from "@/lib/tools/timer";

/* The timer's state lives in localStorage, read through useSyncExternalStore: it survives a reload, stays in step
   across tabs, and the component never copies it into React state. */
const STORE = "bg-rest-timer-v1";
const PREFS = "bg-rest-prefs-v1";
type Prefs = { sound: boolean; vibrate: boolean; awake: boolean };
const DEFAULT_PREFS: Prefs = { sound: true, vibrate: true, awake: true };
const STALE_MS = 10 * 60 * 1000; // a finished rest older than this shows as a fresh timer

const listeners = new Set<() => void>();
const memory = new Map<string, string>(); // when storage is blocked
const readRaw = (key: string) => { try { return localStorage.getItem(key); } catch { return memory.get(key) ?? null; } };
function writeRaw(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { memory.set(key, value); }
  listeners.forEach((l) => l());
}
function subscribeStore(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}
function parse<T>(raw: string | null): T | null { try { return raw ? (JSON.parse(raw) as T) : null; } catch { return null; } }

/* A clock that ticks only while a timer runs. Handlers refresh it before they write, so a render never sees a stale time. */
const nowMs = () => Date.now();
let tick = typeof window === "undefined" ? 0 : nowMs();
let interval: ReturnType<typeof setInterval> | null = null;
const clockListeners = new Set<() => void>();
function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  tick = nowMs();
  interval ??= setInterval(() => { tick = nowMs(); clockListeners.forEach((l) => l()); }, 250);
  const wake = () => { tick = nowMs(); cb(); };
  document.addEventListener("visibilitychange", wake);
  return () => {
    clockListeners.delete(cb);
    document.removeEventListener("visibilitychange", wake);
    if (!clockListeners.size && interval) { clearInterval(interval); interval = null; }
  };
}
const noSubscribe = () => () => {};
const getTick = () => tick;
const save = (s: TimerState) => { tick = nowMs(); writeRaw(STORE, JSON.stringify(s)); };
const setTitle = (t: string) => { document.title = t; };

/** Three short tones, made on the spot: no audio files to download. */
function beep(ctx: AudioContext) {
  const t0 = ctx.currentTime + 0.05;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, t0 + i * 0.28);
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.28 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.28 + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + i * 0.28);
    osc.stop(t0 + i * 0.28 + 0.2);
  }
}
type WakeLockHandle = { release: () => Promise<void> };

export function TimerTool({ initialSeconds, autostart }: { initialSeconds: number; autostart: boolean }) {
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const saved = parse<TimerState>(useSyncExternalStore(subscribeStore, () => readRaw(STORE), () => null));
  const prefs: Prefs = { ...DEFAULT_PREFS, ...parse<Partial<Prefs>>(useSyncExternalStore(subscribeStore, () => readRaw(PREFS), () => null)) };
  const stored = saved && typeof saved.duration === "number" ? saved : null;
  const running = stored?.endsAt != null;
  const now = useSyncExternalStore(running ? subscribeClock : noSubscribe, getTick, () => 0);
  const ended = running && now >= stored!.endsAt!;
  const stale = ended && now - stored!.endsAt! > STALE_MS;
  const state = stored && !stale ? stored : idle(stored?.duration ?? initialSeconds);
  const finished = ended && !stale;
  const counting = running && !finished && !stale;
  const secondsLeft = finished ? 0 : left(state, now);
  const total = state.duration;

  const audio = useRef<AudioContext | null>(null);
  const lock = useRef<WakeLockHandle | null>(null);
  const firedFor = useRef<number | null>(null);
  const baseTitle = useRef("");

  // The tab title shows the countdown, so a glance at the tab bar is enough.
  useEffect(() => {
    if (!baseTitle.current) baseTitle.current = document.title;
    if (counting) setTitle(`${clock(secondsLeft)} rest · Blackglass`);
    else if (finished) setTitle("Rest’s over · Blackglass");
    else setTitle(baseTitle.current);
  }, [counting, finished, secondsLeft]);
  useEffect(() => () => { if (baseTitle.current) setTitle(baseTitle.current); }, []);

  // The end of a rest: sound and vibration, once per rest.
  useEffect(() => {
    if (!finished || !stored?.endsAt || firedFor.current === stored.endsAt) return;
    firedFor.current = stored.endsAt;
    if (prefs.sound && audio.current) { try { beep(audio.current); } catch { /* no audio */ } }
    if (prefs.vibrate) navigator.vibrate?.([300, 150, 300]);
  }, [finished, stored?.endsAt, prefs.sound, prefs.vibrate]);

  // Keep the screen on while counting, where the browser allows it.
  useEffect(() => {
    if (!counting || !prefs.awake || !("wakeLock" in navigator)) return;
    let cancelled = false;
    const take = () => {
      if (cancelled || lock.current || document.visibilityState !== "visible") return;
      (navigator as Navigator & { wakeLock: { request: (t: "screen") => Promise<WakeLockHandle> } }).wakeLock
        .request("screen").then((l) => { if (cancelled) l.release().catch(() => {}); else lock.current = l; }).catch(() => {});
    };
    const again = () => { lock.current = null; take(); };
    take();
    document.addEventListener("visibilitychange", again);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", again);
      lock.current?.release().catch(() => {});
      lock.current = null;
    };
  }, [counting, prefs.awake]);

  const unlockAudio = () => {
    if (!prefs.sound) return;
    try {
      audio.current ??= new AudioContext();
      if (audio.current.state === "suspended") audio.current.resume();
    } catch { audio.current = null; }
  };
  const go = (base: TimerState) => { unlockAudio(); save(start(base, nowMs())); };
  const toggle = () => (counting ? save(pause(state, nowMs())) : go(finished ? idle(total) : state));
  const reset = () => save(idle(total));
  const nudge = (delta: number) => save(adjust(finished ? idle(total) : state, delta, nowMs()));
  const setPref = (patch: Partial<Prefs>) => writeRaw(PREFS, JSON.stringify({ ...prefs, ...patch }));

  // Announced as the rest crosses 1 minute, 30 and 10 seconds, and at the end; never on every tick.
  const crossed = [...ANNOUNCE_AT].filter((t) => t > 0 && t <= total && t >= secondsLeft).sort((a, b) => a - b)[0];
  const said = !hydrated ? "" : finished ? "Rest’s over. Time for your set."
    : counting && crossed !== undefined ? `${spoken(crossed)} left` : state.pausedLeft !== null ? "Paused" : "";
  const status = finished ? "Rest’s over" : counting ? "Resting" : state.pausedLeft !== null ? "Paused" : "Ready";
  const pct = total ? Math.min(100, (secondsLeft / Math.max(total, secondsLeft)) * 100) : 0;
  const mainLabel = counting ? "Pause" : finished ? "Again" : state.pausedLeft !== null ? "Resume" : "Start";
  const canVibrate = hydrated && typeof navigator.vibrate === "function";
  const canWake = hydrated && "wakeLock" in navigator;

  return (
    <div className="tool-grid">
      <div className="tool-form">
        <p className="label" id="timer-presets-label">Rest for</p>
        <ul className="timer-presets" aria-labelledby="timer-presets-label" style={{ marginTop: 12 }}>
          {PRESETS.map((p) => (
            <li key={p}>
              <a href={`/tools/rest-timer?s=${p}`} aria-current={p === total ? "true" : undefined} aria-label={`Rest ${spoken(p)}`}
                onClick={(e) => { e.preventDefault(); go(idle(p)); }}>{clock(p)}</a>
            </li>
          ))}
        </ul>
        {hydrated && (
          <div className="timer-prefs" style={{ marginTop: 20 }}>
            <label className="tool-check"><input type="checkbox" checked={prefs.sound} onChange={(e) => setPref({ sound: e.target.checked })} /> Sound at the end</label>
            {canVibrate && <label className="tool-check"><input type="checkbox" checked={prefs.vibrate} onChange={(e) => setPref({ vibrate: e.target.checked })} /> Vibrate</label>}
            {canWake && <label className="tool-check"><input type="checkbox" checked={prefs.awake} onChange={(e) => setPref({ awake: e.target.checked })} /> Keep the screen on</label>}
          </div>
        )}
        <noscript>
          <p className="tool-note">Without JavaScript, choosing a time starts a simple seconds countdown. Choose it again to restart.</p>
        </noscript>
      </div>

      <section className="tool-result" aria-labelledby="timer-status">
        <h2 id="timer-status" className="label tool-kicker">{hydrated ? status : "Rest timer"}</h2>
        <div className="timer" data-state={finished ? "done" : counting ? "running" : "idle"}>
          {hydrated ? (
            <>
              <p className="timer-clock" role="timer" aria-label={`${spoken(secondsLeft)} left`}>{clock(secondsLeft)}</p>
              <div className="timer-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
              <div className="timer-row">
                <button className="btn btn-primary" type="button" onClick={toggle}><span>{mainLabel}</span></button>
                <button className="btn btn-ghost" type="button" onClick={reset}><span>Reset</span></button>
              </div>
              <div className="timer-row">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => nudge(-15)} aria-label="15 seconds less"><span>−15 s</span></button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => nudge(15)} aria-label="15 seconds more"><span>+15 s</span></button>
              </div>
            </>
          ) : autostart ? (
            <noscript>
              <p className="timer-css" role="timer" aria-label={`Counting down from ${spoken(initialSeconds)}`}
                style={{ ["--tool-from" as string]: initialSeconds, ["--tool-seconds" as string]: `${initialSeconds}s` }} />
              <p className="tool-sub">seconds left</p>
            </noscript>
          ) : (
            <p className="timer-clock">{clock(initialSeconds)}</p>
          )}
        </div>
        <p className="vh" aria-live="polite">{said}</p>
      </section>
    </div>
  );
}
