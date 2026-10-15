import type { Metadata } from "next";
import { INSTAGRAM } from "@/lib/content";

export const metadata: Metadata = { title: "Cuarto de contacto" };

export default function Contacto() {
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <p className="eyebrow">Cuarto de contacto</p>
        <h1>Para críticas, sugerencias y gritos</h1>
      </header>
      <div className="contact-cards">
        <a className="contact-card" href="mailto:omaroliden1@gmail.com">
          <span aria-hidden>✉</span>
          <strong>Correo</strong>
          <small>omaroliden1@gmail.com</small>
        </a>
        <a className="contact-card" href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer">
          <span aria-hidden>◎</span>
          <strong>Instagram</strong>
          <small>@{INSTAGRAM}</small>
        </a>
      </div>
    </div>
  );
}
