import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { getStories } from "@/lib/stories";

export const metadata: Metadata = { title: "Salón de los cuentos" };
export const dynamic = "force-dynamic";

export default async function Cuentos() {
  const stories = await getStories();
  return (
    <div className="wrap section">
      <header className="page-head">
        <p className="eyebrow">Salón de los cuentos</p>
        <h1>Textos que alojo celosamente</h1>
        <p className="lead">{stories.length} historias entre cuentos y microcuentos. Elige una y ponte cómodo.</p>
      </header>
      <StoryBrowser stories={stories} />
    </div>
  );
}
