import { lockupViewBox, paths } from "@/content/brand";

/**
 * The brand intro (Sites v34): two doors part on the lockup, once per session, on the home page only.
 *
 * It's inert markup until the inline gate in app/layout.tsx adds `bg-intro-active` to <html>. The gate skips it for
 * other routes, reduced motion, Save-Data and devices with two cores or fewer, and runs it at most once per session.
 * public/intro.js closes it at 1.5 s, on any pointer, wheel, touch or key input, or on the Skip button. Without
 * JavaScript the class is never added and the CSS keeps both elements hidden.
 */
export function BrandIntro() {
  return (
    <>
      <div className="brand-intro" aria-hidden="true">
        <div className="bi-door bi-door-left" />
        <div className="bi-door bi-door-right" />
        <div className="bi-seam" />
        <div className="bi-lockup">
          <svg viewBox={lockupViewBox} focusable="false">
            <path d={paths.pane} fill="#25292b" />
            <path d={paths.facet} fill="#414749" />
            <path d={paths.glint} fill="#dfff00" />
            <path d={paths.rim} fill="#e6e8df" fillRule="evenodd" />
            <path d={paths.wordmark} fill="#e6e8df" />
          </svg>
        </div>
      </div>
      <button className="brand-intro-skip" type="button" data-intro-skip>
        Skip intro
      </button>
    </>
  );
}
