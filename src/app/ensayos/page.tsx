import type { Metadata } from "next";
import PostRow from "@/components/PostRow";
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
            <PostRow key={p.slug} post={p} base="/ensayos" />
          ))}
        </ul>
      )}
    </div>
  );
}
