import type { ReactNode } from "react";

/** Diagonal arrow drawn on the brand's 45° axis. */
export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg className={down ? "arrow arrow-down" : "arrow"} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}

/** The brand mark as an outline, used as a small section marker. */
export function Octagon({ className = "oct" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 88 88" aria-hidden="true" focusable="false">
      <path d="M0 18 18 0h52l18 18v52L70 88H18L0 70Z" />
    </svg>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "quiet";
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

/** Mono section label with the octagon marker, e.g. "How it works". */
export function Label({ children, index }: { children: ReactNode; index?: string }) {
  return (
    <p className="label">
      <Octagon />
      {index && <span className="label-index">{index}</span>}
      <span>{children}</span>
    </p>
  );
}

/** A real product screen set in a chamfered glass pane, with the lit facet across its upper-left half. */
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
        <span className="sheen" aria-hidden="true" />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
