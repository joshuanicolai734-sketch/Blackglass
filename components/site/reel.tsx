import { paths } from "@/content/brand";
import { site } from "@/content/site";

/** The reel's length in seconds and its three chapters (start time, name). Mirrors DUR and the scenes in public/reel.js. */
const DUR = 12;
const CHAPTERS: [number, string][] = [[0, "Squat"], [6, "The app"], [10, "Lockup"]];

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

type Pose = Record<"shin" | "thigh" | "torso" | "upper" | "fore", string>;
/** Mirrors pose() in public/reel.js. Returns the SVG transform of each moving frame. */
function pose(u: number): Pose {
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
  const tr = (P: number[], rad: number) => `translate(${P[0].toFixed(2)} ${P[1].toFixed(2)}) rotate(${(rad / R).toFixed(2)})`;
  return {
    shin: tr(A, Math.atan2(K[1] - A[1], K[0] - A[0])), thigh: tr(K, Math.atan2(H[1] - K[1], H[0] - K[0])), torso: tr(H, p - Math.PI / 2),
    upper: tr(S, ua), fore: tr(E, Math.atan2(B[1] - E[1], B[0] - E[0])),
  };
}

/** Tapered capsules in each frame's local space: [length, radius at start, radius at end, x, y]. */
const PARTS: Record<"foot" | keyof Pose, number[][]> = {
  foot: [[60, 9, 6, -15, -8]],
  shin: [[97, 7.5, 13, 0, 0], [40, 7, 12.5, 42, -3]],
  thigh: [[97, 13, 23, 0, 0]],
  torso: [[0, 23, 23, 6, -7], [56, 22, 24, 0, 2], [50, 27, 25, 56, 6], [26, 11, 11, 102, 4], [0, 20, 20, 138, 10]],
  upper: [[46, 11, 9, 0, 0]],
  fore: [[40, 8.5, 7, 0, 0]],
};
const cap = ([L, r1, r2, x, y]: number[], inset: number) => {
  r1 -= inset; r2 -= inset;
  if (r1 < 1 && r2 < 1) return "";
  const n = (v: number) => +v.toFixed(2);
  if (L === 0) return `M${n(x - r1)} ${n(y)}a${n(r1)} ${n(r1)} 0 1 0 ${n(2 * r1)} 0a${n(r1)} ${n(r1)} 0 1 0 ${n(-2 * r1)} 0Z`;
  r1 = Math.max(r1, 1); r2 = Math.max(r2, 1);
  const al = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / L)));
  const P = (cx: number, r: number, a: number) => `${n(x + cx + r * Math.cos(a))} ${n(y + r * Math.sin(a))}`;
  return `M${P(0, r1, al)}L${P(L, r2, al)}A${n(r2)} ${n(r2)} 0 ${al > Math.PI / 2 ? 1 : 0} 0 ${P(L, r2, -al)}L${P(0, r1, -al)}A${n(r1)} ${n(r1)} 0 ${al < Math.PI / 2 ? 1 : 0} 0 ${P(0, r1, al)}Z`;
};
const shape = (name: keyof typeof PARTS, inset: number) => PARTS[name].map((p) => cap(p, inset)).join("");

/** One copy of a body group at a contour inset: a hairline copy under a fill copy, so overlaps merge into one silhouette. */
function Contour({ names, inset, cls, at }: { names: (keyof typeof PARTS)[]; inset: number; cls: string; at: Pose }) {
  return (
    <>
      {[cls, "rl-f"].map((c) => (
        <g key={c} className={c}>
          {names.map((nm) => {
            const d = shape(nm, inset);
            if (!d) return null;
            return nm === "foot" ? <path key={nm} d={d} /> : <g key={nm} data-j={nm} transform={at[nm]}><path d={d} /></g>;
          })}
        </g>
      ))}
    </>
  );
}

