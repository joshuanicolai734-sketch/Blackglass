"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { movementPhase, movements } from "@/content/movements";
import { atPosition, isSeekable, SETTLED, targetTime } from "@/lib/seekable";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const views = ["Angled", "Front"] as const;
const viewFile = (view: number) => view === 0 ? "angled" : "front";
/** Where each phase starts in the rep (movementPhase's boundaries); the phase track fills between them. */
/** When the visitor last acted, for the watchdog's 8 s limit. Called from event handlers only, never during render. */
const now = () => performance.now();
const PHASE_STARTS = [0, 0.12, 0.56, 0.94];

/**
 * Native video and all three studies remain usable when JavaScript is unavailable.
 *
 * Sites v34 ("seekable-range-v7"): a jump (phase, scrub, view change, exercise change) is held as a pending position.
 * The clip seeks only where the browser says it can (lib/seekable.ts). While a position is pending the frame shows
 * "Loading selected position…", and a 100 ms watchdog retries the seek every 500 ms until the frame lands. If it
 * hasn't landed 8 s after the last interaction, the watchdog stops, says so and offers Reset and the direct clip link.
 * Rebuilt on 7 November 2026 from the compiled chunk the public site served (studio/reference/sites-v34-2026-11-07/).
 */
export function MovementStudio() {
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [active, setActive] = useState(0);
  const [view, setView] = useState(0);
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState<number | null>(null); // a requested position still loading
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [announcement, announce] = useState("");
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const tabs = useRef<(HTMLAnchorElement | null)[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const pending = useRef(new Map<number, number>());
  const playVersion = useRef(0);
  const loadRequested = useRef(new WeakSet<HTMLVideoElement>());
  const lastInteraction = useRef(0);
  const engaged = useRef(false);
  const exercise = movements[active];
  const phase = movementPhase(progress);
  const shown = target ?? progress; // the scrubber and phase buttons show where the visitor asked to go
  const shownPhase = movementPhase(shown);

  const engage = () => {
    setActivated(true);
    if (engaged.current) return;
    engaged.current = true;
    (window as Window & { blackglassTrack?: (event: string) => void }).blackglassTrack?.("movement_engaged");
  };

  // Leaving the studio, backgrounding the page or enabling reduced motion pauses it.
  // Returning never starts playback: Play remains an explicit visitor action.
  useEffect(() => {
    const pause = () => { playVersion.current++; videos.current.forEach((video) => video?.pause()); };
    const visibility = () => { if (document.hidden) pause(); };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => { if (reduced.matches) pause(); };
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", preference);
    const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      if (entries.every((entry) => entry.intersectionRatio < 0.2)) pause();
    }, { threshold: 0.2 }) : null;
    if (stage.current) observer?.observe(stage.current);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
      pause();
    };
  }, []);

  // The watchdog: while loading, land the pending position, retry the seek, or give up after 8 s.
  useEffect(() => {
    if (!loading) return;
    const video = videos.current[active];
    const started = performance.now();
    let lastNudge = started - 500;
    let stopped = false;
    const timer = window.setInterval(() => {
      if (stopped || !video || videos.current[active] !== video) return;
      const wanted = pending.current.get(active);
      if (wanted === undefined ? video.readyState >= 2 && !video.seeking : atPosition(video, wanted)) {
        pending.current.delete(active);
        setTarget(null);
        setLoading(false);
        if (Number.isFinite(video.duration) && video.duration > 0) setProgress(video.currentTime / video.duration);
        return;
      }
      if (video.error || performance.now() - Math.max(started, lastInteraction.current) >= 8000) {
        playVersion.current++;
        video.pause();
        pending.current.delete(active);
        loadRequested.current.delete(video);
        setPlaying(false);
        setTarget(null);
        setLoading(false);
        if (Number.isFinite(video.duration) && video.duration > 0) setProgress(video.currentTime / video.duration);
        setError("That position couldn’t load. Try Reset, or open the clip directly below.");
        announce("Preview loading stopped. Try Reset or the direct clip link.");
        return;
      }
      const time = wanted === undefined ? null : targetTime(video.duration, wanted);
      const now = performance.now();
      if (time !== null && isSeekable(video, time) && !video.seeking && Math.abs(video.currentTime - time) > SETTLED && now - lastNudge >= 500) {
        lastNudge = now;
        try { video.currentTime = time; } catch { /* not seekable after all; the next tick retries */ }
      }
    }, 100);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [active, view, loading, target]);

  const isCurrent = (video: HTMLVideoElement, index: number) => index === active && videos.current[index] === video;

  /** Ask for the whole clip; call load() once unless it is already loading (or `force`, after an error). */
  const warm = (video: HTMLVideoElement, force = false) => {
    video.preload = "auto";
    if (force || (video.readyState === 0 && video.networkState !== HTMLMediaElement.NETWORK_LOADING && !loadRequested.current.has(video))) {
      loadRequested.current.add(video);
      video.load();
    }
  };

  const currentProgress = () => {
    const wanted = pending.current.get(active);
    if (wanted !== undefined) return wanted;
    const video = videos.current[active];
    return video && Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration : progress;
  };

  const seek = (next: number) => {
    lastInteraction.current = now();
    engage();
    playVersion.current++;
    const value = Math.min(1, Math.max(0, next));
    const video = videos.current[active];
    video?.pause();
    setPlaying(false);
    setTarget(value);
    if (!video) return;
    pending.current.set(active, value);
    const hadError = !!error;
    setError("");
    warm(video, hadError);
    if (atPosition(video, value)) {
      pending.current.delete(active);
      setProgress(value);
      setTarget(null);
      setLoading(false);
      announce(`${exercise.phases[movementPhase(value)].name}, paused.`);
      return;
    }
    setLoading(true);
    announce(`Loading ${exercise.phases[movementPhase(value)].name.toLowerCase()} position.`);
    const time = targetTime(video.duration, value);
    if (time !== null && isSeekable(video, time) && Math.abs(video.currentTime - time) > SETTLED) {
      try { video.currentTime = time; } catch { /* the watchdog retries */ }
    }
  };

  const select = (index: number, focus = false) => {
    lastInteraction.current = now();
    if (focus) tabs.current[index]?.focus();
    if (index === active) return;
    engage();
    playVersion.current++;
    videos.current.forEach((video) => video?.pause());
    pending.current.clear();
    pending.current.set(index, 0);
    const next = videos.current[index];
    if (next) {
      warm(next);
      if (isSeekable(next, 0) && Number.isFinite(next.duration) && next.currentTime > SETTLED) {
        try { next.currentTime = 0; } catch { /* the watchdog retries */ }
      }
    }
    setActive(index);
    setTarget(0);
    setProgress(0);
    setPlaying(false);
    setLoading(true);
    setError("");
    announce(`Loading ${movements[index].name}, ${views[view].toLowerCase()} view.`);
  };

  const changeView = (next: number) => {
    lastInteraction.current = now();
    if (view === next) return;
    engage();
    playVersion.current++;
    const position = currentProgress();
    videos.current[active]?.pause();
    pending.current.set(active, position);
    setTarget(position);
    setPlaying(false);
    setLoading(true);
    setError("");
    setView(next);
    announce(`Loading ${views[next].toLowerCase()} view at ${Math.round(position * 100)} percent.`);
  };

  const play = () => {
    lastInteraction.current = now();
    engage();
    const video = videos.current[active];
    if (!video) return;
    const attempt = ++playVersion.current;
    if (!video.paused) { video.pause(); return; }
    pending.current.delete(active);
    setTarget(null);
    warm(video, !!error);
    setError("");
    setLoading(video.readyState < 2 || video.seeking);
    if (Number.isFinite(video.duration) && video.duration > 0) setProgress(video.currentTime / video.duration);
    video.playbackRate = speed;
    video.play().catch((cause: unknown) => {
      // A visitor can pause, scrub or change exercise before the initial Play promise settles.
      // Those cancellations are expected, not a media failure on the next selection.
      if (attempt !== playVersion.current || (cause instanceof DOMException && cause.name === "AbortError")) return;
      setPlaying(false);
      setLoading(false);
      setError("The clip couldn’t play. Try opening it directly below.");
    });
  };

  /** Media readiness (metadata, data, can-play): land a pending position, or settle the loading state. */
  const ready = (video: HTMLVideoElement, index: number) => {
    if (!isCurrent(video, index)) return;
    loadRequested.current.delete(video);
    const expected = `/movements/${movements[index].id}-${viewFile(view)}.mp4`;
    if (video.currentSrc && new URL(video.currentSrc, window.location.href).pathname !== expected) return;
    video.playbackRate = speed;
    const wanted = pending.current.get(index);
    if (wanted !== undefined) {
      if (atPosition(video, wanted)) {
        pending.current.delete(index);
        setProgress(wanted);
        setTarget(null);
        setLoading(false);
        announce(`${views[view]} view, ${exercise.phases[movementPhase(wanted)].name.toLowerCase()}, ${video.paused ? "paused" : "playing"}.`);
        return;
      }
      setLoading(true);
      return;
    }
    setLoading(activated && video.readyState < 2);
  };

  const seeked = (video: HTMLVideoElement, index: number) => {
    if (!isCurrent(video, index)) return;
    const wanted = pending.current.get(index);
    if (wanted !== undefined && atPosition(video, wanted)) {
      pending.current.delete(index);
      setProgress(wanted);
      setTarget(null);
      setLoading(false);
      announce(`${views[view]} view, ${exercise.phases[movementPhase(wanted)].name.toLowerCase()}, ${video.paused ? "paused" : "playing"}.`);
    } else {
      ready(video, index);
    }
  };

  return (
    <div className="ms-studio" data-media-recovery="seekable-range-v7" data-enhanced={enhanced ? "" : undefined} data-playing={playing ? "" : undefined} ref={stage}>
      <nav className="ms-exercises" aria-label="Choose a movement" role={enhanced ? "tablist" : undefined}>
        {movements.map((movement, index) => (
          <a key={movement.id} href={`#${movement.id}`} id={`ms-tab-${movement.id}`} ref={(node) => { tabs.current[index] = node; }}
            role={enhanced ? "tab" : undefined} aria-controls={enhanced ? movement.id : undefined}
            aria-selected={enhanced ? active === index : undefined} tabIndex={enhanced && index !== active ? -1 : 0}
            data-selected={active === index ? "" : undefined}
            onClick={(event) => { if (enhanced) { event.preventDefault(); select(index); } }}
            onKeyDown={(event) => {
              if (!enhanced) return;
              const last = movements.length - 1;
              const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % movements.length
                : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index + last) % movements.length
                : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
              if (next >= 0) { event.preventDefault(); select(next, true); }
            }}>
            <span className="label">0{index + 1} / {movement.pattern}</span>
            <span className="title">{movement.name}</span>
          </a>
        ))}
      </nav>

      <div className="ms-panels">
        {movements.map((movement, index) => (
          <article key={movement.id} id={movement.id} className="ms-panel" data-inactive={active === index ? undefined : ""}
            role={enhanced ? "tabpanel" : undefined} aria-labelledby={enhanced ? `ms-tab-${movement.id}` : `ms-title-${movement.id}`}>
            <div className="ms-player">
              <div className="ms-player-head">
                <span className="label">{views[view]} view</span>
                <div className="ms-views" role="group" aria-label="Camera view">
                  {views.map((name, camera) => <button key={name} type="button" aria-pressed={view === camera} onClick={() => changeView(camera)}>{name}</button>)}
                </div>
              </div>
              <figure className="ms-frame" aria-busy={index === active && loading} data-loading={index === active && loading ? "" : undefined}>
                {/* Keyed by view, so a view change mounts a fresh element rather than swapping src under a pending seek. */}
                <video key={`${movement.id}-${viewFile(view)}`} ref={(node) => { videos.current[index] = node; }}
                  src={`/movements/${movement.id}-${viewFile(view)}.mp4`}
                  poster={`/movements/${movement.id}-${viewFile(view)}.webp`}
                  width="768" height="588" preload={index === active ? (activated ? "auto" : "metadata") : "none"}
                  controls={!enhanced} muted loop playsInline tabIndex={enhanced ? -1 : 0}
                  aria-label={`${movement.name}, ${views[view].toLowerCase()} view movement preview`}
                  aria-describedby={`ms-summary-${movement.id}`}
                  onLoadedMetadata={(event) => ready(event.currentTarget, index)}
                  onLoadedData={(event) => ready(event.currentTarget, index)}
                  onCanPlay={(event) => ready(event.currentTarget, index)}
                  onSeeked={(event) => seeked(event.currentTarget, index)}
                  onPlay={(event) => { if (isCurrent(event.currentTarget, index)) setPlaying(true); }}
                  onPause={(event) => { if (isCurrent(event.currentTarget, index)) setPlaying(false); }}
                  onPlaying={(event) => { if (isCurrent(event.currentTarget, index) && !pending.current.has(index)) setLoading(false); }}
                  onTimeUpdate={(event) => {
                    const video = event.currentTarget;
                    if (isCurrent(video, index) && !pending.current.has(index) && !video.seeking && !loading && Number.isFinite(video.duration) && video.duration > 0) setProgress(video.currentTime / video.duration);
                  }}
                  onError={(event) => {
                    if (!isCurrent(event.currentTarget, index)) return;
                    pending.current.delete(index);
                    loadRequested.current.delete(event.currentTarget);
                    setTarget(null);
                    setPlaying(false);
                    setLoading(false);
                    setError("The clip couldn’t load. The still and movement notes are available; try the direct clip link.");
                  }}>
                  Your browser does not support video. The movement notes and direct clip link are below.
                </video>
                <div className="ms-loading-notice" aria-hidden="true">Loading selected position…</div>
                <div className="ms-frame-caption" aria-hidden="true">
                  <span>{movement.name}</span>
                  <span>{index === active && error ? "Preview unavailable" : index === active && loading ? "Updating position…" : `0${phase + 1} / ${exercise.phases[phase].name}`}</span>
                </div>
              </figure>
              <div className="ms-phase-track" aria-hidden="true">
                {movement.phases.map((part, step) => (
                  <span key={part.name} data-current={step === phase ? "" : undefined}>
                    <i style={{ transform: `scaleX(${progress >= 0.94 ? Number(step === 0) : Math.max(0, Math.min(1, (progress - PHASE_STARTS[step]) / (PHASE_STARTS[step + 1] - PHASE_STARTS[step])))})` }} />
                    <b>0{step + 1}</b>{part.name}
                  </span>
                ))}
              </div>
              <div className="ms-transport">
                <div className="ms-play-row">
                  <button className="ms-play" type="button" onClick={play} aria-label={`${playing ? "Pause" : "Play"} ${exercise.name.toLowerCase()}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">{playing
                      ? <path d="M4 2v10M10 2v10" stroke="currentColor" strokeWidth="3" />
                      : <path d="m3 1 9 6-9 6Z" fill="currentColor" />}</svg>
                    {playing ? "Pause" : "Play"}
                  </button>
                  <button type="button" onClick={() => seek(0)} aria-label="Reset movement to the start">Reset</button>
                  <button type="button" aria-pressed={speed === 0.5} onClick={() => {
                    engage(); const next = speed === 1 ? 0.5 : 1; setSpeed(next);
                    if (videos.current[active]) videos.current[active]!.playbackRate = next;
                    announce(next === 0.5 ? "Half-speed playback." : "Normal-speed playback.");
                  }} aria-label="Half-speed playback">0.5×</button>
                  <span className="label ms-state">{loading ? "Loading" : playing ? "Playing" : "Paused"}</span>
                </div>
                <div className="ms-scrub">
                  <label className="label" htmlFor={`ms-scrub-${movement.id}`}>Rep position</label>
                  <input id={`ms-scrub-${movement.id}`} type="range" min="0" max="100" step="1" value={Math.round(shown * 100)}
                    aria-valuetext={`${Math.round(shown * 100)} percent, ${exercise.phases[shownPhase].name}${loading ? ", loading" : ""}`}
                    onFocus={() => { playVersion.current++; videos.current[active]?.pause(); }} onChange={(event) => seek(Number(event.currentTarget.value) / 100)} />
                  <span className="label" aria-hidden="true">{Math.round(shown * 100)}%</span>
                </div>
              </div>
              <p className="ms-fallback" data-media-error={error ? "" : undefined}><a className="inline-link" href={`/movements/${movement.id}-${viewFile(view)}.mp4`}>Open the {views[view].toLowerCase()} clip</a>{view === 0 && <a className="inline-link" href={`/movements/${movement.id}-front.mp4`}>Open the front-view clip</a>}</p>
              {error && index === active && <p className="ms-error" role="alert">{error}</p>}
            </div>

            <div className="ms-notes">
              <p className="label">{movement.pattern} / {movement.equipment}</p>
              <h2 id={`ms-title-${movement.id}`} className="display">{movement.name}</h2>
              <p id={`ms-summary-${movement.id}`} className="body-2">{movement.summary}</p>
              <ol className="ms-phases" aria-label={`${movement.name} movement phases`}>
                {movement.phases.map((part, step) => <li key={part.name} data-active={index === active && step === shownPhase ? "" : undefined}>
                  <span className="ms-static-phase label">0{step + 1} {part.name}</span>
                  <button type="button" aria-pressed={step === shownPhase} onClick={() => seek(part.at)}><span className="label">0{step + 1}</span><span>{part.name}</span><span aria-hidden="true">↗</span></button>
                  <p>{part.text}</p>
                </li>)}
              </ol>
            </div>
          </article>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}
