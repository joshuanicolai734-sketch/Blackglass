"use client";

import { useEffect, useRef } from "react";

type Connection = { saveData?: boolean };

/**
 * The Today screen in its poster frame (Sites v34). The two planes and the track move once (1.8 s) the first time a
 * quarter of the figure is on screen, after the brand intro, and never with reduced motion, Save-Data or a two-core
 * device. The screen itself never moves.
 *
 * Rebuilt on 7 November 2026 from the compiled chunk the public site served (studio/reference/sites-v34-2026-11-07/).
 */
export function HomeProductArt() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const figure = ref.current;
    if (!figure || !("IntersectionObserver" in window)) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let inView = false;
    let played = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const rest = () => figure.removeAttribute("data-moving");
    const playOnce = () => {
      if (played || !inView || document.hidden || document.documentElement.classList.contains("bg-intro-active")) return;
      played = true;
      if (reducedMotion.matches || connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) return;
      figure.setAttribute("data-moving", "");
      timer = setTimeout(rest, 1800);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (inView) playOnce();
        else rest();
      },
      { threshold: 0.25 },
    );
    const mo = new MutationObserver(playOnce);
    io.observe(figure);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onVisibility = () => (document.hidden ? rest() : playOnce());
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", rest);
    window.addEventListener("blackglass:intro-complete", playOnce);
    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(timer);
      rest();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", rest);
      window.removeEventListener("blackglass:intro-complete", playOnce);
    };
  }, []);
  return (
    <figure className="home-product-art" ref={ref}>
      <div className="home-art-field" aria-hidden="true">
        <span className="home-art-plane home-art-plane-back" />
        <span className="home-art-plane home-art-plane-front" />
        <span className="home-art-track" />
      </div>
      <p className="home-art-index label">
        <span>01 / Today</span>
        <span>Android</span>
      </p>
      <div className="home-art-screen">
        {/* eslint-disable-next-line @next/next/no-img-element -- static WebP screens served as-is */}
        <img
          src="/assets/dashboard.webp"
          srcSet="/assets/dashboard-480.webp 480w, /assets/dashboard.webp 720w"
          sizes="(min-width: 900px) 288px, 236px"
          width="720"
          height="1560"
          fetchPriority="high"
          alt="Blackglass Today screen: a Push A session ready to resume, with calorie and protein targets below"
        />
      </div>
      <figcaption>
        <span className="home-art-caption-rule" aria-hidden="true" />
        Actual Android screen.
        <br />
        Earlier development build; example data.
      </figcaption>
    </figure>
  );
}