function Athlete() {
  const at = pose(0);
  const body: (keyof typeof PARTS)[] = ["foot", "shin", "thigh", "torso"], arm: (keyof typeof PARTS)[] = ["upper", "fore"];
  const [bx, by] = MODEL.bar;
  return (
    <svg className="rl-fig" viewBox="-100 -430 210 440" aria-hidden="true">
      <line className="rl-path" x1={MODEL.mid} x2={MODEL.mid} y1={0} y2={-400} />
      <g data-j="torso" transform={at.torso}><circle className="rl-plate" cx={bx} cy={by} r={50} /><circle className="rl-plate-in" cx={bx} cy={by} r={38} /></g>
      <Contour names={body} inset={0} cls="rl-o" at={at} />
      <Contour names={body} inset={9} cls="rl-i" at={at} />
      <Contour names={arm} inset={0} cls="rl-o" at={at} />
      <Contour names={arm} inset={9} cls="rl-i" at={at} />
      <g data-j="torso" transform={at.torso}><circle className="rl-hub" cx={bx} cy={by} r={5} /></g>
    </svg>
  );
}

/** The app scene: one real fact per module, read off the screens in public/assets. */
const MODULES: [string, string, string][] = [
  ["Today", "Session in progress", "05 exercises · 12 sets"],
  ["Train", "Programme", "6 days per week · week 1 of 6"],
  ["Learn", "Exercise guide", "Phase by phase"],
  ["Fuel", "Targets", "kcal · protein"],
];

/**
 * The showreel band: a 12 s tempo film. Every layer is server-rendered here, and the first frame (the athlete
 * braced under the bar, the 3 · 1 · 1 readout) is the poster: the first paint, the no-JavaScript view and the
 * reduced-motion view. public/reel.js (loaded after the page's load event, never with reduced motion) only moves
 * these layers, with transform and opacity, from a pure seek(t). Layout is in container units, so it holds from
 * 4:5 to 16:9 without measuring.
 */
export function Reel() {
  const geometry = { model: MODEL, dur: DUR };
  return (
    <section className="reel" aria-labelledby="reel-title" data-reel data-geometry={JSON.stringify(geometry)}>
      <h2 id="reel-title" className="sr-only">Showreel</h2>
      <p className="sr-only">
        A 12-second looping animation without sound. An athlete performs one back squat at a 3-1-1 tempo: three seconds down, a one-second
        pause at the bottom and one second to drive back up, with the bar kept over the middle of the foot. Then the app&rsquo;s four areas,
        Today, Train, Learn and Fuel, and the Blackglass mark with the line &ldquo;{site.tagline}&rdquo;
      </p>
      <div className="reel-stage">
        <div className="reel-scenes" aria-hidden="true">
          <div className="rl-scene rl-squat" data-scene="0">
            <Athlete />
            <span className="rl-floor" />
            <div className="rl-tempo">
              <p className="rl-label"><b>Back squat</b> · Tempo</p>
              <div className="rl-cols">
                {[["3", "Lower"], ["1", "Pause"], ["1", "Drive"]].map(([n, w], i) => (
                  <div key={w} className="rl-col" data-col={i}><span className="rl-n">{n}</span><span className="rl-label">{w}</span></div>
                ))}
                <span className="rl-mark" data-mark><i /></span>
              </div>
            </div>
          </div>
          <div className="rl-scene rl-mods" data-scene="1">
            {MODULES.map(([name, key, value], i) => (
              <div key={name} className="rl-mod" data-mod={i}>
                <p className="rl-label rl-idx"><i className="rl-sq" /><b>0{i + 1}</b> / 04</p>
                <p className="rl-word">{name}</p>
                <p className="rl-label rl-spec"><b>{key}</b><br />{value}</p>
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
        <button type="button" className="reel-toggle label" data-reel-toggle hidden aria-label="Pause the showreel">
          <span className="reel-toggle-icon" aria-hidden="true" /><span data-reel-toggle-text>Pause</span>
        </button>
      </div>
    </section>
  );
}
