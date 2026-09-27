import type { Faq } from "@/content/faq";

export function Faqs({ items }: { items: Faq[] }) {
  return (
    <div className="faqs">
      {items.map((f) => (
        <details key={f.q} className="faq" data-reveal>
          <summary><span>{f.q}</span><i aria-hidden="true" /></summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
