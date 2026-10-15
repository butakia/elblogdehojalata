import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReaderTools from "@/components/ReaderTools";
import ViewCounter from "@/components/ViewCounter";
import CommentForm from "@/components/CommentForm";
import { bodyWithoutCover, formatDate, AUTHOR } from "@/lib/content";
import { getStories, getStory, neighbours } from "@/lib/stories";
import { getComments } from "@/lib/comments";
import { isAdmin } from "@/lib/auth";
import { simulatedViews } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const story = await getStory((await params).slug);
  if (!story) return {};
  return { title: story.title, description: story.excerpt, openGraph: { title: story.title, description: story.excerpt, images: story.cover ? [story.cover] : undefined } };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);
  const admin = await isAdmin();
  if (!story || (story.draft && !admin)) notFound();
  const { newer, older } = neighbours(await getStories(), story.slug);
  const comments = await getComments(story.slug);

  return (
    <article className="story">
      <ReaderTools />
      {story.cover && (
        <div className="story-cover">
          <Image src={story.cover} alt="" fill priority sizes="100vw" />
        </div>
      )}
      <header className={`story-head ${story.cover ? "" : "no-cover"}`}>
        {story.draft && <p className="draft-banner">Borrador: solo tú lo ves. <Link href={`/admin/editar/${story.slug}`}>Editar</Link></p>}
        <p className="meta">
          <span className="chip">{story.kind}</span> {story.minutes} min de lectura · {formatDate(story.date)} · <ViewCounter value={simulatedViews(story.slug, story.date)} />
        </p>
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

      <section className="comments" aria-labelledby="comentarios">
        <h2 id="comentarios">Comentarios {comments.length > 0 && <small>({comments.length})</small>}</h2>
        {comments.length === 0 && <p className="empty-note">Aún nadie ha dejado huellas. Sé el primero, sin registrarte.</p>}
        <ol className="comment-list">
          {comments.map((c) => (
            <li key={c.id}>
              <span className="avatar" aria-hidden>{c.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <p className="who">
                  <strong>{c.name}</strong> <time dateTime={c.date}>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(c.date))}</time>
                </p>
                <p className="said">{c.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <CommentForm slug={story.slug} />
      </section>
      <p className="back"><Link href="/cuentos">Volver al salón de los cuentos</Link></p>
    </article>
  );
}
