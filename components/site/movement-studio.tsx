"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { movementPhase, movements } from "@/content/movements";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const views = ["Angled", "Front"] as const;
const viewFile = (view: number) => view === 0 ? "angled" : "front";

/** Native video and all three studies remain usable when JavaScript is unavailable. */
export function MovementStudio() {
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [active, setActive] = useState(0);
  const [view, setView] = useState(0);
  const [progress, setProgress] = useState(0);
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
  const engaged = useRef(false);
  const exercise = movements[active];
  const phase = movementPhase(progress);

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

  const currentProgress = () => {
    const video = videos.current[active];
    return video && Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration : progress;
  };

  const seek = (next: number) => {
    engage();
    playVersion.current++;
    const value = Math.min(1, Math.max(0, next));
    const video = videos.current[active];
    video?.pause();
    setPlaying(false);
    setProgress(value);
    if (!video) return;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(video.duration - 0.001, value * video.duration);
    } else {
      pending.current.set(active, value);
      setLoading(true);
      video.preload = "auto";
      if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
    }
  };

  const select = (index: number, focus = false) => {
    if (focus) tabs.current[index]?.focus();
    if (index === active) return;
    engage();
    playVersion.current++;
    videos.current.forEach((video) => video?.pause());
    pending.current.clear();
    pending.current.set(index, 0);
    const next = videos.current[index];
    if (next && Number.isFinite(next.duration)) {
      next.currentTime = 0;
      pending.current.delete(index);
    }
    setActive(index);
    setProgress(0);
    setPlaying(false);
    setLoading(false);
    setError("");
    announce(`${movements[index].name} selected. ${views[view]} view, paused at Brace.`);
  };

  const changeView = (next: number) => {
    if (view === next) return;
    engage();
    playVersion.current++;
    const position = currentProgress();
    videos.current[active]?.pause();
    pending.current.set(active, position);
    setProgress(position);
    setPlaying(false);
    setLoading(true);
    setError("");
    setView(next);
    announce(`${views[next]} view. Paused at ${Math.round(position * 100)} percent; your place is kept.`);
  };

  const play = () => {
    engage();
    const video = videos.current[active];
    if (!video) return;
    const attempt = ++playVersion.current;
    if (!video.paused) { video.pause(); return; }
    if (error) video.load();
    setError("");
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

  const loaded = (video: HTMLVideoElement, index: number) => {
    if (index !== active) return;
    video.playbackRate = speed;
    const position = pending.current.get(index);
    if (position !== undefined) {
      video.currentTime = Math.min(video.duration - 0.001, position * video.duration);
      pending.current.delete(index);
      setProgress(position);
    }
    setLoading(false);
  };

  return (
    <div className="ms-studio" data-enhanced={enhanced ? "" : undefined} ref={stage}>
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
          <article key={movement.id} id={movement.id} className="ms-panel" data-inactive={active !== index ? "" : undefined}
            role={enhanced ? "tabpanel" : undefined} aria-labelledby={enhanced ? `ms-tab-${movement.id}` : `ms-title-${movement.id}`}>
            <div className="ms-player">
              <div className="ms-player-head">
                <span className="label">{views[view]} view</span>
                <div className="ms-views" role="group" aria-label="Camera view">
                  {views.map((name, camera) => <button key={name} type="button" aria-pressed={view === camera} onClick={() => changeView(camera)}>{name}</button>)}
                </div>
              </div>
              <figure className="ms-frame">
                <video ref={(node) => { videos.current[index] = node; }}
                  src={`/movements/${movement.id}-${viewFile(view)}.mp4`}
                  poster={`/movements/${movement.id}-${viewFile(view)}.webp`}
                  width="768" height="588" preload={activated && index === active ? "auto" : "none"}
                  controls={!enhanced} muted loop playsInline tabIndex={enhanced ? -1 : 0}
                  aria-label={`${movement.name}, ${views[view].toLowerCase()} view movement preview`}
                  aria-describedby={`ms-summary-${movement.id}`}
                  onLoadedMetadata={(event) => loaded(event.currentTarget, index)}
                  onPlay={() => { if (index === active) setPlaying(true); }}
                  onPause={() => { if (index === active) setPlaying(false); }}
                  onTimeUpdate={(event) => {
                    const video = event.currentTarget;
                    if (index === active && !loading && Number.isFinite(video.duration) && video.duration > 0) setProgress(video.currentTime / video.duration);
                  }}
                  onError={() => {
                    if (index !== active) return;
                    setPlaying(false); setLoading(false);
                    setError("The clip couldn’t load. The still and movement notes are available; try the direct clip link.");
                  }}>
                  Your browser does not support video. The movement notes and direct clip link are below.
                </video>
              </figure>
              <div className="ms-transport">
                <div className="ms-play-row">
                  <button className="ms-play" type="button" onClick={play} aria-label={`${playing ? "Pause" : "Play"} ${exercise.name.toLowerCase()}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">{playing
                      ? <path d="M4 2v10M10 2v10" stroke="currentColor" strokeWidth="3" />
                      : <path d="m3 1 9 6-9 6Z" fill="currentColor" />}</svg>
                    {playing ? "Pause" : "Play"}
                  </button>
                  <button type="button" onClick={() => { seek(0); announce("Reset to Brace, paused."); }} aria-label="Reset movement to the start">Reset</button>
                  <button type="button" aria-pressed={speed === 0.5} onClick={() => {
                    engage(); const next = speed === 1 ? 0.5 : 1; setSpeed(next);
                    if (videos.current[active]) videos.current[active]!.playbackRate = next;
                    announce(next === 0.5 ? "Half-speed playback." : "Normal-speed playback.");
                  }} aria-label="Half-speed playback">0.5×</button>
                  <span className="label ms-state">{loading ? "Loading" : playing ? "Playing" : "Paused"}</span>
                </div>
                <div className="ms-scrub">
                  <label className="label" htmlFor={`ms-scrub-${movement.id}`}>Rep position</label>
                  <input id={`ms-scrub-${movement.id}`} type="range" min="0" max="100" step="1" value={Math.round(progress * 100)}
                    aria-valuetext={`${Math.round(progress * 100)} percent, ${exercise.phases[phase].name}`}
                    onFocus={() => { playVersion.current++; videos.current[active]?.pause(); }} onChange={(event) => seek(Number(event.currentTarget.value) / 100)} />
                  <span className="label" aria-hidden="true">{Math.round(progress * 100)}%</span>
                </div>
              </div>
              <p className="ms-fallback" data-media-error={error ? "" : undefined}><a className="inline-link" href={`/movements/${movement.id}-${viewFile(view)}.mp4`}>Open the {views[view].toLowerCase()} clip</a>{view === 0 && <><span aria-hidden="true"> / </span><a className="inline-link" href={`/movements/${movement.id}-front.mp4`}>Open the front-view clip</a></>}</p>
              {error && index === active && <p className="ms-error" role="alert">{error}</p>}
            </div>

            <div className="ms-notes">
              <p className="label">{movement.pattern} / {movement.equipment}</p>
              <h2 id={`ms-title-${movement.id}`} className="display">{movement.name}</h2>
              <p id={`ms-summary-${movement.id}`} className="body-2">{movement.summary}</p>
              <ol className="ms-phases" aria-label={`${movement.name} movement phases`}>
                {movement.phases.map((part, step) => <li key={part.name} data-active={index === active && step === phase ? "" : undefined}>
                  <span className="ms-static-phase label">0{step + 1} {part.name}</span>
                  <button type="button" aria-pressed={step === phase} onClick={() => {
                    seek(part.at); announce(`${part.name}, paused. ${part.text}`);
                  }}><span className="label">0{step + 1}</span><span>{part.name}</span><span aria-hidden="true">↗</span></button>
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
