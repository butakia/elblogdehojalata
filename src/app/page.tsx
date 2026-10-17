import Link from "next/link";
import Image from "next/image";
import RoomsCarousel from "@/components/RoomsCarousel";
import StoryRow from "@/components/StoryRow";
import { BOOKS } from "@/lib/books";
import { getPosts, getStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

const ROOMS = [
  { href: "/cuentos", name: "Salón de los cuentos" },
  { href: "/libros", name: "Balcón de los libros" },
  { href: "/textamentos", name: "Jardín de los textamentos" },
  { href: "/ensayos", name: "Cocina de los ensayos" },
  { href: "/proyectos", name: "Cochera de los proyectos" },
  { href: "/sobre", name: "Cuarto del autor" },
];

export default async function Home() {
  const [stories, posts] = await Promise.all([getStories(), getPosts()]);

  return (
    <>
      <section className="wrap hero">
        <div className="hero-art">
          <Image src="/img/gato-blanco.png" alt="Un gato de Cheshire sonríe, dibujado a tinta" width={900} height={872} priority className="art-dark" sizes="(max-width: 720px) 130px, 230px" />
          <Image src="/img/gato-tinta.png" alt="" aria-hidden width={900} height={872} className="art-light" loading="eager" sizes="(max-width: 720px) 130px, 230px" />
        </div>
        <div>
          <h1>Saludos, visitante</h1>
          <p className="greet">Te invito a recorrer esta casa de hojalata y descubrir algunos de los textos que alojo celosamente en ella.</p>
        </div>
      </section>

      <section className="wrap" style={{ paddingBlock: "1.2rem 0.5rem" }}>
        <RoomsCarousel rooms={ROOMS} />
      </section>

      <section className="wrap section books-section">
        <div className="section-head">
          <h2>Mis libros</h2>
          <Link href="/libros">Ver libros</Link>
        </div>
        <div className="shelf">
          {BOOKS.map((b) => (
            <Link key={b.slug} href={`/libros#${b.slug}`}>
              <Image src={b.cover} alt={`Portada de ${b.title}`} width={300} height={440} sizes="(max-width: 720px) 104px, 190px" />
              <span>{b.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap section two-col" style={{ paddingTop: 0 }}>
        <div>
          <div className="section-head">
            <h2>Últimos cuentos</h2>
            <Link href="/cuentos">Ver todos</Link>
          </div>
          <ul className="link-list">
            {stories.slice(0, 5).map((s) => (
              <StoryRow key={s.slug} item={s} base="/cuentos" />
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
                <StoryRow key={p.slug} item={p} base="/textamentos" />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
