"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./force-opening.css";
import { FORCE_PHASES, ForceTimeline, forceFrame, receiptAnchors } from "./force-model";

/**
 * The home page's opening (Sites v34): a plane is loaded, pressed three times and settles into an illustrative set
 * record, "One session. Then the next." The markup is static HTML: the record is complete and readable before
 * hydration and without JavaScript. The controller below only animates it.
 *
 * Motion rules: autoplays once, when 30% of the stage is visible, unless reduced motion or Save-Data asks for stills.
 * Visible play, pause, chapter and scrub controls; Escape pauses; any pointer or focus inside pauses; a hidden tab,
 * the brand intro, page hide or scrolling it offscreen holds it. Scrolling past 24px before it plays shows the result.
 *
 * Rebuilt on 7 November 2026 from the compiled chunk the public site served (studio/reference/sites-v34-2026-11-07/):
 * the markup is byte-for-byte; the controller has new names and the same behaviour.
 */

type Connection = EventTarget & { saveData?: boolean };
type Demo = {
  play: () => void;
  pause: (message?: string) => void;
  seek: (progress: number) => void;
  finish: () => void;
  getState: () => { progress: number; running: boolean; layout: string; blockers: string[] };
  destroy: () => void;
};

const PARTS = [
  "block", "depth", "edge", "shadow", "highlight", "paper", "receipt", "typography", "first", "second", "count",
  "play", "play-label", "finish", "scrubber", "time", "mode-label", "status",
] as const;

