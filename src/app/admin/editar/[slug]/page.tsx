import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryForm from "@/components/admin/StoryForm";
import { requireAdmin } from "@/lib/auth";
import { getCustomStories, getWip } from "@/lib/stories";

export const metadata: Metadata = { title: "Editar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Editar({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const story = (await getCustomStories()).find((s) => s.slug === slug);
  if (!story) notFound();
  const wip = await getWip(slug);
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>{story.draft ? "Editar borrador" : "Editar"}</h1>
      </header>
      <StoryForm
        section={story.section ?? "cuento"}
        story={{
          slug: story.slug,
          title: story.title === "Sin título" ? "" : story.title,
          html: story.html === "<p></p>" ? "" : story.html,
          cover: story.cover,
          draft: !!story.draft,
          coverStyle: story.coverStyle ?? "right",
          coverSize: story.coverSize ?? "m",
          updatedAt: story.updatedAt ?? story.date,
        }}
        wip={wip ? { title: wip.title, html: wip.html, cover: wip.cover, coverStyle: wip.coverStyle, coverSize: wip.coverSize, savedAt: wip.savedAt } : null}
      />
    </div>
  );
}
