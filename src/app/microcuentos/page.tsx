import type { Metadata } from "next";
import { microcuentos, allStories } from "@/lib/content";
import Link from "next/link";

export const metadata: Metadata = { title: "Balcón de los microcuentos" };

export default function Micro() {
  const short = allStories.filter((s) => s.kind === "microcuento");
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <p className="eyebrow">Balcón de los microcuentos</p>
        <h1>Para leer de pie</h1>
        <div className="lead prose" dangerouslySetInnerHTML={{ __html: microcuentos.intro.replace(/<figure>[\s\S]*?<\/figure>/g, "") }} />
      </header>
      {microcuentos.items.map((m) => (
        <section key={m.title} className="micro">
          <h2>{m.title}</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: m.html }} />
        </section>
      ))}
      <h2 className="subhead">Otros textos breves</h2>
      <ul className="link-list">
        {short.map((s) => (
          <li key={s.slug}>
            <Link href={`/cuentos/${s.slug}`}>
              <strong>{s.title}</strong>
              <span>{s.minutes} min</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
