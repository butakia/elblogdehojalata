import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "./actions";
import { CommentActions, DeleteStoryButton } from "@/components/admin/DeleteButtons";
import { requireAdmin } from "@/lib/auth";
import { getAllComments } from "@/lib/comments";
import { allStories } from "@/lib/content";
import { getCustomStories } from "@/lib/stories";

import { storeKind } from "@/lib/store";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

const when = (iso: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default async function Admin() {
  await requireAdmin();
  const [mine, comments] = await Promise.all([getCustomStories(), getAllComments()]);
  const paths = new Map(mine.map((s) => [s.slug, s.section === "textamento" ? "textamentos" : "cuentos"]));
  const titles = new Map([...mine, ...allStories].map((s) => [s.slug, s.title]));
  const flat = Object.entries(comments)
    .flatMap(([slug, list]) => list.map((c) => ({ ...c, slug })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const volatile = !!process.env.VERCEL && storeKind === "file";

  return (
    <div className="wrap section">
      <header className="admin-head">
        <h1>Panel</h1>
        <div className="actions">
          <Link href="/admin/nuevo" className="btn primary">Nuevo cuento</Link>
          <Link href="/admin/nuevo?seccion=textamento" className="btn">Nuevo textamento</Link>
          <form action={logout}><button className="btn">Salir</button></form>
        </div>
      </header>

      {volatile && (
        <p className="notice">
          En Vercel falta conectar Upstash Redis y Vercel Blob; mientras tanto, lo que subas no será permanente. Mira el README.
        </p>
      )}

      <section className="admin-block">
        <h2>Mis publicaciones <small>({mine.length})</small></h2>
        {mine.length === 0 ? (
          <p className="empty-note">Aún no has publicado nada desde el panel. Los {allStories.length} del blog original ya están publicados.</p>
        ) : (
          <ul className="admin-list">
            {mine.map((s) => (
              <li key={s.slug}>
                <div className="grow">
                  <strong>{s.title}</strong>
                  <small>{s.section === "textamento" ? "Textamento" : "Cuento"} · {s.words} palabras{s.draft ? " · borrador" : ""}</small>
                </div>
                <div className="row-actions">
                  <Link href={`/${s.section === "textamento" ? "textamentos" : "cuentos"}/${s.slug}`}>Ver</Link>
                  <Link href={`/admin/editar/${s.slug}`}>Editar</Link>
                  <DeleteStoryButton slug={s.slug} title={s.title} />
                </div>
              </li>
            ))}
          </ul>
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
    </div>
  );
}
