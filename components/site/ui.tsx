import type { ReactNode } from "react";

/** Diagonal arrow drawn on the brand's 45° axis. */
export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg className={down ? "arrow arrow-down" : "arrow"} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** primary: chamfered fill (volt on Glass, ink on Paper). ghost: hairline chamfer. */
  variant?: "primary" | "ghost";
  track?: string;
  external?: boolean;
  down?: boolean;
  className?: string;
};

export function Button({ href, children, variant = "primary", track, external, down, className = "" }: ButtonProps) {
  return (
    <a
      className={`btn btn-${variant} ${className}`.trim()}
      href={href}
      data-track={track}
      {...(external ? { rel: "noopener", target: "_blank" } : {})}
    >
      <span>{children}</span>
      <Arrow down={down} />
    </a>
  );
}

/** A standalone text link: a faint hairline at rest, a full-strength one draws across on hover. */
export function TextLink({ href, children, down, track, arrow = true }: { href: string; children: ReactNode; down?: boolean; track?: string; arrow?: boolean }) {
  return (
    <a className="link" href={href} data-track={track}>
      <span>{children}</span>
      {arrow && <Arrow down={down} />}
    </a>
  );
}

/** Section header: `01 — TITLE ———— meta`. Meta must be real (a count, a place), never decoration. */
export function SectionHead({ index, title, meta }: { index?: string; title: ReactNode; meta?: ReactNode }) {
  return (
    <p className="sh label">
      {index && <><span className="sh-i">{index}</span><span className="sh-dash" aria-hidden="true" /></>}
      <span>{title}</span>
      <span className="sh-rule" aria-hidden="true" />
      {meta && <span className="sh-meta">{meta}</span>}
    </p>
  );
}

/** The 6px signal square: marks the current or active item. Decorative. */
export function Signal() {
  return <span className="sq" aria-hidden="true" />;
}

/** Registration brackets. Inside a `.snap` element they snap in on hover and focus. */
export function Brackets() {
  return <span className="brk" aria-hidden="true"><i /></span>;
}

/** Label–value spec card. Every spec row must point at something real (a screen, a count). */
export function SpecCard({ index, kicker, title, children, specs, signal = false, as: Tag = "article" }: {
  index?: string; kicker?: ReactNode; title: ReactNode; children?: ReactNode; specs?: [string, ReactNode][]; signal?: boolean; as?: "article" | "li";
}) {
  return (
    <Tag className="spec snap">
      <Brackets />
      {(index || kicker) && (
        <p className="spec-k label">{signal && <Signal />}{index && <span className="i">{index}</span>}{kicker && <span>{kicker}</span>}</p>
      )}
      <h3 className="title">{title}</h3>
      {children}
      {specs && specs.length > 0 && (
        <dl className="label">{specs.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      )}
    </Tag>
  );
}

/** A real product screen set in a chamfered black-glass pane with its lit facet. */
export function Pane({ src, alt, width = 720, height = 1560, priority = false, caption, className = "", sizes = "(min-width: 900px) 380px, 76vw" }: {
  src: string; alt: string; width?: number; height?: number; priority?: boolean; caption?: ReactNode; className?: string; sizes?: string;
}) {
  return (
    <figure className={`pane ${className}`.trim()}>
      <div className="pane-glass">
        {/* eslint-disable-next-line @next/next/no-img-element -- static WebP screens served as-is */}
        <img src={src} alt={alt} width={width} height={height} decoding="async"
          srcSet={src.endsWith(".webp") ? `${src.replace(".webp", "-480.webp")} 480w, ${src} 720w` : undefined}
          sizes={sizes}
          {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })} />
      </div>
      {caption && <figcaption className="label">{caption}</figcaption>}
    </figure>
  );
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
