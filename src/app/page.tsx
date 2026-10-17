import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";
import { getStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recent = (await getStories()).slice(0, 6);

  return (
    <>
      <div className="wrap">
        <div className="banner">
          <Image src="/img/2021-06-elgatokesonrie.png" alt="El blog de Hojalata: y el gato que sonríe en la copa del abeto del relato" width={1400} height={225} priority sizes="(max-width: 1040px) 100vw, 1040px" />
        </div>
      </div>

      <section className="wrap intro">
        <h1>Saludos, visitante</h1>
        <p>
          Te invito a recorrer esta casa de hojalata y descubrir algunos de los textos que alojo celosamente en los <Link href="/cuentos">cuentos</Link>. También puedes conocer mis <Link href="/libros">libros</Link>.
        </p>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Últimos cuentos</h2>
          <Link href="/cuentos">Ver todos</Link>
        </div>
        <ul className="link-list">
          {recent.map((s) => (
            <li key={s.slug}>
              <Link href={`/cuentos/${s.slug}`}>
                <strong>{s.title}</strong>
                <span>{formatDate(s.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
