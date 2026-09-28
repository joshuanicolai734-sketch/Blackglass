import type { CSSProperties } from "react";
import { paths } from "@/content/brand";
import { site } from "@/content/site";
import { TextLink } from "@/components/site/ui";

/** The reel's length in seconds and its chapters (start time, name). Mirrors the scene times in public/reel.js. */
const DUR = 12;
const CHAPTERS: [number, string][] = [[0, "Squat"], [6.4, "The app"], [10, "Lockup"]];

/* ---- The athlete: a back squat seen from the side, facing right. ----
   Figure units: the floor is y 0 and up is -y, the ankle is x 0; about 2.26 units per cm, so a 180 cm lifter is
   406 units tall. Joints are solved from one depth value u (0 standing, 1 below parallel): the shin and thigh angles
   are interpolated, and the torso leans exactly enough to keep the bar over midfoot, so the bar path is vertical.
   public/reel.js runs the same solver per frame (same MODEL, passed in data-geometry); this file renders u = 0,
   which is the poster and the reel's first frame. */
const MODEL = {
  ankle: [0, -16], mid: 10, shin: 97, thigh: 97, bar: [106, -18], sh: [100, 12], upper: 46, fore: 40,
  top: [6, -3], bottom: [36, 104],
};

type Frame = "shin" | "thigh" | "torso" | "upper" | "fore";
/** Mirrors pose() and at() in public/reel.js: each moving frame's CSS transform, in figure units of --u. */
function pose(u: number): Record<Frame, string> {
  const M = MODEL, R = Math.PI / 180;
  const s = (M.top[0] + (M.bottom[0] - M.top[0]) * u) * R, f = (M.top[1] + (M.bottom[1] - M.top[1]) * u) * R;
  const A = M.ankle;
  const K = [A[0] + M.shin * Math.sin(s), A[1] - M.shin * Math.cos(s)];
  const H = [K[0] - M.thigh * Math.sin(f), K[1] - M.thigh * Math.cos(f)];
  const a = M.bar[0], d = -M.bar[1];
  const p = Math.atan2(d, a) + Math.asin((M.mid - H[0]) / Math.hypot(a, d));
  const loc = (x: number, y: number) => [H[0] + x * Math.sin(p) + y * Math.cos(p), H[1] - x * Math.cos(p) + y * Math.sin(p)];
  const S = loc(M.sh[0], M.sh[1]), B = loc(M.bar[0], M.bar[1]);
  const D = Math.min(Math.hypot(B[0] - S[0], B[1] - S[1]), M.upper + M.fore - 0.01);
  const ua = Math.atan2(B[1] - S[1], B[0] - S[0]) - Math.acos((M.upper ** 2 + D * D - M.fore ** 2) / (2 * M.upper * D));
  const E = [S[0] + M.upper * Math.cos(ua), S[1] + M.upper * Math.sin(ua)];
  const at = (P: number[], rad: number) => `translate(calc(var(--u) * ${P[0].toFixed(2)}), calc(var(--u) * ${P[1].toFixed(2)})) rotate(${(rad / R).toFixed(2)}deg)`;
  return {
    shin: at(A, Math.atan2(K[1] - A[1], K[0] - A[0])), thigh: at(K, Math.atan2(H[1] - K[1], H[0] - K[0])), torso: at(H, p - Math.PI / 2),
    upper: at(S, ua), fore: at(E, Math.atan2(B[1] - E[1], B[0] - E[0])),
  };
}

/** Tapered capsules in each frame's local space: [length, radius at start, radius at end, x, y]. The foot is in world space. */
const PARTS: Record<"foot" | Frame, number[][]> = {
  foot: [[60, 9, 6, -15, -8]],
  shin: [[97, 8, 14.5, 0, 0], [40, 7, 13.5, 42, -3]],
  thigh: [[97, 15, 26, 0, 0]],
  // glutes, waist, chest (lat width), trap, neck, head
  torso: [[0, 24, 24, 6, -7], [56, 20, 25, 0, 2], [50, 30, 24, 56, 6], [20, 14, 12, 92, -4], [26, 11, 11, 102, 4], [0, 20, 20, 138, 10]],
  upper: [[46, 12, 10, 0, 0]],
  fore: [[40, 9, 7.5, 0, 0]],
};
const n = (v: number) => +v.toFixed(2);
const cap = ([L, r1, r2, x, y]: number[]) => {
  if (L === 0) return `M${n(x - r1)} ${n(y)}a${r1} ${r1} 0 1 0 ${2 * r1} 0a${r1} ${r1} 0 1 0 ${-2 * r1} 0Z`;
  const al = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / L)));
  const P = (cx: number, r: number, a: number) => `${n(x + cx + r * Math.cos(a))} ${n(y + r * Math.sin(a))}`;
  return `M${P(0, r1, al)}L${P(L, r2, al)}A${r2} ${r2} 0 ${al > Math.PI / 2 ? 1 : 0} 0 ${P(L, r2, -al)}L${P(0, r1, -al)}A${r1} ${r1} 0 ${al < Math.PI / 2 ? 1 : 0} 0 ${P(0, r1, al)}Z`;
};
const box = (parts: number[][], pad = 4) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [L, r1, r2, x, y] of parts) {
    const r = Math.max(r1, r2);
    x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + L + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r);
  }
  return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].map(n);
};
const [BX, BY] = MODEL.bar;

