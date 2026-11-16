"use client";

import Link from "next/link";
import { trackClick } from "@/lib/trackClient";

/** Cierre de cada textamento: invita a seguir leyendo, con el título de otro textamento a la vista. Cuenta los clics. */
export default function MoreTextamentos({ items }: { items: { slug: string; title: string }[] }) {
  return (
    <section className="more-texts" aria-labelledby="mas-textamentos">
      <h2 id="mas-textamentos">¿Te gustaría leer otro textamento?</h2>
      <Link href="/textamentos" className="btn primary more-btn" onClick={() => trackClick("/textamentos", "boton")}>
        Leer más textamentos
      </Link>
      {items.length > 0 && (
        <ul className="more-cards">
          {items.map((it) => (
            <li key={it.slug}>
              <Link href={`/textamentos/${it.slug}`} onClick={() => trackClick(`/textamentos/${it.slug}`, "tarjeta")}>
                <small>Sigue leyendo</small>
                <span>{it.title}</span>
                <i aria-hidden>→</i>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
