import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";
import { BOOKS } from "@/lib/books";
import { getPosts, getStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stories, posts] = await Promise.all([getStories(), getPosts()]);

  return (
    <>
      <section className="wrap hero">
        <div className="hero-art">
          <Image src="/img/gato-blanco.png" alt="El blog de Hojalata: un gato de Cheshire sonríe" width={900} height={872} priority className="art-dark" sizes="(max-width: 520px) 78vw, 400px" />
          <Image src="/img/gato-tinta.png" alt="" aria-hidden width={900} height={872} className="art-light" loading="eager" sizes="(max-width: 520px) 78vw, 400px" />
        </div>
        <p className="tagline">y el gato que sonríe en la copa del abeto del relato</p>
        <h1>Saludos, visitante</h1>
        <p className="greet">Te invito a recorrer esta casa de hojalata y descubrir algunos de los textos que alojo celosamente en ella.</p>
      </section>

      <section className="wrap section two-col">
        <div>
          <div className="section-head">
            <h2>Últimos cuentos</h2>
            <Link href="/cuentos">Ver todos</Link>
          </div>
          <ul className="link-list">
            {stories.slice(0, 5).map((s) => (
              <li key={s.slug}>
                <Link href={`/cuentos/${s.slug}`}>
                  <strong>{s.title}</strong>
                  <span>{formatDate(s.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="section-head">
            <h2>Novedades</h2>
            <Link href="/textamentos">Textamentos</Link>
          </div>
          {posts.length === 0 ? (
            <p className="empty-note">Pronto habrá novedades en Textamentos.</p>
          ) : (
            <ul className="link-list">
              {posts.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link href={`/textamentos/${p.slug}`}>
                    <strong>{p.title}</strong>
                    <span>{formatDate(p.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head" style={{ justifyContent: "center" }}>
          <h2>Mis libros</h2>
        </div>
        <div className="shelf">
          {BOOKS.map((b) => (
            <Link key={b.slug} href={`/libros#${b.slug}`}>
              <Image src={b.cover} alt={`Portada de ${b.title}`} width={300} height={440} sizes="150px" />
              <span>{b.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
