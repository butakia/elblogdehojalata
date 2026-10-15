import Link from "next/link";
import Image from "next/image";
import House, { ROOMS } from "@/components/House";
import { formatDate } from "@/lib/content";
import { getStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recent = (await getStories()).slice(0, 5);

  return (
    <>
      <div className="wrap">
        <div className="banner">
          <Image src="/img/2021-06-elgatokesonrie.png" alt="El blog de Hojalata: y el gato que sonríe en la copa del abeto del relato" width={1400} height={225} priority sizes="(max-width: 1120px) 100vw, 1120px" />
        </div>
      </div>

      <section className="wrap welcome">
        <div className="welcome-text">
          <p className="eyebrow">Saludos, visitante</p>
          <h1>Esta es una casa de hojalata</h1>
          <p>
            Te invito a recorrerla y descubrir algunos de los textos que alojo celosamente en el <Link href="/cuentos">salón de los cuentos</Link>.
          </p>
          <p>
            También puedes mirar mis bocetos e ilustraciones en la <Link href="/dibujos">cochera de los dibujos</Link>.
          </p>
          <p className="aside">
            Todo sea dicho, construí esta morada junto a la de mi vecino{" "}
            <a href="https://javierbanchii.wordpress.com/" target="_blank" rel="noopener noreferrer">Javier Banchii</a>, quien también exhibe sus escritos.
          </p>
        </div>
        <div className="welcome-house">
          <House />
          <p className="hint">Toca una puerta o una ventana para entrar.</p>
        </div>
      </section>

      <section className="wrap section rooms-section">
        <h2>Las habitaciones</h2>
        <ul className="rooms">
          {ROOMS.map((r) => (
            <li key={r.href}>
              <Link href={r.href}>
                <strong>{r.name}</strong>
                <span>{r.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section narrow">
        <h2>Lo último que dejé en la casa</h2>
        <ul className="link-list recent">
          {recent.map((s) => (
            <li key={s.slug}>
              <Link href={`/cuentos/${s.slug}`}>
                <strong>{s.title}</strong>
                <span>{s.kind} · {formatDate(s.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="more"><Link href="/cuentos">Pasar al salón →</Link></p>
      </section>
    </>
  );
}
