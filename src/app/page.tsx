import Link from "next/link";
import Image from "next/image";
import StoryCard from "@/components/StoryCard";
import { allStories, formatDate, LOGO, microcuentos, drawings } from "@/lib/content";

export default function Home() {
  const featured = allStories[0];
  const latest = allStories.slice(1, 7);
  const micro = microcuentos.items[0];

  return (
    <>
      <section className="hero">
        <div className="hero-art">
          <Image src={LOGO} alt="Un gato de Cheshire a rayas sonríe, dibujado con tinta sepia" width={520} height={520} priority sizes="(max-width: 760px) 70vw, 420px" />
        </div>
        <div className="hero-text">
          <p className="eyebrow">Saludos, visitante</p>
          <h1>
            Una casa de <em>hojalata</em> donde alojo mis cuentos
          </h1>
          <p className="lead">Recorre el salón de los cuentos, asómate al balcón de los microcuentos o revisa mis bocetos en la cochera. El gato ya te vio llegar.</p>
          <div className="actions">
            <Link href="/cuentos" className="btn primary">Entrar al salón</Link>
            <Link href="/dibujos" className="btn">Ver dibujos</Link>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Lo último que escribí</h2>
          <Link href="/cuentos">Ver todos →</Link>
        </div>
        <Link href={`/cuentos/${featured.slug}`} className="featured">
          <div className="featured-cover">
            {featured.cover && <Image src={featured.cover} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" priority />}
          </div>
          <div className="featured-body">
            <p className="meta"><span className="chip">{featured.kind}</span> {featured.minutes} min · {formatDate(featured.date)}</p>
            <h3>{featured.title}</h3>
            <p className="excerpt">{featured.excerpt}</p>
            <span className="btn primary">Leer cuento</span>
          </div>
        </Link>
        <div className="grid">
          {latest.map((s) => (
            <StoryCard key={s.slug} story={s} />
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap section narrow">
          <p className="eyebrow">Balcón de los microcuentos</p>
          <h2>{micro.title}</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: micro.html }} />
          <Link href="/microcuentos" className="btn">Más microcuentos</Link>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Cochera de los dibujos</h2>
          <Link href="/dibujos">Ver galería →</Link>
        </div>
        <div className="strip">
          {drawings.slice(0, 6).map((d, i) => (
            <Link key={d.src} href="/dibujos" className="strip-item">
              <Image src={d.src} alt={`Dibujo ${i + 1}`} width={d.w} height={d.h} sizes="(max-width: 640px) 60vw, 240px" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