/**
 * One layer of the athlete: an SVG sized to its part's bounds in figure units (--u is one unit in CSS pixels) and
 * moved with a CSS transform, so every limb is its own compositor layer and the squat never repaints.
 */
function Limb({ frame, kind, parts, at, children }: { frame?: Frame; kind: string; parts: number[][]; at: Record<Frame, string>; children?: React.ReactNode }) {
  const [x, y, w, h] = box(parts);
  const u = (v: number) => `calc(var(--u) * ${v})`;
  const style: CSSProperties = { left: u(x), top: u(y), width: u(w), height: u(h), transformOrigin: `${u(-x)} ${u(-y)}`, transform: frame ? at[frame] : undefined };
  return (
    <svg className={`rl-limb ${kind}`} data-j={frame} viewBox={`${x} ${y} ${w} ${h}`} style={style}>
      {children ?? <path d={parts.map(cap).join("")} />}
    </svg>
  );
}

function Athlete() {
  const at = pose(0);
  const body: ("foot" | Frame)[] = ["foot", "shin", "thigh", "torso"], arm: Frame[] = ["upper", "fore"];
  const plate = [[0, 50, 50, BX, BY]], hub = [[0, 5, 5, BX, BY]];
  // The lit facet: a bone edge along the upper back and traps, clipped to the back of the torso.
  const back = [PARTS.torso[2], PARTS.torso[3]];
  return (
    <div className="rl-fig" aria-hidden="true">
      <span className="rl-path" />
      <div className="rl-rig">
        <Limb frame="torso" kind="rl-plate" parts={plate} at={at}><circle cx={BX} cy={BY} r={50} /><circle className="rl-plate-in" cx={BX} cy={BY} r={38} /></Limb>
        {body.map((p) => <Limb key={`o-${p}`} frame={p === "foot" ? undefined : p} kind="rl-o" parts={PARTS[p]} at={at} />)}
        {body.map((p) => (
          <Limb key={`f-${p}`} frame={p === "foot" ? undefined : p} kind="rl-f" parts={PARTS[p]} at={at}>
            {p === "torso" ? (
              <>
                <path d={PARTS.torso.map(cap).join("")} />
                <clipPath id="rl-back"><rect x={40} y={-60} width={90} height={52} /></clipPath>
                <path className="rl-spec" d={back.map(cap).join("")} clipPath="url(#rl-back)" />
              </>
            ) : undefined}
          </Limb>
        ))}
        {arm.map((p) => <Limb key={`o-${p}`} frame={p} kind="rl-o" parts={PARTS[p]} at={at} />)}
        {arm.map((p) => <Limb key={`f-${p}`} frame={p} kind="rl-f" parts={PARTS[p]} at={at} />)}
        <Limb frame="torso" kind="rl-hub" parts={hub} at={at} />
      </div>
    </div>
  );
}

/**
 * The app scene: three real screens, cropped to one honest fact each (public/assets, the demo's own files). The
 * Learn crop is the phase control only, never the exercise render. reel.js sets the image sources once the reel
 * starts, so the screens cost nothing before the page's load event (and are usually cached by the demo already).
 */
const MODULES: { name: string; fact: string; src: string; y: number }[] = [
  { name: "Today", fact: "Resume where you stopped", src: "/assets/dashboard", y: 285 },
  { name: "Train", fact: "The whole week, planned", src: "/assets/program", y: 472 },
  { name: "Learn", fact: "Phase by phase", src: "/assets/movement", y: 1165 },
];

