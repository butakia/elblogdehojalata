import Link from "next/link";
import Image from "next/image";
import HomeCards from "@/components/HomeCards";
import { formatDate } from "@/lib/content";
import { getPosts, getStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stories, posts] = await Promise.all([getStories(), getPosts()]);

  return (
    <>
      <div className="wrap">
        <div className="banner">
          <Image src="/img/2021-06-elgatokesonrie.png" alt="El blog de Hojalata: y el gato que sonríe en la copa del abeto del relato" width={1400} height={225} priority sizes="(max-width: 1040px) 100vw, 1040px" />
        </div>
      </div>

      <section className="wrap intro">
        <h1>Saludos, visitante</h1>
        <p>Te invito a recorrer esta casa de hojalata y descubrir algunos de los textos que alojo celosamente en ella.</p>
      </section>

      <section className="wrap">
        <HomeCards />
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
    </>
  );
}
