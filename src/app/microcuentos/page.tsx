import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/content";
import { getPosts } from "@/lib/stories";

export const metadata: Metadata = { title: "Terraza de los microcuentos" };
export const dynamic = "force-dynamic";

export default async function Microcuentos() {
  const posts = await getPosts({ section: "microcuento" });
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Terraza de los microcuentos</h1>
        <p className="lead">Historias breves, para leer de pie.</p>
      </header>
      {posts.length === 0 ? (
        <p className="empty-note">Pronto habrá microcuentos aquí.</p>
      ) : (
        <ul className="posts">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/microcuentos/${p.slug}`}>
                <h2>{p.title}</h2>
                <p className="meta">{formatDate(p.date)}</p>
                <p className="excerpt">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
