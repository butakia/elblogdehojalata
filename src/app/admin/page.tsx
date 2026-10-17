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

const when = (iso: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
const KIND = { textamento: "Textamento", ensayo: "Ensayo" } as const;
const BASE = { textamento: "textamentos", ensayo: "ensayos" } as const;

export default async function Admin() {
  await requireAdmin();
  const [mine, comments, ideas] = await Promise.all([getCustomStories(), getAllComments(), getIdeas()]);
  const paths = new Map(mine.map((s) => [s.slug, s.section ? BASE[s.section as "textamento" | "ensayo"] : "cuentos"]));
  const titles = new Map([...mine, ...allStories].map((s) => [s.slug, s.title]));
  const flat = Object.entries(comments)
    .flatMap(([slug, list]) => list.map((c) => ({ ...c, slug })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const volatile = !!process.env.VERCEL && storeKind === "file";
  const sorted = [...mine].sort((a, b) => (b.updatedAt ?? b.date).localeCompare(a.updatedAt ?? a.date));
  const drafts = sorted.filter((s) => s.draft);
  const published = sorted.filter((s) => !s.draft);

  const Row = ({ s }: { s: (typeof mine)[number] }) => (
    <li key={s.slug}>
      <div className="grow">
        <strong>{s.title}</strong>
        <small>
          {s.section ? KIND[s.section as "textamento" | "ensayo"] : "Cuento"} · {s.words} palabras · editado {when(s.updatedAt ?? s.date)}
        </small>
      </div>
      <div className="row-actions">
        <Link href={`/${paths.get(s.slug)}/${s.slug}`}>{s.draft ? "Vista previa" : "Ver"}</Link>
        <Link href={`/admin/editar/${s.slug}`}>Editar</Link>
        <PublishToggle slug={s.slug} draft={!!s.draft} />
        <DeleteStoryButton slug={s.slug} title={s.title} />
      </div>
    </li>
  );

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
        <h2>Publicados <small>({published.length})</small></h2>
        {published.length === 0 ? (
          <p className="empty-note">Aún no has publicado nada desde el panel. Los {allStories.length} del blog original ya están publicados.</p>
        ) : (
          <ul className="admin-list">{published.map((s) => <Row key={s.slug} s={s} />)}</ul>
        )}
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
        <h2>Respaldo</h2>
        <p className="muted">Descarga una copia de todo lo que escribiste (textos, ideas, comentarios y papelera). Hazlo de vez en cuando.</p>
        <p><a className="btn" href="/api/admin/export?type=all">Descargar respaldo completo</a></p>
      </section>
    </div>
  );
}