function mountForceDemo(element: HTMLElement | null): Demo | null {
  if (!element || element.hasAttribute("data-ready")) return null;
  const root = element;
  const $ = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const art = $("[data-force-art]");
  const stage = $("[data-stage]");
  if (!art || !stage || !globalThis.requestAnimationFrame) return null;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = matchMedia("(max-width: 700px)");
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const timeline = new ForceTimeline({ layout: narrow.matches ? "mobile" : "desktop" });
  const el = Object.fromEntries(PARTS.map((name) => [name, $(`[data-${name}]`)])) as Record<(typeof PARTS)[number], HTMLElement | null>;
  const scrubber = el.scrubber as HTMLInputElement;
  const play = el.play as HTMLButtonElement;
  const phaseButtons = [...root.querySelectorAll("[data-phase-button]")];
  const productOpening = root.hasAttribute("data-product-opening");
  const cleanups: (() => void)[] = [];
  let frame = 0;
  let lastTime: number | null = null;
  let destroyed = false;
  let started = false; // autoplay has had its one chance (or a scroll showed the result first)
  let shownPhase = -1;
  let shownLayout = "";
  let shownMode = "";
  let shownStatus = "";
  let handoffState = "pending";
  let stills = reducedMotion.matches || !!connection?.saveData;

  const setHandoff = (state: string) => {
    handoffState = state;
    root.dataset.handoffState = state;
  };
  const listen = (target: EventTarget, type: string, handler: (event: Event) => void, options?: AddEventListenerOptions) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const setAttr = (node: Element | null, name: string, value: unknown) => {
    if (node) node.setAttribute(name, String(value));
  };
  const setText = (node: Element | null, text: string) => {
    if (node && node.textContent !== text) node.textContent = text;
  };
  const announce = (message: string) => {
    if (message === shownStatus) return;
    setText(el.status, message);
    shownStatus = message;
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
  };

  function render() {
    const f = forceFrame(timeline.progress, timeline.layout);
    setAttr(el.block, "transform", f.transform);
    setAttr(el.depth, "opacity", f.depth);
    setAttr(el.highlight, "opacity", f.highlight);
    setAttr(el.shadow, "cx", f.shadow.x);
    setAttr(el.shadow, "cy", f.shadow.y);
    setAttr(el.shadow, "rx", f.shadow.rx);
    setAttr(el.shadow, "ry", f.shadow.ry);
    setAttr(el.shadow, "opacity", f.shadow.opacity);
    setAttr(el.paper, "y", f.paperY);
    setAttr(el.edge, "d", f.edge);
    setAttr(el.receipt, "opacity", f.proof);
    setAttr(el.typography, "fill", f.titleFill);
    setAttr(el.first, "transform", f.firstTransform);
    setAttr(el.second, "transform", f.secondTransform);
    setAttr(el.second, "opacity", f.secondOpacity);
    setAttr(el.count, "transform", f.countTransform);
    setAttr(el.count, "font-size", f.countSize);
    setAttr(el.count, "opacity", f.countOpacity);
    setText(el.count, String(f.count).padStart(2, "0"));
    for (let i = 0; i < 3; i++) setAttr($(`[data-notch="${i}"]`), "opacity", f.notchOpacity[i]);
    root.dataset.field = f.paper > 0.92 ? "paper" : "glass";
    if (shownLayout !== timeline.layout) {
      setAttr(art, "viewBox", `0 0 ${f.w} ${f.h}`);
      for (const [name, [x, y]] of Object.entries(receiptAnchors(timeline.layout))) {
        const node = $(`[data-receipt-${name}]`);
        setAttr(node, "x", x);
        setAttr(node, "y", y);
      }
      shownLayout = timeline.layout;
    }
    if (f.phase !== shownPhase) {
      root.dataset.phase = FORCE_PHASES[f.phase].id;
      phaseButtons.forEach((button, i) => setAttr(button, "aria-pressed", i === f.phase));
      shownPhase = f.phase;
    }
    const held = timeline.intent && timeline.blockers.size > 0;
    const mode = stills
      ? reducedMotion.matches ? "Reduced motion / stills" : "Data saver / stills"
      : timeline.running ? "Playing / illustrative"
      : held ? "Paused / not visible"
      : timeline.progress === 1 ? "Example complete" : "Paused";
    if (mode !== shownMode) {
      setText(el["mode-label"], mode);
      setText(el["play-label"], timeline.intent ? "Pause sequence" : timeline.progress === 1 ? "Replay the sequence" : "Play the sequence");
      setAttr(play, "aria-label", timeline.intent ? "Pause the illustrative motion" : "Play the illustrative motion");
      play.hidden = stills;
      shownMode = mode;
    }
    setText(el.finish, timeline.progress === 1 ? "Result shown" : "Show result");
    setAttr(el.finish, "aria-disabled", timeline.progress === 1);
    if (scrubber !== document.activeElement) scrubber.value = String(Math.round(f.p * 1000));
    setAttr(scrubber, "aria-valuetext", `${FORCE_PHASES[f.phase].label}, ${Math.round(f.p * 100)} percent of illustrative sequence`);
    const elapsed = ((timeline.duration * f.p) / 1000).toFixed(1).padStart(4, "0");
    setText(el.time, `${elapsed} / ${(timeline.duration / 1000).toFixed(1).padStart(4, "0")}`);
  }

  function tick(now: number) {
    frame = 0;
    if (destroyed || !timeline.running) return;
    if (lastTime !== null) timeline.advance(Math.min(80, now - lastTime));
    lastTime = now;
    render();
    if (timeline.running) {
      frame = requestAnimationFrame(tick);
    } else {
      lastTime = null;
      setHandoff("ready");
      announce("Illustrative set: 60 kilograms, 3 repetitions. Nothing was saved.");
    }
  }
  function sync() {
    if (destroyed) return;
    stop();
    render();
    if (timeline.running) frame = requestAnimationFrame(tick);
  }
  function pause(message = "Motion paused.") {
    setHandoff("paused");
    timeline.pause();
    sync();
    announce(message);
  }
  function seek(progress: number) {
    setHandoff("paused");
    timeline.seek(progress);
    sync();
    announce(`${FORCE_PHASES[forceFrame(progress).phase].label} still. Illustrative example only.`);
  }
  function start() {
    if (stills) return;
    setHandoff("pending");
    timeline.play();
    sync();
    announce("Illustrative sequence playing. Escape pauses immediately.");
  }
  function finish() {
    setHandoff("still");
    if (timeline.progress === 1) return;
    timeline.finish();
    sync();
    announce("Example set: 60 kilograms, 3 repetitions. Nothing was saved.");
  }

  // Controls.
  listen(play, "click", () => (timeline.intent ? pause() : start()));
  listen(el.finish!, "click", finish);
  phaseButtons.forEach((button, i) => listen(button, "click", () => seek(FORCE_PHASES[i].at)));
  listen(scrubber, "input", () => seek(Number(scrubber.value) / 1000));

  // Anything the visitor does inside the demo (other than Play) pauses it; so does Escape anywhere.
  const interrupts = (event: Event) => event.target instanceof Element && !event.target.closest("[data-play]") && timeline.intent;
  listen(root, "pointerdown", (event) => { if (interrupts(event)) pause("Motion paused for your interaction."); }, { passive: true });
  listen(root, "focusin", (event) => { if (interrupts(event)) pause("Motion paused for keyboard navigation."); });
  listen(document, "keydown", (event) => {
    if ((event as KeyboardEvent).key === "Escape" && (timeline.intent || productOpening)) pause();
  });

  // Holds: a hidden tab, page hide and the brand intro.
  listen(document, "visibilitychange", () => {
    timeline.block("hidden", document.hidden);
    sync();
  });
  listen(window, "pagehide", () => {
    timeline.block("pagehide", true);
    sync();
  });
  listen(window, "pageshow", () => {
    timeline.block("pagehide", false);
    timeline.block("hidden", document.hidden);
    sync();
  });
  const syncIntro = () => {
    timeline.block("intro", document.documentElement.classList.contains("bg-intro-active"));
    sync();
  };
  listen(window, "blackglass:intro-complete", syncIntro);
  const introObserver = typeof MutationObserver === "undefined" ? null : new MutationObserver(syncIntro);
  introObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  listen(narrow, "change", () => {
    timeline.layout = narrow.matches ? "mobile" : "desktop";
    pause("Layout changed. Motion paused at the same point.");
  });
  const syncStills = () => {
    stills = reducedMotion.matches || !!connection?.saveData;
    if (stills) {
      setHandoff("still");
      timeline.finish();
    }
    sync();
  };
  listen(reducedMotion, "change", syncStills);
  if (connection?.addEventListener) listen(connection, "change", syncStills);

  // Scrolling on before the opening has played skips straight to the result.
  const skipOnScroll = () => {
    if (!productOpening || handoffState !== "pending" || window.scrollY <= 24) return;
    started = true;
    setHandoff("still");
    timeline.finish();
    sync();
  };
  if (productOpening) listen(window, "scroll", skipOnScroll, { passive: true });
  setHandoff(stills ? "still" : "pending");
  skipOnScroll();
  timeline.block("hidden", document.hidden);
  timeline.block("intro", document.documentElement.classList.contains("bg-intro-active"));

  // Offscreen holds it; the first time 30% is visible, it autoplays (once).
  const visibility =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            const visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.3;
            timeline.block("offscreen", !visible);
            if (visible && !started) {
              started = true;
              if (root.dataset.autoplay === "true" && !stills) timeline.play();
            }
            sync();
          },
          { threshold: [0, 0.3] },
        )
      : null;
  if (visibility) {
    timeline.block("offscreen", true);
    visibility.observe(stage);
  } else {
    const check = () => {
      const rect = stage.getBoundingClientRect();
      timeline.block("offscreen", rect.bottom <= 0 || rect.top >= innerHeight);
      sync();
    };
    listen(window, "scroll", check, { passive: true });
    listen(window, "resize", check, { passive: true });
    check();
  }

  if (stills) timeline.finish();
  if (productOpening && !visibility) setHandoff("still");
  root.dataset.ready = "true";
  $("[data-controls]")!.hidden = false;
  render();
  return {
    play: start,
    pause,
    seek,
    finish,
    getState: () => ({ progress: timeline.progress, running: timeline.running, layout: timeline.layout, blockers: [...timeline.blockers] }),
    destroy() {
      timeline.finish();
      stop();
      render();
      destroyed = true;
      visibility?.disconnect();
      introObserver?.disconnect();
      cleanups.forEach((undo) => undo());
      $("[data-controls]")!.hidden = true;
      delete root.dataset.ready;
      delete root.dataset.handoffState;
    },
  };
}

