import type { Metadata } from "next";
import GateForm from "@/components/GateForm";
import PostRow from "@/components/PostRow";
import { isUnlocked } from "@/lib/gate";
import { getPosts } from "@/lib/stories";

export const metadata: Metadata = { title: "Textamentos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Textamentos() {
  if (!(await isUnlocked())) {
    return (
      <div className="wrap section narrow" style={{ textAlign: "center" }}>
        <h1>Textamentos</h1>
        <p className="lead" style={{ marginInline: "auto" }}>Si leer mis secretos quieres, escribir la contraseña debes.</p>
        <GateForm next="/textamentos" />
      </div>
    );
  }
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
