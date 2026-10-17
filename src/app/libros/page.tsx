import type { Metadata } from "next";
import Image from "next/image";
import { BOOKS } from "@/lib/books";

export const metadata: Metadata = { title: "Libros" };

export default function Libros() {
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Libros</h1>
      </header>
      <div className="books">
        {BOOKS.map((b) => (
          <article key={b.slug} className="book" id={b.slug}>
            <Image src={b.cover} alt={`Portada de ${b.title}`} width={440} height={700} className="book-cover" sizes="130px" priority />
            <div>
              <h2>{b.title}</h2>
              {b.subtitle && <p className="sub">{b.subtitle}</p>}
              <div className="synopsis">
                {b.synopsis.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className={`stock ${b.physical ? "yes" : "no"}`}>
                Ejemplares físicos {b.physical ? "disponibles" : "no disponibles"}
              </p>
              <div className="book-actions">
                <a href={b.amazon} target="_blank" rel="noopener noreferrer" className="btn primary small">
                  Comprar ahora <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
