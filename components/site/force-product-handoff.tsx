"use client";

import { useEffect, useRef } from "react";
import { clamp, forceFrame } from "./force-model";

/**
 * The scroll handoff (Sites v34): once the force opening has finished, scrolling carries its plane and lime edge
 * into the Today screen below, so the record visibly becomes the product. Scroll-linked, never time-based. It only
 * runs when both ends fit on screen at the start and end of the travel, the opening is "ready", the Today panel is
 * active, and neither reduced motion nor Save-Data is on; otherwise the layer stays still (and hidden by CSS).
 *
 * Rebuilt on 7 November 2026 from the compiled chunk the public site served (studio/reference/sites-v34-2026-11-07/):
 * names are new, the behaviour and numbers are unchanged.
 */

type Box = { top: number; left: number; width: number; height: number };
type Geometry = ReturnType<typeof measureHandoff>;
type Connection = EventTarget & { saveData?: boolean };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smoothstep = (t: number) => ((t = clamp(t)), t * t * (3 - 2 * t));

/** Where the plane starts (the opening's settled front) and lands (the Today pane), and the scroll range between. */
function measureHandoff({ art, pane, origin, viewport, mobile }: { art: Box; pane: Box; origin: Box; viewport: number; mobile: boolean }) {
  const f = forceFrame(1, mobile ? "mobile" : "desktop");
  const scale = art.width / f.w;
  const source = {
    x: art.left + (f.x - f.frontWidth / 2) * scale - origin.left,
    y: art.top + (f.y - f.frontHeight / 2) * scale - origin.top,
    width: f.frontWidth * scale,
    height: f.frontHeight * scale,
  };
  const target = { x: pane.left - 12 - origin.left, y: pane.top + 22 - origin.top, height: 96 };
  const end = Math.max(240, target.y + origin.top - viewport * 0.72);
  const distance = clamp(end - Math.max(0, source.y + origin.top - viewport * 0.5), 240, 640);
  const start = Math.max(0, end - distance);
  const sourceTop = source.y + origin.top - start;
  const targetTop = target.y + origin.top - (start + distance);
  return {
    source,
    target,
    start,
    distance,
    canAnimate: sourceTop >= 80 && sourceTop + source.height <= viewport && targetTop >= 80 && targetTop + target.height <= viewport,
  };
}

function handoffFrame(progress: number, { source, target }: Geometry) {
  const p = clamp(progress);
  const travel = smoothstep((p - 0.38) / 0.62);
  return {
    p,
    proof: 1 - smoothstep(p / 0.16),
    replace: p > 0.18,
    x: lerp(source.x, target.x, travel),
    y: lerp(source.y, target.y, travel),
    edgeX: lerp(source.x - 2.5, target.x, travel),
    edgeWidth: lerp(5, 4, travel),
    height: lerp(source.height, target.height, travel),
    width: source.width * (1 - smoothstep((p - 0.18) / 0.2)),
  };
}

