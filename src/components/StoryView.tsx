import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReaderTools from "@/components/ReaderTools";
import ViewCounter from "@/components/ViewCounter";
import CommentForm from "@/components/CommentForm";
import ShareButtons from "@/components/ShareButtons";
import { AUTHOR, AUTHOR_PHOTO, bodyWithoutCover, formatDate } from "@/lib/content";
import { getPosts, getStories, getStory, neighbours, type Section } from "@/lib/stories";
import { getComments } from "@/lib/comments";
import { isAdmin } from "@/lib/auth";
import { simulatedViews } from "@/lib/views";

const dateTime = (iso: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

const LABELS = {
  cuento: { base: "/cuentos", back: "Volver a los cuentos" },
  textamento: { base: "/textamentos", back: "Volver a Textamentos" },
  ensayo: { base: "/ensayos", back: "Volver a la cocina de los ensayos" },
} as const;

/** Vista de lectura compartida por Cuentos y Textamentos. */
export default async function StoryView({ slug, section }: { slug: string; section: Section }) {
  const story = await getStory(slug);
  const admin = await isAdmin();
  const own: Section = story?.section === "textamento" || story?.section === "ensayo" ? story.section : "cuento";
  if (!story || own !== section || (story.draft && !admin)) notFound();
  const list = section === "cuento" ? await getStories() : await getPosts({ section });
  const { newer, older } = neighbours(list, story.slug);
  const comments = await getComments(story.slug);
  const { base, back } = LABELS[section];

  // Todo texto con imagen principal lleva un banner corto y difuminado arriba; ademas la imagen flota dentro del texto salvo que se elija "solo banner".
  const coverStyle = story.coverStyle ?? "right";
  const coverSize = story.coverSize ?? "m";
  const banner = !!story.cover;
  const floating = !!story.cover && coverStyle !== "banner";

  return (
    <article className="story">
      <ReaderTools />
      {banner && story.cover && (
        <div className="story-banner">
          <Image src={story.cover} alt="" fill priority sizes="100vw" />
        </div>
      )}
      <header className="story-head">
        {story.draft && <p className="draft-banner">Borrador: solo tú lo ves. <Link href={`/admin/editar/${story.slug}`}>Editar</Link></p>}
        <h1>{story.title}</h1>
        <p className="byline">{AUTHOR}</p>
        <p className="meta">
          {story.minutes} min de lectura · {formatDate(story.date)}
          {section === "cuento" && <> · <ViewCounter value={story.views ?? simulatedViews(story.slug, story.date)} /></>}
        </p>
      </header>
      <div className="prose story-body">
        {floating && story.cover && (
          <figure className={`img-${coverStyle} img-${coverSize}`}>
            <Image src={story.cover} alt="" width={640} height={640} sizes="(max-width: 720px) 45vw, 320px" priority />
          </figure>
        )}
        <div dangerouslySetInnerHTML={{ __html: floating ? bodyWithoutCover(story.html, story.cover) : story.html }} />
      </div>
      <hr className="story-end" aria-hidden />
      <div className="story-share"><ShareButtons title={story.title} /></div>
      <nav className="story-nav" aria-label="Más textos">
        {older ? (
          <Link href={`${base}/${older.slug}`}><small>← Anterior</small><span className="nt">{older.title}</span></Link>
        ) : <span />}
        {newer ? (
          <Link href={`${base}/${newer.slug}`} className="next"><small>Siguiente →</small><span className="nt">{newer.title}</span></Link>
        ) : <span />}
      </nav>

      <div className="explore">
        <Link href="/" className="btn small subtle">Explorar El blog de Hojalata</Link>
      </div>

      <section className="comments" aria-labelledby="comentarios">
        <h2 id="comentarios">Comentarios {comments.length > 0 && <small>({comments.length})</small>}</h2>
        <p className="empty-note">Apreciaría que me dejes un comentario.</p>
        <ol className="comment-list">
          {comments.map((c) => (
            <li key={c.id}>
              <span className="avatar" aria-hidden>{c.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <p className="who">
                  <strong>{c.name}</strong> <time dateTime={c.date}>{dateTime(c.date)}</time>
                </p>
                <p className="said">{c.text}</p>
                {c.reply && (
                  <div className="reply">
                    <Image src={AUTHOR_PHOTO} alt="" width={64} height={64} className="avatar photo" />
                    <div>
                      <p className="who">
                        <strong>{AUTHOR}</strong> <span className="badge">(autor)</span> <time dateTime={c.reply.date}>{dateTime(c.reply.date)}</time>
                      </p>
                      <p className="said">{c.reply.text}</p>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <CommentForm slug={story.slug} />
      </section>
      <p className="back"><Link href={base}>{back}</Link></p>
    </article>
  );
}
