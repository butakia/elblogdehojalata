import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReaderTools from "@/components/ReaderTools";
import { allStories, bodyWithoutCover, formatDate, getStory, neighbours, AUTHOR } from "@/lib/content";

export function generateStaticParams() {
  return allStories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const story = getStory((await params).slug);
  if (!story) return {};
  return { title: story.title, description: story.excerpt, openGraph: { title: story.title, description: story.excerpt, images: story.cover ? [story.cover] : undefined } };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const story = getStory((await params).slug);
  if (!story) notFound();
  const { newer, older } = neighbours(story.slug);

  return (
    <article className="story">
      <ReaderTools />
      {story.cover && (
        <div className="story-cover">
          <Image src={story.cover} alt="" fill priority sizes="100vw" />
        </div>
      )}
      <header className="story-head">
        <p className="meta"><span className="chip">{story.kind}</span> {story.minutes} min de lectura · {formatDate(story.date)}</p>
        <h1>{story.title}</h1>
        <p className="byline">Por {AUTHOR}</p>
      </header>
      <div className="prose story-body" dangerouslySetInnerHTML={{ __html: bodyWithoutCover(story.html, story.cover) }} />
      <nav className="story-nav" aria-label="Más cuentos">
        {older ? (
          <Link href={`/cuentos/${older.slug}`}><small>← Anterior</small>{older.title}</Link>
        ) : <span />}
        {newer ? (
          <Link href={`/cuentos/${newer.slug}`} className="next"><small>Siguiente →</small>{newer.title}</Link>
        ) : <span />}
      </nav>
      <p className="back"><Link href="/cuentos">Volver al salón de los cuentos</Link></p>
    </article>
  );
}
