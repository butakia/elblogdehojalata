import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryForm from "@/components/admin/StoryForm";
import { requireAdmin } from "@/lib/auth";
import { allStories, bodyWithoutCover } from "@/lib/content";
import { getCustomStories, getWip, type StoredStory } from "@/lib/stories";

export const metadata: Metadata = { title: "Editar", robots: { index: false } };
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

export default async function Editar({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  // Textos del panel o cuentos originales del blog (que se editan creando una copia propia al guardar)
  const found = (await getCustomStories()).find((s) => s.slug === slug) ?? allStories.find((s) => s.slug === slug);
  if (!found) notFound();
  const story = found as typeof found & Partial<Pick<StoredStory, "draft" | "section" | "coverStyle" | "coverSize" | "updatedAt">>;
  const draft = !!story.draft;
  const section = story.section ?? "cuento";

  // Si la imagen flotaba al inicio por la configuración anterior, pasa a ser una imagen más del texto:
  // así se puede mover a cualquier parte, cambiar de tamaño y ver cómo se adapta el texto.
  let html = story.html === "<p></p>" ? "" : story.html;
  const legacyFloat = !!story.cover && (story.coverStyle ?? "right") !== "banner";
  if (legacyFloat && story.cover) {
    const style = story.coverStyle ?? "right";
    html = `<figure class="img-${style} img-${story.coverSize ?? "m"}"><img src="${esc(story.cover)}" alt=""></figure>` + bodyWithoutCover(html, story.cover);
  }

  const wip = await getWip(slug);
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>{draft ? "Editar borrador" : "Editar"}</h1>
      </header>
      <StoryForm
        section={section}
        story={{
          slug: story.slug,
          title: story.title === "Sin título" ? "" : story.title,
          html,
          cover: story.cover,
          draft,
          coverStyle: "banner",
          coverSize: story.coverSize ?? "m",
          updatedAt: story.updatedAt ?? story.date,
        }}
        wip={wip ? { title: wip.title, html: wip.html, cover: wip.cover, coverStyle: "banner", coverSize: wip.coverSize, savedAt: wip.savedAt } : null}
      />
    </div>
  );
}