function mountHandoff(root: HTMLElement | null | undefined) {
  if (!root || root.hasAttribute("data-product-handoff-ready")) return null;
  const $ = (selector: string) => root.querySelector<HTMLElement>(selector);
  const opening = $("[data-product-opening]");
  const art = $("[data-force-art]");
  const details = opening?.closest?.("details");
  const pane = $('[data-demo-panel="today"] .demo-pane');
  const panel = $('[data-demo-panel="today"]');
  const product = $(".force-product");
  const plane = $("[data-handoff-plane]");
  const edge = $("[data-handoff-edge]");
  if (!opening || !art || !pane || !panel || !product || !plane || !edge) return null;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const cleanups: (() => void)[] = [];
  const intersecting = new Map<Element, boolean>();
  let geometry: Geometry | null = null;
  let stale = true;
  let frame = 0;
  let destroyed = false;
  let visible = false;

  const listen = (target: EventTarget, type: string, handler: () => void, options?: boolean | AddEventListenerOptions) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const cancel = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const supported = "IntersectionObserver" in window && "ResizeObserver" in window && "MutationObserver" in window;
  const canRun = () =>
    supported &&
    (!details || details.open) &&
    !reducedMotion.matches &&
    !connection?.saveData &&
    opening.dataset.handoffState === "ready" &&
    !panel.hasAttribute("data-inactive") &&
    (stale || !geometry || geometry.canAnimate);
  const still = () => {
    cancel();
    root.dataset.productHandoff = "still";
  };

  function measure() {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const box = (node: Element): Box => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top + scrollY, left: rect.left + scrollX, width: rect.width, height: rect.height };
    };
    geometry = measureHandoff({
      art: box(art!),
      pane: box(pane!),
      origin: box(root!),
      viewport: window.innerHeight,
      mobile: matchMedia("(max-width: 700px)").matches,
    });
    stale = false;
  }
  function draw() {
    frame = 0;
    if (destroyed || !canRun()) return still();
    if (!visible || document.hidden) return;
    if (stale) measure();
    if (!geometry!.canAnimate) return still();
    const f = handoffFrame((window.scrollY - geometry!.start) / geometry!.distance, geometry!);
    root!.dataset.productHandoff = f.p >= 1 ? "complete" : "active";
    root!.style.setProperty("--handoff-proof", String(f.proof));
    root!.dataset.handoffReplace = String(f.replace);
    const move = `translate3d(${f.x.toFixed(2)}px,${f.y.toFixed(2)}px,0)`;
    plane!.style.transform = `${move} scale(${f.width.toFixed(2)},${f.height.toFixed(2)})`;
    edge!.style.transform = `translate3d(${f.edgeX.toFixed(2)}px,${f.y.toFixed(2)}px,0) scale(${f.edgeWidth.toFixed(2)},${f.height.toFixed(2)})`;
  }
  function schedule() {
    if (destroyed) return;
    if (!canRun()) return still();
    if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
  }
  const remeasure = () => {
    stale = true;
    schedule();
  };

  const io = supported
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => intersecting.set(entry.target, entry.isIntersecting));
        visible = [...intersecting.values()].some(Boolean);
        if (visible) schedule();
        else cancel();
      })
    : null;
  io?.observe(art);
  io?.observe(product);
  const ro = supported ? new ResizeObserver(remeasure) : null;
  [root, art, pane].forEach((node) => ro?.observe(node));
  const mo = supported ? new MutationObserver(schedule) : null;
  mo?.observe(opening, { attributes: true, attributeFilter: ["data-handoff-state"] });
  mo?.observe(panel, { attributes: true, attributeFilter: ["data-inactive"] });
  listen(window, "scroll", schedule, { passive: true });
  listen(window, "resize", remeasure, { passive: true });
  listen(window, "pagehide", cancel);
  listen(window, "pageshow", remeasure);
  listen(document, "visibilitychange", () => (document.hidden ? cancel() : schedule()));
  listen(reducedMotion, "change", schedule);
  if (connection?.addEventListener) listen(connection, "change", schedule);
  listen(root, "load", remeasure, true); // images inside, captured
  if (details) listen(details, "toggle", remeasure);
  document.fonts?.ready.then(() => {
    if (!destroyed) remeasure();
  });
  root.dataset.productHandoffReady = "true";
  still();
  return {
    destroy() {
      destroyed = true;
      cancel();
      io?.disconnect();
      ro?.disconnect();
      mo?.disconnect();
      cleanups.forEach((undo) => undo());
      root.style.removeProperty("--handoff-proof");
      delete root.dataset.productHandoffReady;
      delete root.dataset.productHandoff;
      delete root.dataset.handoffReplace;
    },
  };
}

export function ForceProductHandoff() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handoff = mountHandoff(ref.current?.parentElement);
    return () => handoff?.destroy();
  }, []);
  return (
    <div className="force-product-handoff" ref={ref} aria-hidden="true" data-product-handoff-layer>
      <svg className="handoff-plane" data-handoff-plane width="1" height="1" viewBox="0 0 1 1" focusable="false">
        <defs>
          <linearGradient id="force-handoff-material" x1="0" y1="0" x2=".85" y2="1">
            <stop offset="0" stopColor="#3a3e41" />
            <stop offset=".46" stopColor="#25292c" />
            <stop offset="1" stopColor="#101315" />
          </linearGradient>
        </defs>
        <rect width="1" height="1" fill="url(#force-handoff-material)" />
      </svg>
      <i className="handoff-edge" data-handoff-edge />
    </div>
  );
}