const MARKUP = `      <h1 id="hero-title" class="sr-only">One session. Then the next.</h1>
      <div class="demo-bay">
        <div class="bay-topline"><span>01 / Force becomes a record</span><span data-mode-label>Illustrative still</span></div>
        <div class="stage" data-stage>
          <!-- One persistent front, lime edge and rep number. Typography follows this plane. -->
          <svg class="force-art" viewBox="0 0 1440 680" aria-hidden="true" focusable="false" data-force-art>
            <defs>
              <linearGradient id="force-plane-material" x1="0" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#3a3e41"/><stop offset=".46" stop-color="#25292c"/><stop offset="1" stop-color="#101315"/></linearGradient>
              <radialGradient id="force-contact-shadow"><stop offset="0" stop-color="#030405" stop-opacity=".95"/><stop offset=".6" stop-color="#030405" stop-opacity=".65"/><stop offset="1" stop-color="#030405" stop-opacity="0"/></radialGradient>
            </defs>
            <rect class="paper-plane" width="100%" height="100%" y="0" fill="#ecefe8" data-paper />
            <ellipse data-shadow cx="720" cy="548" rx="656" ry="8" opacity=".24" fill="url(#force-contact-shadow)"/>
            <g data-block transform="translate(720 480) scale(7.28889 .65)">
              <g data-depth opacity="0"><polygon points="-90,-90 -74,-109 106,-109 90,-90" fill="#555b60"/><polygon points="90,-90 106,-109 106,71 90,90" fill="#222629"/></g>
              <rect data-front x="-90" y="-90" width="180" height="180" fill="url(#force-plane-material)"/>
              <path data-highlight d="M -90 -90 H 90" fill="none" stroke="#c1c7ca" stroke-width="1.15" opacity=".22" vector-effect="non-scaling-stroke"/>
              <path data-edge d="M -90 -90 H -90 V 90" fill="none" stroke="#dfff00" stroke-width="5" vector-effect="non-scaling-stroke"/>
              <g data-notches fill="#dfff00"><rect data-notch="0" x="-84" y="65" width="1.3" height="12"/><rect data-notch="1" x="-80" y="65" width="1.3" height="12"/><rect data-notch="2" x="-76" y="65" width="1.3" height="12"/></g>
            </g>
            <g data-typography fill="#141916"><text class="scene-first" data-first transform="translate(64 147) scale(.76)">One session.</text><text class="scene-second" data-second transform="translate(64 278) scale(.98)">Then the next.</text></g>
            <g class="receipt" data-receipt><text class="receipt-label" data-receipt-set x="108" y="456">SET</text><text class="receipt-value" data-receipt-set-value x="108" y="513">01</text><text class="receipt-label" data-receipt-weight x="720" y="456" text-anchor="middle">WEIGHT</text><text class="receipt-value" data-receipt-value x="720" y="513" text-anchor="middle">60 kg</text><text class="receipt-reps" data-receipt-reps x="1318" y="456" text-anchor="end">REPS</text><text class="receipt-foot" data-receipt-foot x="64" y="620"></text></g>
            <text class="scene-count" data-count transform="translate(1318 513)" font-size="66" text-anchor="end" fill="#dfff00">03</text>
          </svg>
          <div class="mobile-static" aria-hidden="true"><strong>One session.<br>Then the next.</strong><div class="mobile-static-record"><div><span>SET</span><b>01</b></div><div><span>WEIGHT</span><b>60 kg</b></div><div><span>REPS</span><b class="static-reps">03</b></div></div><p></p></div>
          <p class="sr-only">Illustrative example: 60 kilograms, 3 repetitions. Nothing is saved.</p>
        </div>
        <div class="demo-controls" data-controls hidden>
          <div class="transport-row"><button class="play" type="button" data-play aria-label="Play the illustrative motion"><span data-play-label>Replay the sequence</span><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19 19 5M5 5h14v14"/></svg></button><button class="skip-motion" type="button" data-finish>Show result</button></div>
          <div class="phase-controls" role="group" aria-label="Illustrative sequence chapters"><button type="button" data-phase-button="0"><span>01</span> Load</button><button type="button" data-phase-button="1"><span>02</span> Repeat</button><button type="button" data-phase-button="2" aria-pressed="true"><span>03</span> Record</button></div>
          <label class="scrubber"><span class="sr-only">Sequence position. Use arrow keys to move, Home for start, End for result.</span><input data-scrubber type="range" min="0" max="1000" step="1" value="1000" aria-valuetext="Record, end of illustrative sequence"><span class="time" data-time aria-hidden="true">06.4 / 06.4</span></label>
        </div>
        <p class="demo-disclosure">Demonstration only. Nothing is saved.</p><p class="sr-only" data-status aria-live="polite" aria-atomic="true"></p><noscript><p class="no-js-note">The example is shown as a still. Preview access works without motion.</p></noscript>
      </div>`;

export function ForceOpening({ children, study = false }: { children?: ReactNode; study?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const demo = mountForceDemo(ref.current);
    return () => demo?.destroy();
  }, []);
  const markup = study ? MARKUP.replace(`<h1 id="hero-title"`, `<h2 id="force-study-title"`).replace(`</h1>`, `</h2>`) : MARKUP;
  return (
    <section className="bg-force" aria-labelledby={study ? "force-study-title" : "hero-title"}>
      <div className="force-demo" ref={ref} data-force-demo data-product-opening data-autoplay="true" data-phase="record" data-field="paper">
        {children}
        <div dangerouslySetInnerHTML={{ __html: markup }} />
      </div>
    </section>
  );
}
