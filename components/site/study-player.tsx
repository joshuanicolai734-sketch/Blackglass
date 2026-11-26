"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A rendered movement study with native controls (Sites v34). It never autoplays: it plays only when the visitor
 * presses Play or Replay, pauses when it leaves the screen, its demo panel closes, the tab hides or reduced motion
 * turns on, and only one study plays at a time. Half speed and Repeat are offered; a failed load says what's left.
 *
 * Rebuilt on 7 November 2026 from the compiled chunk the public site served (studio/reference/sites-v34-2026-11-07/).
 */
const STUDIES = {
  "home-curl": {
    label: "Rendered simultaneous supinated dumbbell curl",
    base: "/movements/curl-study/three-quarter",
    width: 384,
    height: 432,
    seconds: 5,
    description: "Controlled lift, brief hold and a slower return. This is rendered movement artwork; qualified technique review is pending.",
  },
};

export function StudyPlayer({ variant = "home-curl", compact = false }: { variant?: keyof typeof STUDIES; compact?: boolean }) {
  const study = STUDIES[variant];
  const { label, width, height, seconds, description } = study;
  const src = `${study.base}-${seconds}s.mp4`;
  const poster = `${study.base}-setup.png`;
  const descriptionId = `${variant}-description`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState("1");
  const [repeat, setRepeat] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onVisibility = () => {
      if (document.hidden) video.pause();
    };
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) video.pause();
          })
        : null;
    io?.observe(video);
    const panel = video.closest("[data-demo-panel]");
    const mo = panel
      ? new MutationObserver(() => {
          if (panel.hasAttribute("data-inactive")) video.pause();
        })
      : null;
    if (panel && mo) mo.observe(panel, { attributes: true, attributeFilter: ["data-inactive"] });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (reducedMotion.matches) video.pause();
    };
    reducedMotion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io?.disconnect();
      mo?.disconnect();
      reducedMotion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
    };
  }, []);

  return (
    <div className="home-study-player">
      <video
        ref={videoRef}
        controls
        playsInline
        muted
        loop={repeat}
        preload={compact ? "none" : "metadata"}
        data-blackglass-study
        width={width}
        height={height}
        poster={poster}
        aria-label={`${label}: development demonstration, one ${seconds}-second repetition`}
        aria-describedby={descriptionId}
        onPlay={(event) => {
          const video = event.currentTarget;
          if (video.closest("[data-demo-panel]")?.hasAttribute("data-inactive")) {
            video.pause();
            return;
          }
          document.querySelectorAll<HTMLVideoElement>("video[data-blackglass-study]").forEach((other) => {
            if (other !== video) other.pause();
          });
        }}
        onLoadedMetadata={(event) => {
          event.currentTarget.playbackRate = Number(speed);
        }}
        onPlaying={() => setMessage("")}
        onError={() =>
          setMessage(
            compact
              ? "The movement could not load. The starting position remains shown; try Replay or reload this page."
              : "The movement could not load. Use the still views below, or download the study.",
          )
        }
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="home-study-controls">
        <button
          type="button"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            try {
              if (video.error) video.load();
              video.currentTime = 0;
              video.play().catch(() => setMessage("Press Play on the video to start the movement."));
            } catch {
              setMessage("The movement is not ready. Try Play again when it has loaded.");
            }
          }}
        >
          Replay
        </button>
        <label>
          Speed
          <select
            value={speed}
            onChange={(event) => {
              setSpeed(event.target.value);
              if (videoRef.current) videoRef.current.playbackRate = Number(event.target.value);
            }}
          >
            <option value="1">Normal</option>
            <option value="0.5">Half speed</option>
          </select>
        </label>
        <label className="home-study-repeat">
          <input type="checkbox" checked={repeat} onChange={(event) => setRepeat(event.target.checked)} />
          Repeat
        </label>
      </div>
      {message && <p role="status">{message}</p>}
      <p id={descriptionId} className="home-study-note">
        {description}
        {!compact && " Playback starts only when you choose it and pauses off-screen."}
      </p>
      {!compact && (
        <a className="link" href={src} download>
          Download {label.toLowerCase()} study
        </a>
      )}
    </div>
  );
}