/**
 * The showreel band: a 12 s tempo film. Every layer is server-rendered here, and the first frame (the athlete
 * braced under the bar, the 3 · 1 · 1 readout) is the poster: the first paint, the no-JavaScript view and the
 * reduced-motion view. public/reel.js (loaded after the page's load event, never with reduced motion) only moves
 * these layers, with transform and opacity, from a pure seek(t). Layout is in container units, so it holds from
 * 1:1 to 16:9 without measuring.
 */
export function Reel() {
  const geometry = { model: MODEL, dur: DUR };
  return (
    <section className="reel" aria-labelledby="reel-title" data-reel data-geometry={JSON.stringify(geometry)}>
      <h2 id="reel-title" className="sr-only">Showreel</h2>
      <p className="sr-only">
        A 12-second looping animation without sound. An athlete braces under the bar and performs one back squat at a 3-1-1 tempo: three
        seconds down, a one-second pause at the bottom, a drive back up, and a held lockout, with the bar kept over the middle of the foot.
        Then three of the app&rsquo;s screens: Today, with an unfinished session ready to resume; Train, a six-day programme; and Learn, an
        exercise guide taken phase by phase. It ends on the Blackglass mark with the line &ldquo;{site.tagline}&rdquo;
      </p>
      <div className="reel-stage">
        <div className="reel-scenes" aria-hidden="true">
          <div className="rl-scene rl-squat" data-scene="0">
            <Athlete />
            <span className="rl-floor" />
            <div className="rl-tempo">
              <p className="rl-label"><b>Back squat</b> · Tempo</p>
              <div className="rl-cols">
                {[["3", "Lower"], ["1", "Pause"], ["1", "Drive"]].map(([num, w], i) => (
                  <div key={w} className="rl-col" data-col={i}><span className="rl-n">{num}</span><span className="rl-label">{w}</span></div>
                ))}
                <span className="rl-mark" data-mark><i /></span>
              </div>
            </div>
          </div>
          <div className="rl-scene rl-mods" data-scene="1">
            {MODULES.map(({ name, fact, src, y }, i) => (
              <div key={name} className="rl-mod" data-mod={i}>
                <div className="rl-cap">
                  <p className="rl-label"><b>0{i + 1}</b> / 0{MODULES.length}</p>
                  <p className="rl-word">{name}</p>
                  <p className="rl-label"><b>{fact}</b></p>
                </div>
                <div className="rl-shot" style={{ "--y": `${((-y / 1560) * 100).toFixed(3)}%` } as CSSProperties}
                  data-src={`${src}-480.webp 480w, ${src}.webp 720w`} />
              </div>
            ))}
          </div>
          <div className="rl-scene rl-lock" data-scene="2">
            <svg className="rl-mk" viewBox="0 0 88 88">
              <path fill="var(--c-pane)" d={paths.pane} /><path fill="var(--c-facet)" d={paths.facet} />
              <path fill="var(--c-volt)" d={paths.glint} /><path fill="var(--c-bone)" fillRule="evenodd" d={paths.rim} />
            </svg>
            <svg className="rl-wm" viewBox="118 24 409.593 40"><path fill="var(--c-bone)" d={paths.wordmark} /></svg>
            <p className="rl-tag">{site.tagline}</p>
          </div>
        </div>
        <button type="button" className="reel-toggle label" data-reel-toggle hidden aria-label="Pause the showreel">
          <span className="reel-toggle-icon" aria-hidden="true" /><span data-reel-toggle-text>Pause</span>
        </button>
        {/* Chapters: one roving-focus toolbar (a single tab stop; arrow keys move between chapters), shown on hover, focus or pause. */}
        <div className="reel-chapters" role="toolbar" aria-label="Showreel chapters" data-reel-chapters hidden>
          <span className="rc-track" aria-hidden="true"><span className="rc-fill" /><span className="rc-run"><span className="rc-sq" /></span></span>
          {CHAPTERS.map(([at, name], i) => (
            <button key={name} type="button" className="rc-ch label" data-at={at} tabIndex={i === 0 ? 0 : -1} style={{ left: `${(at / DUR) * 100}%` }}
              aria-label={`Play the showreel from chapter ${i + 1}, ${name}`}>
              <span className="rc-tick" aria-hidden="true" /><span className="rc-n">0{i + 1}</span><span className="rc-name">{name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="reel-foot wrap"><TextLink href="#start" down>Choose your start</TextLink></div>
    </section>
  );
}
