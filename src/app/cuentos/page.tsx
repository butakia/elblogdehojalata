import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { isLockedSlug } from "@/lib/locked";
import { getStories } from "@/lib/stories";

export const metadata: Metadata = { title: "Cuentos" };
export const dynamic = "force-dynamic";

export default async function Cuentos() {
  // Al navegador solo llega lo necesario para las tarjetas: nunca el texto completo ni el resumen de los cuentos con contraseña
  const stories = (await getStories({ withMicro: true })).map((s) => {
    const locked = isLockedSlug(s.slug);
    return { slug: s.slug, title: s.title, cover: s.cover, excerpt: locked ? "" : s.excerpt, minutes: s.minutes, kind: s.kind, date: s.date, section: s.section, locked };
  });
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Cuentos</h1>
        <p className="lead">{stories.length} textos entre cuentos y microcuentos.</p>
      </header>
      <StoryBrowser stories={stories} />
    </div>
  );
}
