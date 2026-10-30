import type { Metadata } from "next";
import PostRow from "@/components/PostRow";
import { getPosts } from "@/lib/stories";

export const metadata: Metadata = { title: "Textamentos", description: "Pensamientos, proyectos y notas fuera de los cuentos." };
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
            <PostRow key={p.slug} post={p} base="/textamentos" />
          ))}
        </ul>
      )}
    </div>
  );
}
