import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/content";
import { getPosts } from "@/lib/stories";

export const metadata: Metadata = { title: "Cocina de los ensayos" };
export const dynamic = "force-dynamic";

export default async function Ensayos() {
  const posts = await getPosts({ section: "ensayo" });
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Cocina de los ensayos</h1>
        <p className="lead">Ideas que se cuecen a fuego lento.</p>
      </header>
      {posts.length === 0 ? (
        <p className="empty-note">Aún no hay ensayos. El primero se está cocinando.</p>
      ) : (
        <ul className="posts">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/ensayos/${p.slug}`}>
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
