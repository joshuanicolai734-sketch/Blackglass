"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const chapters = ["Load", "Drive", "Lock in"];
const subscribe = () => () => {};

/** An authored nine-second type film. The DOM poster is complete before hydration. */
export function MotionPoster() {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const host = useRef<HTMLElement>(null);
  const engine = useRef<{ toggle: () => void; seek: (time: number) => void } | null>(null);
  const [paused, setPaused] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-motion-word]"));
    const rails = Array.from(el.querySelectorAll<HTMLElement>("[data-motion-rail]"));
    const ring = el.querySelector<HTMLElement>(".mp-ring")!;
    const fill = el.querySelector<HTMLElement>(".mp-progress i")!;
    let time = 0, last = 0, frame = 0, inView = false, userPaused = false, destroyed = false, pageActive = true, on = 0;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const ease = (v: number) => 1 - Math.pow(1 - clamp(v), 4);

    // Pure time sampling: controlled load, fast drive, long still lockout. No random motion or flashing.
    const draw = (value: number) => {
      time = ((value % 9) + 9) % 9;
      const next = Math.floor(time / 3), local = time % 3;
      const enter = media.matches ? 1 : ease(local / 0.65);
      const exit = media.matches ? 0 : ease((local - 2.6) / 0.4);
      words.forEach((word, index) => {
        const visible = index === next;
        word.style.opacity = visible ? "1" : "0";
        word.style.transform = `translate3d(${visible ? (1 - enter) * -18 + exit * 12 : 0}%,0,0)`;
      });
      const load = next === 0 ? ease(local / 2.3) : 1;
      const drive = next === 1 ? ease(local / 0.75) : next === 2 ? 1 : 0;
      rails.forEach((rail, index) => {
        const offset = media.matches ? 0 : (1 - load) * (16 + index * 7) - drive * (index - 1) * 10;
        rail.style.transform = `translate3d(${offset}%,${-offset}%,0)`;
      });
      ring.style.transform = media.matches ? "none" : `translate3d(${drive * -7}%,${drive * 7}%,0) rotate(${load * 35 + drive * 55}deg)`;
      fill.style.transform = `scaleX(${time / 9})`;
      if (next !== on) { on = next; setChapter(next); }
    };
    const running = () => !destroyed && pageActive && !userPaused && !media.matches && inView && !document.hidden;
    const tick = (stamp: number) => {
      // Some engines deliver MediaQueryList events after the next paint. Latch the preference in
      // the frame loop too, so a fast preference toggle cannot restart a film the visitor stopped.
      if (media.matches && !userPaused) { userPaused = true; setPaused(true); setReduced(true); draw(6.8); }
      if (!running()) { frame = 0; last = 0; return; }
      // Resume exactly where interrupted; discard long task gaps rather than leaping chapters.
      if (last) draw(time + Math.min((stamp - last) / 1000, 0.08));
      last = stamp;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (!running()) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else if (!frame) frame = requestAnimationFrame(tick);
    };
    const preference = () => {
      setReduced(media.matches);
      if (media.matches) { userPaused = true; setPaused(true); draw(6.8); }
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.intersectionRatio >= 0.3; sync(); }, { threshold: [0, 0.3] });
    observer.observe(el);
    const leave = () => { pageActive = false; cancelAnimationFrame(frame); frame = 0; last = 0; };
    const returnToPage = () => { pageActive = true; sync(); };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", returnToPage);
    media.addEventListener("change", preference);
    engine.current = {
      toggle: () => { userPaused = !userPaused; setPaused(userPaused); sync(); },
      seek: (value) => { userPaused = true; setPaused(true); draw(value); sync(); },
    };
    // A read-only capture surface for deterministic film frames and lifecycle verification.
    const capture = { duration: 9, seek: engine.current.seek, state: () => ({ time, running: running(), reduced: media.matches }) };
    const target = window as Window & { blackglassMotion?: typeof capture };
    target.blackglassMotion = capture;
    preference();
    return () => {
      destroyed = true; leave(); observer.disconnect(); engine.current = null;
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", returnToPage);
      media.removeEventListener("change", preference);
      if (target.blackglassMotion === capture) delete target.blackglassMotion;
    };
  }, []);

  return (
    <figure className="motion-poster" ref={host} data-motion-poster>
      <div className="mp-top"><span className="label">Blackglass / In motion</span><span className="label">09 s</span></div>
      <div className="mp-art" aria-hidden="true">
        <div className="mp-ring" />
        <div className="mp-rails">{[0, 1, 2].map((i) => <i key={i} data-motion-rail />)}</div>
        <span className="mp-edition label">Intent becomes action.</span>
        <div className="mp-type">
          <div className="mp-word-window">{["Load.", "Drive.", "Lock in."].map((word, i) => <span key={word} data-motion-word style={{ opacity: i === 0 ? 1 : 0 }}>{word}</span>)}</div>
          <span className="mp-outline">Train with</span><span>intent.</span>
        </div>
        <span className="mp-sign label">Dunedin, New Zealand</span>
        <span className="mp-index">BG/01</span>
      </div>
      <figcaption className="sr-only">Blackglass brand film. Load, drive, lock in. Train with intent.</figcaption>
      <div className="mp-controls" hidden={!enhanced}>
        <div className="mp-chapters" role="group" aria-label="Brand film chapters">
          {chapters.map((name, i) => <button key={name} type="button" aria-pressed={chapter === i} onClick={() => engine.current?.seek(i * 3 + 0.8)}><span>0{i + 1}</span>{name}</button>)}
        </div>
        <button className="mp-toggle" type="button" disabled={reduced} onClick={() => engine.current?.toggle()} aria-label={reduced ? "Brand film uses reduced motion" : `${paused ? "Play" : "Pause"} brand film`}>{reduced ? "Still" : paused ? "Play" : "Pause"}</button>
      </div>
      <div className="mp-progress" aria-hidden="true"><i /></div>
    </figure>
  );
}
