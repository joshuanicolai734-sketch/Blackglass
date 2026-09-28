import { paths } from "@/content/brand";
import { site } from "@/content/site";

/** The rim's outer contour: the first subpath of the exact rim geometry. */
export const outline = paths.rim.split(" M")[0];

/** The reel's six beats (start time in seconds, name). Mirrors BEATS in public/reel.js. */
const CHAPTERS: [number, string][] = [[0, "Axis"], [3, "Pane"], [7, "Specimen"], [12, "Modules"], [16, "Scale"], [19, "Lockup"]];

/**
 * The showreel band. First paint is a static poster: the lockup on Glass, the reel's resting frame, laid out with
 * container units so it matches public/reel.js exactly. That script (loaded after the page's load event, never
 * with reduced motion) builds the animated layers over it and runs a 24 s loop from a pure seek(t).
 */
export function Reel() {
  const geometry = { pane: paths.pane, facet: paths.facet, glint: paths.glint, rim: paths.rim, wordmark: paths.wordmark, outline, tagline: site.tagline };
  return (
    <section className="reel" aria-labelledby="reel-title" data-reel data-geometry={JSON.stringify(geometry)}>
      <h2 id="reel-title" className="sr-only">Showreel</h2>
      <p className="sr-only">A 24-second looping animation without sound: the Blackglass mark drawn on its axis, an athlete in the ab wheel rollout from the exercise guide, the app&rsquo;s four areas (Today, Train, Learn and Fuel), and the line &ldquo;{site.tagline}&rdquo;</p>
      <div className="reel-stage">
        <div className="reel-poster" aria-hidden="true">
          <svg className="rp-mark" viewBox="0 0 88 88">
            <path fill="var(--c-pane)" d={paths.pane} /><path fill="var(--c-facet)" d={paths.facet} />
            <path fill="var(--c-volt)" d={paths.glint} /><path fill="var(--c-bone)" fillRule="evenodd" d={paths.rim} />
          </svg>
          <svg className="rp-word" viewBox="118 24 409.593 40"><path fill="var(--c-bone)" d={paths.wordmark} /></svg>
          <p className="rp-tag display">{site.tagline}</p>
        </div>
        {/* Chapters: a hairline timeline of the six beats, shown on hover, focus or pause. */}
        <div className="reel-chapters" data-reel-chapters hidden>
          <span className="rc-track" aria-hidden="true"><span className="rc-fill" /><span className="rc-sq" /></span>
          {CHAPTERS.map(([at, name], i) => (
            <button key={name} type="button" className="rc-ch label" data-at={at} style={{ left: `${(at / 24) * 100}%` }} aria-label={`Play the showreel from beat ${i + 1}, ${name}`}>
              <span className="rc-tick" aria-hidden="true" /><span className="rc-n">0{i + 1}</span><span className="rc-name">{name}</span>
            </button>
          ))}
        </div>
        <button type="button" className="reel-toggle label" data-reel-toggle hidden aria-label="Pause the showreel">
          <span className="reel-toggle-icon" aria-hidden="true" /><span data-reel-toggle-text>Pause</span>
        </button>
      </div>
    </section>
  );
}
