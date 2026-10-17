import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AUTHOR, AUTHOR_PHOTO, CONTACT_EMAIL, INSTAGRAM } from "@/lib/content";

export const metadata: Metadata = { title: "Sobre mí" };

export default function Sobre() {
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Sobre mí</h1>
      </header>
      <div className="about">
        <Image src={AUTHOR_PHOTO} alt={AUTHOR} width={440} height={440} className="about-photo" sizes="220px" priority />
        <div>
          <p>
            Soy {AUTHOR} (Angel Omar Oliden Pacherrez). Escribo cuentos y también dibujo. Este blog nació en 2019 como una casa de hojalata para guardar mis textos, y en él conviven el humor, la ironía y la ternura de lo cotidiano.
          </p>
          <p>
            He publicado <em>Un padre temporal y otros cuentos</em> y <em>La flor y el bastardo</em>. Puedes conocerlos en la sección de <Link href="/libros">libros</Link>.
          </p>
          <p>
            Construí esta morada junto a la de mi vecino{" "}
            <a href="https://javierbanchii.wordpress.com/" target="_blank" rel="noopener noreferrer">Javier Banchii</a>, quien también exhibe sus escritos.
          </p>
          <div className="contact">
            <p>
              Para críticas, sugerencias y gritos: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <p>
              Instagram: <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer">@{INSTAGRAM}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
