import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AUTHOR, INSTAGRAM, LOGO } from "@/lib/content";

export const metadata: Metadata = { title: "Sobre la casa" };

export default function Sobre() {
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <p className="eyebrow">Saludos, visitante</p>
        <h1>Sobre esta casa</h1>
      </header>
      <Image src={LOGO} alt="" width={260} height={260} className="about-cat" />
      <div className="prose">
        <p>
          Te invito a recorrer esta casa de hojalata y descubrir algunos de los textos que alojo celosamente en el <Link href="/cuentos">salón de los cuentos</Link>.
        </p>
        <p>
          También puedes mirar mis bocetos e ilustraciones en la <Link href="/dibujos">cochera de los dibujos</Link>.
        </p>
        <p>
          Soy {AUTHOR}, y firmo como el hombre de hojalata (<a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer">@{INSTAGRAM}</a>). Todo sea dicho, construí esta morada junto a la de mi vecino{" "}
          <a href="https://javierbanchii.wordpress.com/" target="_blank" rel="noopener noreferrer">Javier Banchii</a>, quien también exhibe sus escritos.
        </p>
        <p>
          Mi libro <em>La flor y el bastardo</em> está disponible en Amazon.
        </p>
      </div>
    </div>
  );
}
