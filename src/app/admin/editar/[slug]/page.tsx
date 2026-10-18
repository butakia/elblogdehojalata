import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryForm from "@/components/admin/StoryForm";
import { requireAdmin } from "@/lib/auth";
import { allStories } from "@/lib/content";
import { getCustomStories, getWip, type StoredStory } from "@/lib/stories";

export const metadata: Metadata = { title: "Editar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Editar({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  // Textos del panel o cuentos originales del blog (que se editan creando una copia propia al guardar)
  const found = (await getCustomStories()).find((s) => s.slug === slug) ?? allStories.find((s) => s.slug === slug);
  if (!found) notFound();
  const story = found as typeof found & Partial<Pick<StoredStory, "draft" | "section" | "coverStyle" | "coverSize" | "updatedAt">>;
  const draft = !!story.draft;
  const section = story.section ?? "cuento";
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
          html: story.html === "<p></p>" ? "" : story.html,
          cover: story.cover,
          draft,
          coverStyle: story.coverStyle ?? "right",
          coverSize: story.coverSize ?? "m",
          updatedAt: story.updatedAt ?? story.date,
        }}
        wip={wip ? { title: wip.title, html: wip.html, cover: wip.cover, coverStyle: wip.coverStyle, coverSize: wip.coverSize, savedAt: wip.savedAt } : null}
      />
    </div>
  );
}
