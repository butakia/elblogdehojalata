import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "./actions";
import { DeleteCommentButton, DeleteStoryButton } from "@/components/admin/DeleteButtons";
import { requireAdmin } from "@/lib/auth";
import { getAllComments } from "@/lib/comments";
import { allStories } from "@/lib/content";
import { getCustomStories } from "@/lib/stories";
import { storeKind } from "@/lib/store";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  await requireAdmin();
  const [mine, comments] = await Promise.all([getCustomStories(), getAllComments()]);
  const titles = new Map([...mine, ...allStories].map((s) => [s.slug, s.title]));
  const flat = Object.entries(comments)
    .flatMap(([slug, list]) => list.map((c) => ({ ...c, slug })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const volatile = !!process.env.VERCEL && storeKind === "file";

  return (
    <div className="wrap section">
      <header className="page-head admin-head">
        <div>
          <p className="eyebrow">Panel de la casa</p>
          <h1>Bienvenido, hombre de hojalata</h1>
        </div>
        <div className="actions">
          <Link href="/admin/nuevo" className="btn primary">+ Nuevo cuento</Link>
          <form action={logout}><button className="btn">Salir</button></form>
        </div>
      </header>

      {volatile && (
        <p className="notice">
          Atención: en Vercel falta conectar una base de datos (Upstash Redis) y Vercel Blob. Mientras tanto, lo que subas no será permanente. Mira el README.
        </p>
      )}

      <section className="admin-block">
        <h2>Mis cuentos subidos <small>({mine.length})</small></h2>
        {mine.length === 0 ? (
          <p className="empty-note">Todavía no has subido ninguno desde el panel. Los {allStories.length} cuentos del blog original ya están en la casa.</p>
        ) : (
          <ul className="admin-list">
            {mine.map((s) => (
              <li key={s.slug}>
                <div>
                  <strong>{s.title}</strong>
                  <small>{s.kind} · {s.words} palabras {s.draft && <span className="chip">borrador</span>}</small>
                </div>
                <div className="row-actions">
                  <Link href={`/cuentos/${s.slug}`}>Ver</Link>
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
              <li key={c.id}>
                <div>
                  <strong>{c.name}</strong> en <Link href={`/cuentos/${c.slug}#comentarios`}>{titles.get(c.slug) ?? c.slug}</Link>
                  <small>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(c.date))}</small>
                  <p className="said">{c.text}</p>
                </div>
                <div className="row-actions"><DeleteCommentButton slug={c.slug} id={c.id} /></div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
