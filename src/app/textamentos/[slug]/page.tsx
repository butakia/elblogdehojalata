import type { Metadata } from "next";
import GateForm from "@/components/GateForm";
import StoryView from "@/components/StoryView";
import { isUnlocked } from "@/lib/gate";

export const dynamic = "force-dynamic";

// Sección privada: las vistas previas no revelan título ni imagen
export const metadata: Metadata = { title: "Textamentos", description: "Secretos bajo contraseña.", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await isUnlocked())) {
    return (
      <div className="wrap section narrow" style={{ textAlign: "center" }}>
        <h1>Textamentos</h1>
        <p className="lead" style={{ marginInline: "auto" }}>Si leer mis secretos quieres, escribir la contraseña debes.</p>
        <GateForm next={`/textamentos/${slug}`} />
      </div>
    );
  }
  return <StoryView slug={slug} section="textamento" />;
}
