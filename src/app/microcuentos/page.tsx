import type { Metadata } from "next";
import PostRow from "@/components/PostRow";
import { getPosts } from "@/lib/stories";

export const metadata: Metadata = { title: "Balcón de mis microcuentos" };
export const dynamic = "force-dynamic";

export default async function Microcuentos() {
  const posts = await getPosts({ section: "microcuento" });
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Balcón de mis microcuentos</h1>
        <p className="lead">Historias breves, para leer de pie.</p>
      </header>
      {posts.length === 0 ? (
        <p className="empty-note">Pronto habrá microcuentos aquí.</p>
      ) : (
        <ul className="posts">
          {posts.map((p) => (
            <PostRow key={p.slug} post={p} base="/microcuentos" showDate={false} />
          ))}
        </ul>
      )}
    </div>
  );
}
