import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/content";
import { getPosts } from "@/lib/stories";

export const metadata: Metadata = { title: "Textamentos" };
export const dynamic = "force-dynamic";

export default async function Textamentos() {
  const posts = await getPosts();
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Textamentos</h1>
        <p className="lead">Pensamientos, proyectos y notas fuera de los cuentos.</p>
      </header>
      {posts.length === 0 ? (
        <p className="empty-note">Aún no hay textos aquí. Pronto habrá novedades.</p>
      ) : (
        <ul className="posts">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/textamentos/${p.slug}`}>
                <h2>{p.title}</h2>
                <p className="meta">{formatDate(p.date)} · {p.minutes} min</p>
                <p className="excerpt">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
