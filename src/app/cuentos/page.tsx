import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { allStories } from "@/lib/content";

export const metadata: Metadata = { title: "Salón de los cuentos" };

export default function Cuentos() {
  return (
    <div className="wrap section">
      <header className="page-head">
        <p className="eyebrow">Salón de los cuentos</p>
        <h1>Textos que alojo celosamente</h1>
        <p className="lead">{allStories.length} historias entre cuentos y microcuentos. Elige una y ponte cómodo.</p>
      </header>
      <StoryBrowser stories={allStories} />
    </div>
  );
}
