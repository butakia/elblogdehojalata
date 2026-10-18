import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "./actions";
import { CommentActions, DeleteStoryButton, PublishToggle } from "@/components/admin/DeleteButtons";
import { requireAdmin } from "@/lib/auth";
import { getAllComments } from "@/lib/comments";
import { allStories } from "@/lib/content";
import { getIdeas } from "@/lib/ideas";
import { getCustomStories } from "@/lib/stories";
import { storeKind } from "@/lib/store";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

const when = (iso: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(iso));
const KIND = { textamento: "Textamento", ensayo: "Ensayo", microcuento: "Microcuento" } as const;
const BASE = { textamento: "textamentos", ensayo: "ensayos", microcuento: "microcuentos" } as const;

function Thumb({ src, title }: { src: string | null; title: string }) {
  return (
    <span className={`mini-thumb ${src ? "" : "blank"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" loading="lazy" /> : <b>{title.slice(0, 1)}</b>}
    </span>
  );
}

export default async function Admin() {
  await requireAdmin();
  const [mine, comments, ideas] = await Promise.all([getCustomStories(), getAllComments(), getIdeas()]);
  const baseSlugs = new Set(allStories.map((s) => s.slug));
  const mineSlugs = new Set(mine.map((s) => s.slug));
  const originals = allStories.filter((s) => !mineSlugs.has(s.slug));
  const paths = new Map(mine.map((s) => [s.slug, s.section ? BASE[s.section as keyof typeof BASE] : "cuentos"]));
  const titles = new Map([...allStories, ...mine].map((s) => [s.slug, s.title]));
  const flat = Object.entries(comments)
    .flatMap(([slug, list]) => list.map((c) => ({ ...c, slug })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const volatile = !!process.env.VERCEL && storeKind === "file";
  const sorted = [...mine].sort((a, b) => (b.updatedAt ?? b.date).localeCompare(a.updatedAt ?? a.date));
  const drafts = sorted.filter((s) => s.draft);
  const published = sorted.filter((s) => !s.draft);

  const Row = ({ s }: { s: (typeof mine)[number] }) => {
    const isOriginal = baseSlugs.has(s.slug);
    return (
      <li key={s.slug}>
        <Thumb src={s.cover} title={s.title} />
        <div className="grow">
          <strong>{s.title}</strong>
          <small>
            {s.section ? KIND[s.section as keyof typeof KIND] : isOriginal ? "Cuento original editado" : "Cuento"} · {s.words} palabras · editado {when(s.updatedAt ?? s.date)}
          </small>
        </div>
        <div className="row-actions">
          <Link href={`/${paths.get(s.slug)}/${s.slug}`}>{s.draft ? "Vista previa" : "Ver"}</Link>
          <Link href={`/admin/editar/${s.slug}`}>Editar</Link>
          <PublishToggle slug={s.slug} draft={!!s.draft} />
          <DeleteStoryButton slug={s.slug} title={s.title} restore={isOriginal} />
        </div>
      </li>
    );
  };

  return (
    <div className="wrap section">
      <header className="admin-head">
        <h1>Panel</h1>
        <div className="actions">
          <form action={logout}><button className="btn">Salir</button></form>
        </div>
      </header>

      <div className="admin-actions">
        <Link href="/admin/nuevo" className="btn primary">Nuevo cuento</Link>
        <Link href="/admin/nuevo?seccion=textamento" className="btn">Nuevo textamento</Link>
        <Link href="/admin/nuevo?seccion=microcuento" className="btn">Nuevo microcuento</Link>
        <Link href="/admin/nuevo?seccion=ensayo" className="btn">Nuevo ensayo</Link>
        <Link href="/admin/ideas" className="btn">Ideas ({ideas.length})</Link>
      </div>

      {volatile && (
        <p className="notice">
          En Vercel falta conectar Upstash Redis y Vercel Blob; mientras tanto, lo que subas no será permanente. Mira el README.
        </p>
      )}

      <section className="admin-block">
        <h2>Borradores <small>({drafts.length})</small></h2>
        {drafts.length === 0 ? (
          <p className="empty-note">No tienes borradores. Lo que escribas se autoguarda aquí.</p>
        ) : (
          <ul className="admin-list">{drafts.map((s) => <Row key={s.slug} s={s} />)}</ul>
        )}
      </section>

      <section className="admin-block">
        <h2>Publicados desde el panel <small>({published.length})</small></h2>
        {published.length === 0 ? (
          <p className="empty-note">Aún no has publicado ni editado nada desde el panel.</p>
        ) : (
          <ul className="admin-list">{published.map((s) => <Row key={s.slug} s={s} />)}</ul>
        )}
      </section>

      <section className="admin-block">
        <h2>Cuentos del blog original <small>({originals.length})</small></h2>
        <p className="muted">Puedes editar el texto, el título y la imagen o miniatura de cualquiera de ellos. Al guardar, se crea tu versión y el original queda a salvo.</p>
        <ul className="admin-list">
          {originals.map((s) => (
            <li key={s.slug}>
              <Thumb src={s.cover} title={s.title} />
              <div className="grow">
                <strong>{s.title}</strong>
                <small>{s.cover ? "Con imagen" : "Sin imagen"} · {s.words} palabras</small>
              </div>
              <div className="row-actions">
                <Link href={`/cuentos/${s.slug}`}>Ver</Link>
                <Link href={`/admin/editar/${s.slug}`}>Editar</Link>
                <PublishToggle slug={s.slug} draft={false} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-block">
        <h2>Comentarios <small>({flat.length})</small></h2>
        {flat.length === 0 ? (
          <p className="empty-note">Aún no hay comentarios.</p>
        ) : (
          <ul className="admin-list">
            {flat.map((c) => (
              <li key={c.id} style={{ flexWrap: "wrap" }}>
                <div className="grow">
                  <strong>{c.name}</strong> en <Link href={`/${paths.get(c.slug) ?? "cuentos"}/${c.slug}#comentarios`}>{titles.get(c.slug) ?? c.slug}</Link>
                  <small>{when(c.date)}</small>
                  <p className="said">{c.text}</p>
                  {c.reply && (
                    <div className="reply-box">
                      <strong>Tu respuesta</strong>
                      {c.reply.text}
                    </div>
                  )}
                </div>
                <CommentActions slug={c.slug} id={c.id} reply={c.reply} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-block">
        <h2>Conexiones</h2>
        <ul className="status-list">
          <li className={storeKind === "redis" ? "yes" : "no"}>
            Textos, ideas y comentarios: {storeKind === "redis" ? "guardados en Redis (permanente)" : "guardados en un archivo local (solo para pruebas)"}
          </li>
          <li className={process.env.BLOB_READ_WRITE_TOKEN ? "yes" : "no"}>
            Imágenes subidas: {process.env.BLOB_READ_WRITE_TOKEN ? "guardadas en Vercel Blob (permanente)" : "guardadas en una carpeta local (solo para pruebas)"}
          </li>
          <li className={process.env.ADMIN_PASSWORD ? "yes" : "no"}>
            Clave del panel: {process.env.ADMIN_PASSWORD ? "definida en el servidor" : "clave de desarrollo (cámbiala antes de publicar)"}
          </li>
        </ul>
      </section>

      <section className="admin-block">
        <h2>Respaldo</h2>
        <p className="muted">Descarga una copia de todo lo que escribiste (textos, ideas, comentarios y papelera). Hazlo de vez en cuando.</p>
        <p><a className="btn" href="/api/admin/export?type=all">Descargar respaldo completo</a></p>
      </section>
    </div>
  );
}
